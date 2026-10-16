from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.engine import get_db
from app.models.user import User
from app.core.security import verify_password, create_access_token
from app.schemas.user import LoginRequest, Token, UserMe
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cuenta desactivada",
        )
    token = create_access_token(subject=user.id)
    return Token(access_token=token)


@router.get("/auth/me", response_model=UserMe)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
