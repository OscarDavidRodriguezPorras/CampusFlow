from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.engine import get_db
from app.models.user import User, UserRole
from app.core.security import verify_password, create_access_token, hash_password
from app.schemas.user import LoginRequest, Token, UserMe, UserCreate, UserResponse
from app.api.v1.deps import get_current_user

router = APIRouter()


@router.post("/auth/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El correo electrónico o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta está desactivada. Contacta al administrador.",
        )
    token = create_access_token(subject=user.id)
    return Token(access_token=token)


@router.post("/auth/register", response_model=UserResponse, status_code=201)
def register(data: UserCreate, db: Session = Depends(get_db)):
    """
    Registro público — solo crea cuentas con rol estudiante.
    El rol enviado en el body es ignorado por seguridad.
    """
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una cuenta con ese correo electrónico.",
        )
    user = User(
        full_name=data.full_name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.student,  # siempre estudiante, sin importar lo que envíe el cliente
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/auth/me", response_model=UserMe)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
