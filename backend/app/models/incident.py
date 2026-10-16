from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.user import User


class IncidentCategory(str, enum.Enum):
    hardware = "hardware"
    software = "software"
    network = "network"
    infrastructure = "infrastructure"
    safety = "safety"
    other = "other"


class IncidentPriority(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class IncidentStatus(str, enum.Enum):
    open = "open"
    assigned = "assigned"
    in_progress = "in_progress"
    resolved = "resolved"
    closed = "closed"


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    reporter_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    assigned_to_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[IncidentCategory] = mapped_column(
        SAEnum(IncidentCategory, name="incidentcategory"), nullable=False
    )
    priority: Mapped[IncidentPriority] = mapped_column(
        SAEnum(IncidentPriority, name="incidentpriority"),
        nullable=False,
        default=IncidentPriority.medium,
    )
    status: Mapped[IncidentStatus] = mapped_column(
        SAEnum(IncidentStatus, name="incidentstatus"),
        nullable=False,
        default=IncidentStatus.open,
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    # Campo reservado para la clasificación IA (se llena después)
    ai_suggested_category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    ai_suggested_priority: Mapped[str | None] = mapped_column(String(20), nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reporter: Mapped["User"] = relationship(foreign_keys=[reporter_id], back_populates="incidents")
    assigned_to: Mapped["User | None"] = relationship(foreign_keys=[assigned_to_id])
    comments: Mapped[list["IncidentComment"]] = relationship(back_populates="incident")


class IncidentComment(Base):
    __tablename__ = "incident_comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    incident_id: Mapped[int] = mapped_column(ForeignKey("incidents.id"), nullable=False, index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    incident: Mapped["Incident"] = relationship(back_populates="comments")
    author: Mapped["User"] = relationship(foreign_keys=[author_id])
