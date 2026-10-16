from datetime import datetime
from pydantic import BaseModel
from app.models.incident import IncidentCategory, IncidentPriority, IncidentStatus


class IncidentCreate(BaseModel):
    title: str
    description: str
    category: IncidentCategory
    priority: IncidentPriority = IncidentPriority.medium
    location: str | None = None


class IncidentUpdate(BaseModel):
    status: IncidentStatus | None = None
    priority: IncidentPriority | None = None
    assigned_to_id: int | None = None
    category: IncidentCategory | None = None


class IncidentCommentCreate(BaseModel):
    content: str


class IncidentCommentResponse(BaseModel):
    id: int
    incident_id: int
    author_id: int
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class IncidentResponse(BaseModel):
    id: int
    reporter_id: int
    assigned_to_id: int | None
    title: str
    description: str
    category: IncidentCategory
    priority: IncidentPriority
    status: IncidentStatus
    location: str | None
    ai_suggested_category: str | None
    ai_suggested_priority: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
