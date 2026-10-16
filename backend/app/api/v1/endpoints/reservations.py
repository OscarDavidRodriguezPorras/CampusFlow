from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.db.engine import get_db
from app.models.user import User, UserRole
from app.models.space import Space
from app.models.reservation import Reservation, ReservationStatus
from app.schemas.reservation import ReservationCreate, ReservationUpdate, ReservationResponse
from app.api.v1.deps import get_current_user, require_staff_or_admin

router = APIRouter()


def _check_overlap(db: Session, space_id: int, start_time, end_time, exclude_id: int | None = None):
    """
    Regla de negocio 1: No permitir reservas solapadas para el mismo espacio.
    Dos reservas se solapan si una empieza antes de que la otra termine y viceversa.
    Solo se consideran reservas en estado pending o approved.
    """
    q = db.query(Reservation).filter(
        Reservation.space_id == space_id,
        Reservation.status.in_([ReservationStatus.pending, ReservationStatus.approved]),
        Reservation.start_time < end_time,
        Reservation.end_time > start_time,
    )
    if exclude_id:
        q = q.filter(Reservation.id != exclude_id)
    return q.first()


@router.post("/reservations", response_model=ReservationResponse, status_code=201)
def create_reservation(
    data: ReservationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    space = db.get(Space, data.space_id)
    if not space or not space.is_active:
        raise HTTPException(status_code=404, detail="Espacio no encontrado o inactivo")

    # Regla de negocio 2: Los asistentes no pueden superar la capacidad del espacio
    if data.attendees_count > space.capacity:
        raise HTTPException(
            status_code=400,
            detail=f"El número de asistentes ({data.attendees_count}) supera la capacidad del espacio ({space.capacity})",
        )

    # Regla de negocio 1: prevenir solapamientos
    conflict = _check_overlap(db, data.space_id, data.start_time, data.end_time)
    if conflict:
        raise HTTPException(
            status_code=409,
            detail=f"El espacio ya tiene una reserva en ese horario (ID: {conflict.id})",
        )

    reservation = Reservation(
        user_id=current_user.id,
        **data.model_dump(),
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.get("/reservations/me", response_model=list[ReservationResponse])
def my_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Reservation)
        .filter(Reservation.user_id == current_user.id)
        .order_by(Reservation.start_time.desc())
        .all()
    )


@router.get("/reservations", response_model=list[ReservationResponse])
def list_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    return db.query(Reservation).order_by(Reservation.start_time.desc()).all()


@router.get("/reservations/{reservation_id}", response_model=ReservationResponse)
def get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    # Un estudiante solo puede ver sus propias reservas
    if current_user.role == UserRole.student and reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sin permiso para ver esta reserva")
    return reservation


@router.patch("/reservations/{reservation_id}", response_model=ReservationResponse)
def update_reservation(
    reservation_id: int,
    data: ReservationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Solo staff/admin pueden aprobar o rechazar
    if data.status in (ReservationStatus.approved, ReservationStatus.rejected):
        if current_user.role not in (UserRole.staff, UserRole.admin):
            raise HTTPException(status_code=403, detail="Solo el personal puede aprobar o rechazar reservas")

    # Regla de negocio 3: Una reserva finalizada o cancelada no puede cambiar de estado
    if reservation.status in (ReservationStatus.finished, ReservationStatus.cancelled):
        raise HTTPException(
            status_code=400,
            detail="No se puede modificar una reserva finalizada o cancelada",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(reservation, field, value)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.patch("/reservations/{reservation_id}/cancel", response_model=ReservationResponse)
def cancel_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reservation = db.get(Reservation, reservation_id)
    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    # Solo el dueño o staff/admin puede cancelar
    if current_user.role == UserRole.student and reservation.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Solo puedes cancelar tus propias reservas")

    if reservation.status in (ReservationStatus.finished, ReservationStatus.cancelled):
        raise HTTPException(status_code=400, detail="La reserva ya está finalizada o cancelada")

    reservation.status = ReservationStatus.cancelled
    db.commit()
    db.refresh(reservation)
    return reservation
