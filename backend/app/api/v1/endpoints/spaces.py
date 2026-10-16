from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.engine import get_db
from app.models.user import User
from app.models.space import Space
from app.schemas.space import SpaceCreate, SpaceUpdate, SpaceResponse
from app.api.v1.deps import get_current_user, require_admin

router = APIRouter()


@router.get("/spaces", response_model=list[SpaceResponse])
def list_spaces(
    active_only: bool = True,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    q = db.query(Space)
    if active_only:
        q = q.filter(Space.is_active == True)
    return q.all()


@router.get("/spaces/{space_id}", response_model=SpaceResponse)
def get_space(
    space_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    space = db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    return space


@router.post("/spaces", response_model=SpaceResponse, status_code=201)
def create_space(
    data: SpaceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    existing = db.query(Space).filter(Space.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya existe un espacio con ese nombre")
    space = Space(**data.model_dump())
    db.add(space)
    db.commit()
    db.refresh(space)
    return space


@router.patch("/spaces/{space_id}", response_model=SpaceResponse)
def update_space(
    space_id: int,
    data: SpaceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    space = db.get(Space, space_id)
    if not space:
        raise HTTPException(status_code=404, detail="Espacio no encontrado")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(space, field, value)
    db.commit()
    db.refresh(space)
    return space
