from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.engine import get_db
from app.models.user import User
from app.models.equipment import Equipment
from app.schemas.equipment import EquipmentCreate, EquipmentUpdate, EquipmentResponse
from app.api.v1.deps import get_current_user, require_admin

router = APIRouter()


@router.get("/equipment", response_model=list[EquipmentResponse])
def list_equipment(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Equipment).filter(Equipment.is_active == True).all()


@router.get("/equipment/{equipment_id}", response_model=EquipmentResponse)
def get_equipment(
    equipment_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    eq = db.get(Equipment, equipment_id)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return eq


@router.post("/equipment", response_model=EquipmentResponse, status_code=201)
def create_equipment(
    data: EquipmentCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    existing = db.query(Equipment).filter(Equipment.inventory_code == data.inventory_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un equipo con ese código de inventario")
    eq = Equipment(**data.model_dump())
    db.add(eq)
    db.commit()
    db.refresh(eq)
    return eq


@router.patch("/equipment/{equipment_id}", response_model=EquipmentResponse)
def update_equipment(
    equipment_id: int,
    data: EquipmentUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    eq = db.get(Equipment, equipment_id)
    if not eq:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(eq, field, value)
    db.commit()
    db.refresh(eq)
    return eq
