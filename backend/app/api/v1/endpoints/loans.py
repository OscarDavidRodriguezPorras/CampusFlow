from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.engine import get_db
from app.models.user import User, UserRole
from app.models.equipment import Equipment, EquipmentStatus
from app.models.loan import Loan, LoanStatus
from app.schemas.loan import LoanCreate, LoanUpdate, LoanResponse
from app.api.v1.deps import get_current_user, require_staff_or_admin

router = APIRouter()


@router.post("/loans", response_model=LoanResponse, status_code=201)
def request_loan(
    data: LoanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    eq = db.get(Equipment, data.equipment_id)
    if not eq or not eq.is_active:
        raise HTTPException(status_code=404, detail="Equipo no encontrado o inactivo")

    # Regla de negocio: el equipo debe estar disponible
    if eq.status != EquipmentStatus.available:
        raise HTTPException(
            status_code=409,
            detail=f"El equipo no está disponible (estado actual: {eq.status.value})",
        )

    # Regla de negocio: no puede tener otro préstamo activo del mismo equipo
    active_loan = db.query(Loan).filter(
        Loan.equipment_id == data.equipment_id,
        Loan.status.in_([LoanStatus.pending, LoanStatus.approved, LoanStatus.delivered]),
    ).first()
    if active_loan:
        raise HTTPException(status_code=409, detail="El equipo ya tiene un préstamo activo")

    loan = Loan(user_id=current_user.id, **data.model_dump())
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


@router.get("/loans/me", response_model=list[LoanResponse])
def my_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Loan).filter(Loan.user_id == current_user.id).order_by(Loan.created_at.desc()).all()


@router.get("/loans", response_model=list[LoanResponse])
def list_loans(
    db: Session = Depends(get_db),
    _: User = Depends(require_staff_or_admin),
):
    return db.query(Loan).order_by(Loan.created_at.desc()).all()


@router.patch("/loans/{loan_id}", response_model=LoanResponse)
def update_loan(
    loan_id: int,
    data: LoanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    loan = db.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Préstamo no encontrado")

    eq = db.get(Equipment, loan.equipment_id)

    # Actualizar estado del equipo según transición del préstamo
    if data.status == LoanStatus.delivered:
        loan.delivered_at = datetime.now(timezone.utc)
        if eq:
            eq.status = EquipmentStatus.loaned
    elif data.status == LoanStatus.returned:
        loan.returned_at = datetime.now(timezone.utc)
        if eq:
            eq.status = EquipmentStatus.available

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(loan, field, value)

    db.commit()
    db.refresh(loan)
    return loan
