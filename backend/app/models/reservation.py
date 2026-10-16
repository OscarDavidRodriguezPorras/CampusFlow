from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, DateTime, Text, ForeignKey, Enum as SAEnum, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.space import Space


class ReservationStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    cancelled = "cancelled"
    finished = "finished"


class Reservation(Base):
    __tablename__ = "reservations"
    __table_args__ = (
        # Regla de negocio 1: start_time debe ser anterior a end_time
        CheckConstraint("start_time < end_time", name="ck_reservation_time_order"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    space_id: Mapped[int] = mapped_column(ForeignKey("spaces.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    attendees_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[ReservationStatus] = mapped_column(
        SAEnum(ReservationStatus, name="reservationstatus"),
        nullable=False,
        default=ReservationStatus.pending,
    )
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)
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

    user: Mapped["User"] = relationship(back_populates="reservations")
    space: Mapped["Space"] = relationship(back_populates="reservations")
