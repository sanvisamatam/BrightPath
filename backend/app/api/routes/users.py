from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from backend.app.schemas.user_schema import UserProfile
from backend.app.services.storage_service import storage_service

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/profile", response_model=UserProfile)
def save_user_profile(user: UserProfile):
    """
    Saves or mirrors user/caregiver profile to backend storage.
    """
    user_dict = user.model_dump()
    now_iso = datetime.now(timezone.utc).isoformat()
    if not user_dict.get("createdAt"):
        user_dict["createdAt"] = now_iso
    user_dict["updatedAt"] = now_iso

    saved = storage_service.save_user(user_dict)
    return saved

@router.get("/{user_id}", response_model=UserProfile)
def get_user_profile(user_id: str):
    """
    Retrieves user profile by user ID.
    """
    user = storage_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail=f"User profile '{user_id}' not found")
    return user
