from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.engine import get_db
from app.models.user import User
from app.api.v1.deps import get_current_user
from app.services.ai_service import chat_assistant, triage_incident, recommend_space

router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str   # "user" o "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

class ChatResponse(BaseModel):
    response: str

class TriageRequest(BaseModel):
    title: str
    description: str

class TriageResponse(BaseModel):
    category: str
    priority: str
    explanation: str

class RecommendRequest(BaseModel):
    need: str
    attendees: int = 1

class RecommendResponse(BaseModel):
    space_id: int | None
    space_name: str | None
    reason: str


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/ai/chat", response_model=ChatResponse)
def chat(
    data: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Asistente general de CampusFlow."""
    try:
        history = [{"role": m.role, "content": m.content} for m in data.history]
        response = chat_assistant(data.message, history, db)
        return ChatResponse(response=response)
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=503, detail="El servicio de IA no está disponible temporalmente")


@router.post("/ai/triage", response_model=TriageResponse)
def triage(
    data: TriageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Clasifica automáticamente una incidencia."""
    try:
        result = triage_incident(data.title, data.description)
        return TriageResponse(**result)
    except Exception:
        raise HTTPException(status_code=503, detail="El servicio de IA no está disponible temporalmente")


@router.post("/ai/recommend-space", response_model=RecommendResponse)
def recommend(
    data: RecommendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Recomienda un espacio según la necesidad del usuario."""
    try:
        result = recommend_space(data.need, data.attendees, db)
        return RecommendResponse(**result)
    except Exception:
        raise HTTPException(status_code=503, detail="El servicio de IA no está disponible temporalmente")
