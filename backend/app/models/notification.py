from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.user import User


class NotificationType(str, enum.Enum):
    reservation_approved = "reservation_approved"
    reservation_rejected = "reservation_rejected"
    reservation_cancelled = "reservation_cancelled"
    loan_approved = "loan_approved"
    loan_rejected = "loan_rejected"
    loan_overdue = "loan_overdue"
    incident_updated = "incident_updated"
    incident_resolved = "incident_resolved"
    general = "general"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    type: Mapped[NotificationType] = mapped_column(
        SAEnum(NotificationType, name="notificationtype"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    related_id: Mapped[int | None] = mapped_column(nullable=True)  # ID del recurso relacionado
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship(back_populates="notifications")
