from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.reservation import Reservation
    from app.models.loan import Loan
    from app.models.incident import Incident
    from app.models.notification import Notification


class UserRole(str, enum.Enum):
    student = "student"
    staff = "staff"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="userrole"), nullable=False, default=UserRole.student
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    reservations: Mapped[list["Reservation"]] = relationship(back_populates="user")
    loans: Mapped[list["Loan"]] = relationship(back_populates="user")
    incidents: Mapped[list["Incident"]] = relationship(
        back_populates="reporter",
        foreign_keys="Incident.reporter_id",
    )
    notifications: Mapped[list["Notification"]] = relationship(back_populates="user")
