from datetime import datetime
from pydantic import BaseModel
from app.models.equipment import EquipmentCategory, EquipmentStatus


class EquipmentCreate(BaseModel):
    inventory_code: str
    name: str
    category: EquipmentCategory
    description: str | None = None


class EquipmentUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: EquipmentStatus | None = None
    is_active: bool | None = None


class EquipmentResponse(BaseModel):
    id: int
    inventory_code: str
    name: str
    category: EquipmentCategory
    description: str | None
    status: EquipmentStatus
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
