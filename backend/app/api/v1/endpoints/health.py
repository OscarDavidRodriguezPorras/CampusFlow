from fastapi import APIRouter
from app.db.engine import check_db_connection
from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}


@router.get("/health/db")
def db_health_check():
    if check_db_connection():
        return {"status": "ok", "database": "connected"}
    return {"status": "error", "database": "unreachable"}, 503
