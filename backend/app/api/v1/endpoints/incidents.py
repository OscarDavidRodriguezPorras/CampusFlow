from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.engine import get_db
from app.models.user import User, UserRole
from app.models.incident import Incident, IncidentComment, IncidentStatus
from app.schemas.incident import (
    IncidentCreate, IncidentUpdate, IncidentResponse,
    IncidentCommentCreate, IncidentCommentResponse,
)
from app.api.v1.deps import get_current_user, require_staff_or_admin

router = APIRouter()


@router.post("/incidents", response_model=IncidentResponse, status_code=201)
def create_incident(
    data: IncidentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = Incident(reporter_id=current_user.id, **data.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("/incidents/me", response_model=list[IncidentResponse])
def my_incidents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Incident)
        .filter(Incident.reporter_id == current_user.id)
        .order_by(Incident.created_at.desc())
        .all()
    )


@router.get("/incidents", response_model=list[IncidentResponse])
def list_incidents(
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
):
    return db.query(Incident).order_by(Incident.created_at.desc()).all()


@router.get("/incidents/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    if current_user.role == UserRole.student and incident.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para ver esta incidencia")
    return incident


@router.patch("/incidents/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: int,
    data: IncidentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")

    # Regla de negocio: una incidencia cerrada no puede reabrirse
    if incident.status == IncidentStatus.closed and data.status not in (None, IncidentStatus.closed):
        raise HTTPException(status_code=400, detail="Una incidencia cerrada no puede cambiar de estado")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(incident, field, value)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/incidents/{incident_id}/comments", response_model=IncidentCommentResponse, status_code=201)
def add_comment(
    incident_id: int,
    data: IncidentCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    comment = IncidentComment(
        incident_id=incident_id,
        author_id=current_user.id,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment


@router.get("/incidents/{incident_id}/comments", response_model=list[IncidentCommentResponse])
def list_comments(
    incident_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    incident = db.get(Incident, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incidencia no encontrada")
    if current_user.role == UserRole.student and incident.reporter_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso")
    return db.query(IncidentComment).filter(IncidentComment.incident_id == incident_id).all()
