from typing import Optional
from pydantic import BaseModel, EmailStr

class UserProfile(BaseModel):
    userId: str
    name: Optional[str] = "Caregiver"
    email: Optional[str] = ""
    role: Optional[str] = "Parent"
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

