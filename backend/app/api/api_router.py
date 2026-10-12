from fastapi import APIRouter
from backend.app.api.routes import (
    health,
    sessions,
    diagnostics,
    children,
    progress,
    users,
    predictions
)

api_router = APIRouter()

api_router.include_router(health.router)
api_router.include_router(sessions.router)
api_router.include_router(diagnostics.router)
api_router.include_router(children.router)
api_router.include_router(progress.router)
api_router.include_router(users.router)
api_router.include_router(predictions.router)

