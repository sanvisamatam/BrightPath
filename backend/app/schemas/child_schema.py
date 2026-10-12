from typing import Optional
from pydantic import BaseModel, Field, field_validator

class ChildBase(BaseModel):
    name: str = "Child"
    age: int = Field(ge=3, le=17, description="Age must be between 3 and 17")
    mode: Optional[str] = None
    notes: Optional[str] = ""

    @field_validator("mode", mode="before")
    def resolve_mode(cls, v, info):
        # Auto resolve if empty
        if v:
            return v
        age = info.data.get("age", 5) if hasattr(info, "data") else 5
        return "early" if age <= 6 else "brightpath"

class ChildCreate(ChildBase):
    childId: Optional[str] = None
    userId: Optional[str] = "guest_user"

class ChildUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = Field(None, ge=3, le=17)
    notes: Optional[str] = None

class ChildResponse(ChildBase):
    childId: str
    userId: str
    createdAt: str
    updatedAt: str

