from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str
    email: EmailStr
    role: UserRole = UserRole.student


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        return v


class UserUpdate(BaseModel):
    full_name: str | None = None
    is_active: bool | None = None
    role: UserRole | None = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserMe(UserResponse):
    pass


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
