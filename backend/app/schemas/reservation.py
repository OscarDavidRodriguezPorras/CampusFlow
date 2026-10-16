from datetime import datetime
from pydantic import BaseModel, field_validator, model_validator
from app.models.reservation import ReservationStatus


class ReservationCreate(BaseModel):
    space_id: int
    title: str
    purpose: str | None = None
    attendees_count: int = 1
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def check_time_order(self) -> "ReservationCreate":
        if self.start_time >= self.end_time:
            raise ValueError("La hora de inicio debe ser anterior a la hora de fin")
        return self

    @field_validator("attendees_count")
    @classmethod
    def attendees_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("El número de asistentes debe ser al menos 1")
        return v


class ReservationUpdate(BaseModel):
    status: ReservationStatus | None = None
    rejection_reason: str | None = None


class ReservationResponse(BaseModel):
    id: int
    user_id: int
    space_id: int
    title: str
    purpose: str | None
    attendees_count: int
    start_time: datetime
    end_time: datetime
    status: ReservationStatus
    rejection_reason: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ReservationDetail(ReservationResponse):
    from app.schemas.user import UserResponse
    from app.schemas.space import SpaceResponse
    user: "UserResponse"
    space: "SpaceResponse"
