# CampusFlow 🚀
### Sistema Central de Gestión Operativa de Campuslands

> Hackatón Campuslands — "El campus bajo presión"

---

## Descripción del problema

Campuslands está creciendo a gran velocidad. Los procesos de gestión de aulas, préstamo de equipos y registro de incidencias dependen de registros dispersos o revisiones manuales, lo que genera demoras, errores y fricción en la comunidad.

**CampusFlow** centraliza estas operaciones en una única plataforma web, permitiendo consultar disponibilidad, realizar reservas, controlar préstamos y comunicar problemas en tiempo real.

---

## Integrantes del equipo

| Nombre | Rol |
|--------|-----|
| *Oscar David Rodriguez Porras* | *Developer* |
| *Christofer Darney Orduz Niño* | *Developer* |
| *Santiago Baez Aguilar* | *Developer / Presenter* |
|

---

## Stack tecnológico

### Frontend
- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — sistema de diseño
- **TanStack Query** — gestión de estado del servidor
- **React Hook Form** + **Zod** — formularios y validación
- **React Router v7** — navegación
- **Lucide React** — iconografía

### Backend
- **Python 3.13** + **FastAPI** — API REST
- **SQLAlchemy 2.x** + **Psycopg 3** — acceso a datos
- **Alembic** — migraciones de base de datos
- **Pydantic v2** — validación y serialización
- **Jose** + **bcrypt** — autenticación JWT

### Base de datos
- **PostgreSQL 18.6** — base de datos relacional

### Inteligencia Artificial
- **Groq API** con modelo `openai/gpt-oss-20b`
- Integrada en el módulo de incidencias (triaje automático) y asistente conversacional

---

## Uso de Inteligencia Artificial

CampusFlow integra IA en tres funcionalidades reales:

### 1. Asistente conversacional
Botón flotante **"Asistente IA"** disponible en todas las páginas. Responde preguntas sobre la plataforma usando contexto real de la base de datos (espacios disponibles, reservas pendientes).

### 2. Triaje automático de incidencias
Al crear una incidencia, la IA clasifica automáticamente la **categoría** (hardware, software, red, infraestructura, seguridad) y la **prioridad** (baja, media, alta, crítica) basándose en el título y descripción. Los campos `ai_suggested_category` y `ai_suggested_priority` se almacenan en la base de datos y se muestran en la interfaz.

### 3. Recomendación de espacios
Endpoint `/api/v1/ai/recommend-space` que recibe una descripción de necesidad y número de asistentes, consulta los espacios disponibles en la BD y recomienda el más adecuado con justificación.

> La IA nunca inventa disponibilidad ni confirma operaciones. Todas las acciones finales pasan por el backend con validación real.

---

## Reglas de negocio implementadas

1. **Anti-solapamiento de reservas** — Un espacio no puede tener dos reservas activas (pendiente o aprobada) en el mismo horario. Validado en el backend con consulta transaccional.

2. **Control de capacidad** — El número de asistentes de una reserva no puede superar la capacidad registrada del espacio. Error descriptivo si se excede.

3. **Disponibilidad de equipos** — Un equipo solo puede tener un préstamo activo simultáneo. Si el equipo está en estado `loaned` o tiene préstamo pendiente/aprobado, la solicitud es rechazada.

4. **Transiciones de estado válidas** — Una reserva o incidencia en estado `finished`, `cancelled` o `closed` no puede cambiar de estado.

5. **Roles y permisos en servidor** — Cada endpoint valida el rol del usuario autenticado. Un estudiante no puede aprobar reservas ni ver datos de otros usuarios modificando peticiones HTTP.

---

## Arquitectura del sistema

```
CampusFlow/
├── backend/                    # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── endpoints/      # auth, users, spaces, reservations,
│   │   │   │                   # equipment, loans, incidents, ai
│   │   │   └── deps.py         # dependencias de autenticación y roles
│   │   ├── core/               # config, seguridad JWT
│   │   ├── db/                 # motor SQLAlchemy, sesiones
│   │   ├── models/             # entidades ORM
│   │   ├── schemas/            # Pydantic request/response
│   │   └── services/           # lógica de negocio, ai_service
│   ├── alembic/                # migraciones
│   └── seed.py                 # datos iniciales
└── frontend/                   # React + TypeScript
    └── src/
        ├── components/         # Layout, StatusBadge, RoleBackground, AiChat
        ├── features/           # auth, dashboard, spaces, reservations,
        │                       # equipment, loans, incidents, ai
        ├── hooks/              # useRoleTheme
        ├── lib/                # cliente API, temas por rol
        └── types/              # tipos TypeScript
```

