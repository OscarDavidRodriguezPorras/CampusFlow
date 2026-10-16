from datetime import datetime
from pydantic import BaseModel, field_validator
from app.models.space import SpaceType


class SpaceBase(BaseModel):
    name: str
    space_type: SpaceType
    location: str
    capacity: int
    description: str | None = None
    amenities: str | None = None

    @field_validator("capacity")
    @classmethod
    def capacity_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("La capacidad debe ser al menos 1")
        return v


class SpaceCreate(SpaceBase):
    pass


class SpaceUpdate(BaseModel):
    name: str | None = None
    location: str | None = None
    capacity: int | None = None
    description: str | None = None
    amenities: str | None = None
    is_active: bool | None = None


class SpaceResponse(SpaceBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
