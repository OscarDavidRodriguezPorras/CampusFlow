from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.equipment import Equipment


class LoanStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    delivered = "delivered"   # equipo entregado al usuario
    returned = "returned"     # equipo devuelto
    rejected = "rejected"
    overdue = "overdue"


class Loan(Base):
    __tablename__ = "loans"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    equipment_id: Mapped[int] = mapped_column(ForeignKey("equipment.id"), nullable=False, index=True)
    purpose: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[LoanStatus] = mapped_column(
        SAEnum(LoanStatus, name="loanstatus"),
        nullable=False,
        default=LoanStatus.pending,
    )
    # Fechas planificadas
    requested_return_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    # Fechas reales
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    returned_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    # Observaciones del estado del equipo al devolver
    return_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

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

    user: Mapped["User"] = relationship(back_populates="loans")
    equipment: Mapped["Equipment"] = relationship(back_populates="loans")
