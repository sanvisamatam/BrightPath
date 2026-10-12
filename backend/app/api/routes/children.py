from datetime import datetime, timezone
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.schemas.child_schema import ChildCreate, ChildUpdate, ChildResponse
from backend.app.services.storage_service import storage_service

router = APIRouter(prefix="/children", tags=["Children"])

@router.post("", response_model=ChildResponse)
def create_child(child_data: ChildCreate):
    """
    Creates or registers a child profile.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    child_dict = child_data.model_dump()
    child_id = child_dict.get("childId") or f"child_{int(datetime.now(timezone.utc).timestamp())}_{uuid.uuid4().hex[:6]}"
    
    # Resolve mode based on age if missing
    age = child_dict.get("age", 5)
    mode = "early" if age <= 6 else "brightpath"
    
    child_dict["childId"] = child_id
    child_dict["mode"] = mode
    child_dict["createdAt"] = child_dict.get("createdAt") or now_iso
    child_dict["updatedAt"] = now_iso

    saved = storage_service.save_child(child_dict)
    return saved

@router.get("", response_model=List[ChildResponse])
def list_children(userId: Optional[str] = Query(None, description="Filter children by user ID")):
    """
    Lists registered children profiles.
    """
    return storage_service.list_children(user_id=userId)

@router.get("/{child_id}", response_model=ChildResponse)
def get_child(child_id: str):
    """
    Retrieves a child profile by ID.
    """
    child = storage_service.get_child(child_id)
    if not child:
        raise HTTPException(status_code=404, detail=f"Child profile '{child_id}' not found")
    return child

@router.put("/{child_id}", response_model=ChildResponse)
def update_child(child_id: str, updates: ChildUpdate):
    """
    Updates child details (name, age, notes).
    """
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if "age" in update_data:
        update_data["mode"] = "early" if update_data["age"] <= 6 else "brightpath"
    update_data["updatedAt"] = datetime.now(timezone.utc).isoformat()

    updated = storage_service.update_child(child_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Child profile '{child_id}' not found")
    return updated
