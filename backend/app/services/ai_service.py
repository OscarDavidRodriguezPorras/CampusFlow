"""
Servicio de IA usando Groq + Llama 3.1.
Tres funciones reales que consultan la base de datos:
  1. chat_assistant  — asistente general de la plataforma
  2. triage_incident — clasifica categoría y prioridad de una incidencia
  3. recommend_space — recomienda espacios según la necesidad del usuario
"""
from groq import Groq
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.space import Space
from app.models.reservation import Reservation, ReservationStatus
from app.models.incident import Incident

# ── Cliente Groq ──────────────────────────────────────────────────────────────
def _get_client() -> Groq:
    if not settings.GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY no está configurada")
    return Groq(api_key=settings.GROQ_API_KEY)


def _chat(messages: list[dict], temperature: float = 0.4) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=messages,
        temperature=temperature,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()


# ── 1. Asistente general ──────────────────────────────────────────────────────
SYSTEM_PROMPT = """Eres el asistente inteligente de CampusFlow, el sistema de gestión operativa de Campuslands.

Tu rol es ayudar a los usuarios a:
- Entender cómo usar la plataforma (reservas, préstamos, incidencias)
- Resolver dudas sobre los espacios disponibles
- Orientar sobre el proceso de solicitudes
- Explicar los estados de reservas y préstamos

Reglas importantes:
- Responde siempre en español
- Sé conciso y amigable
- NO inventes disponibilidad de espacios ni confirmes reservas tú mismo
- Si el usuario quiere reservar, indícale que use el módulo de Espacios
- Si no sabes algo con certeza, dilo honestamente
- Máximo 3 párrafos por respuesta
"""

def chat_assistant(
    user_message: str,
    history: list[dict],
    db: Session,
) -> str:
    """Asistente conversacional con contexto de datos reales del campus."""

    # Construir contexto de datos reales
    spaces = db.query(Space).filter(Space.is_active == True).all()
    spaces_info = ", ".join([f"{s.name} (cap. {s.capacity})" for s in spaces])

    pending_reservations = db.query(Reservation).filter(
        Reservation.status == ReservationStatus.pending
    ).count()

    context = f"""
Datos actuales del campus:
- Espacios disponibles: {spaces_info}
- Reservas pendientes de aprobación: {pending_reservations}
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT + "\n\nContexto actual:\n" + context},
        *history[-6:],  # últimos 6 mensajes para no exceder tokens
        {"role": "user", "content": user_message},
    ]

    return _chat(messages, temperature=0.5)


# ── 2. Triaje de incidencias ──────────────────────────────────────────────────
def triage_incident(title: str, description: str) -> dict:
    """
    Clasifica automáticamente una incidencia.
    Retorna: { category, priority, explanation }
    """
    prompt = f"""Analiza esta incidencia de un campus educativo y clasifícala.

Título: {title}
Descripción: {description}

Responde ÚNICAMENTE en este formato JSON exacto (sin markdown, sin texto adicional):
{{
  "category": "<una de: hardware|software|network|infrastructure|safety|other>",
  "priority": "<una de: low|medium|high|critical>",
  "explanation": "<explicación breve en español de por qué asignaste esa categoría y prioridad>"
}}

Criterios de prioridad:
- critical: riesgo de seguridad física, sistema completamente caído
- high: afecta a muchos usuarios, impide trabajar
- medium: afecta a algunos usuarios, tiene solución temporal
- low: inconveniente menor, no impide trabajar"""

    messages = [
        {"role": "system", "content": "Eres un clasificador de incidencias técnicas. Solo respondes JSON válido."},
        {"role": "user", "content": prompt},
    ]

    raw = _chat(messages, temperature=0.1)

    # Parsear JSON de la respuesta
    import json
    import re

    # Extraer solo el JSON si viene con texto extra
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        try:
            result = json.loads(json_match.group())
            # Validar campos
            valid_categories = {"hardware", "software", "network", "infrastructure", "safety", "other"}
            valid_priorities = {"low", "medium", "high", "critical"}
            if result.get("category") not in valid_categories:
                result["category"] = "other"
            if result.get("priority") not in valid_priorities:
                result["priority"] = "medium"
            return result
        except json.JSONDecodeError:
            pass

    # Fallback si el JSON no es válido
    return {
        "category": "other",
        "priority": "medium",
        "explanation": "No se pudo clasificar automáticamente.",
    }


# ── 3. Recomendación de espacios ──────────────────────────────────────────────
def recommend_space(need: str, attendees: int, db: Session) -> dict:
    """
    Recomienda el espacio más adecuado según la necesidad del usuario.
    Retorna: { space_name, space_id, reason }
    """
    spaces = db.query(Space).filter(
        Space.is_active == True,
        Space.capacity >= attendees,
    ).all()

    if not spaces:
        return {
            "space_name": None,
            "space_id": None,
            "reason": f"No hay espacios disponibles con capacidad para {attendees} personas.",
        }

    spaces_info = "\n".join([
        f"- ID {s.id}: {s.name} | tipo: {s.space_type} | capacidad: {s.capacity} | amenidades: {s.amenities or 'ninguna'} | ubicación: {s.location}"
        for s in spaces
    ])

    prompt = f"""Un usuario de Campuslands necesita un espacio.

Necesidad: {need}
Número de personas: {attendees}

Espacios disponibles con capacidad suficiente:
{spaces_info}

Elige el espacio más adecuado y responde ÚNICAMENTE en este formato JSON (sin markdown):
{{
  "space_id": <número entero del ID>,
  "space_name": "<nombre exacto del espacio>",
  "reason": "<explicación breve en español de por qué es el mejor para esta necesidad>"
}}"""

    messages = [
        {"role": "system", "content": "Eres un asistente que recomienda espacios en un campus educativo. Solo respondes JSON válido."},
        {"role": "user", "content": prompt},
    ]

    raw = _chat(messages, temperature=0.2)

    import json, re
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        try:
            result = json.loads(json_match.group())
            return result
        except json.JSONDecodeError:
            pass

    # Fallback: recomendar el primer espacio disponible
    first = spaces[0]
    return {
        "space_id": first.id,
        "space_name": first.name,
        "reason": "Espacio disponible con capacidad suficiente.",
    }
