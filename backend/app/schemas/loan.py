from datetime import datetime
from pydantic import BaseModel
from app.models.loan import LoanStatus


class LoanCreate(BaseModel):
    equipment_id: int
    purpose: str | None = None
    requested_return_date: datetime


class LoanUpdate(BaseModel):
    status: LoanStatus | None = None
    return_notes: str | None = None


class LoanResponse(BaseModel):
    id: int
    user_id: int
    equipment_id: int
    purpose: str | None
    status: LoanStatus
    requested_return_date: datetime
    delivered_at: datetime | None
    returned_at: datetime | None
    return_notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