**Protocolo de autenticación:** JWT Bearer Token — el token se genera en login y se adjunta en cada petición. Los roles se validan exclusivamente en el servidor.

**Roles del sistema:**
- `student` — Consulta, crea reservas/préstamos/incidencias propias
- `admin` — Control total del sistema, gestión de usuarios y configuración

---

## Requisitos previos

- **Node.js** v18 o superior
- **Python** 3.13
- **PostgreSQL** 18.6 (servicio corriendo)
- **Git**

---

## Instalación y ejecución

### 1. Clonar el repositorio

```powershell
git clone <url-del-repositorio>
cd CampusFlow
```

### 2. Configurar el backend

```powershell
# Crear entorno virtual
py -3.13 -m venv .venv
.\.venv\Scripts\Activate.ps1

# Instalar dependencias
cd backend
pip install -r requirements.txt
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores:

```powershell
copy .env.example .env
```

Edita `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://postgres:TU_CONTRASENA@localhost:5432/campusflow
SECRET_KEY=clave-secreta-larga-y-aleatoria
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
DEBUG=True
FRONTEND_URL=http://localhost:5173
```

### 4. Crear la base de datos

```powershell
# En psql
psql -U postgres -c "CREATE DATABASE campusflow;"
```

### 5. Ejecutar migraciones

```powershell
# Desde la carpeta backend con el entorno virtual activo
alembic upgrade head
```

### 6. Cargar datos iniciales (admin)

```powershell
python seed.py
```

Credenciales del administrador:
- **Email:** `admin@campusflow.co`
- **Contraseña:** `Admin1234!`

> ⚠️ Cambia estas credenciales antes de cualquier despliegue.

### 7. Iniciar el backend

```powershell
# Desde la carpeta backend
python -m uvicorn app.main:app --reload
```

El backend queda disponible en: `http://localhost:8000`  
Documentación interactiva: `http://localhost:8000/docs`

### 8. Configurar el frontend

```powershell
# En una nueva terminal, desde la carpeta frontend
cd frontend
npm install
npm run dev
```

El frontend queda disponible en: `http://localhost:5173`

---

## Endpoints principales

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/api/v1/auth/login` | Iniciar sesión | Público |
| POST | `/api/v1/auth/register` | Registrar cuenta | Público |
| GET | `/api/v1/auth/me` | Usuario actual | Autenticado |
| GET | `/api/v1/spaces` | Listar espacios | Autenticado |
| POST | `/api/v1/reservations` | Crear reserva | Autenticado |
| GET | `/api/v1/reservations/me` | Mis reservas | Autenticado |
| GET | `/api/v1/reservations` | Todas las reservas | Admin |
| POST | `/api/v1/loans` | Solicitar préstamo | Autenticado |
| GET | `/api/v1/loans` | Todos los préstamos | Admin |
| POST | `/api/v1/incidents` | Crear incidencia | Autenticado |
| GET | `/api/v1/incidents` | Todas las incidencias | Admin |
| POST | `/api/v1/ai/chat` | Chat con asistente IA | Autenticado |
| POST | `/api/v1/ai/triage` | Triaje de incidencia | Autenticado |
| POST | `/api/v1/ai/recommend-space` | Recomendar espacio | Autenticado |

---

## Ejecución de pruebas

```powershell
# Desde la carpeta backend con el entorno virtual activo
cd backend
pytest tests/ -v
```

---

## Limitaciones conocidas

- El registro público crea cuentas de tipo **estudiante**. Para crear administradores se usa el panel de usuarios del admin.
- Las notificaciones son internas a la plataforma. No hay integración con correo electrónico.
- El chat de IA no persiste historial entre sesiones.
- No hay despliegue en producción configurado en esta versión del MVP.

---

## Funcionalidades del MVP

- ✅ Autenticación JWT con roles
- ✅ Dashboard diferenciado por rol (estudiante / administrador)
- ✅ Gestión de espacios del campus (Auditorio, Cosmos, Skilab, Spooki, Apolo, Blanca, Azul, Amarillas Verdes, Artemis)
- ✅ Reservas con prevención de conflictos de horario y capacidad
- ✅ Inventario de equipos tecnológicos
- ✅ Solicitud y gestión de préstamos
- ✅ Registro y seguimiento de incidencias
- ✅ Triaje automático de incidencias con IA
- ✅ Asistente conversacional con IA
- ✅ Recomendación de espacios con IA
- ✅ Interfaz temática por rol con animaciones espaciales
- ✅ Diseño responsive
- ✅ Datos persistentes en PostgreSQL

---

*CampusFlow — Hackatón Campuslands 2026*
