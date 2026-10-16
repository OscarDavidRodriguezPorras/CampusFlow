from fastapi import APIRouter
from app.api.v1.endpoints import health, auth, users, spaces, reservations, equipment, loans, incidents

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, tags=["users"])
api_router.include_router(spaces.router, tags=["spaces"])
api_router.include_router(reservations.router, tags=["reservations"])
api_router.include_router(equipment.router, tags=["equipment"])
api_router.include_router(loans.router, tags=["loans"])
api_router.include_router(incidents.router, tags=["incidents"])
