from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Integer, Boolean, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.reservation import Reservation


class SpaceType(str, enum.Enum):
    classroom = "classroom"
    cubicle = "cubicle"
    lab = "lab"
    meeting_room = "meeting_room"


class Space(Base):
    __tablename__ = "spaces"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    space_type: Mapped[SpaceType] = mapped_column(
        SAEnum(SpaceType, name="spacetype"), nullable=False
    )
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    amenities: Mapped[str | None] = mapped_column(String(500), nullable=True)  # CSV simple
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="space")
