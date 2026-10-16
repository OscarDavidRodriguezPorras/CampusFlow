from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import String, Boolean, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
import enum

from app.db.engine import Base

if TYPE_CHECKING:
    from app.models.loan import Loan


class EquipmentCategory(str, enum.Enum):
    laptop = "laptop"
    tablet = "tablet"
    projector = "projector"
    camera = "camera"
    cable = "cable"
    other = "other"


class EquipmentStatus(str, enum.Enum):
    available = "available"
    loaned = "loaned"
    maintenance = "maintenance"
    retired = "retired"


class Equipment(Base):
    __tablename__ = "equipment"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    inventory_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    category: Mapped[EquipmentCategory] = mapped_column(
        SAEnum(EquipmentCategory, name="equipmentcategory"), nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[EquipmentStatus] = mapped_column(
        SAEnum(EquipmentStatus, name="equipmentstatus"),
        nullable=False,
        default=EquipmentStatus.available,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    loans: Mapped[list["Loan"]] = relationship(back_populates="equipment")
