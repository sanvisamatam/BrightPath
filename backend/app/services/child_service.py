"""
Child Profile & Validation Service
Handles age validation, activity mode resolution (early: 3-6, brightpath: 7-17),
and child profile database formatting.
"""

from typing import Dict, Any, Tuple, Optional
import time
import random
from backend.app.services.storage_service import storage_service

class ChildService:
    def validate_child_age(self, age: Any) -> Tuple[bool, Optional[str], Optional[int]]:
        """
        Validates child age between 3 and 17.
        Returns: (is_valid, error_message, numeric_age)
        """
        try:
            numeric_age = int(age)
        except (ValueError, TypeError):
            return False, "Age is required and must be a valid number.", None

        if numeric_age < 3:
            return False, "BrightPath activities are designed for children aged 3 and older.", None
        if numeric_age > 17:
            return False, "Please enter a child or teen age between 3 and 17 years.", None

        return True, None, numeric_age

    def resolve_activity_mode(self, age: Any) -> str:
        """
        Ages 3–6: 'early' (Foundational Activity Mode)
        Ages 7–17: 'brightpath' (Standard BrightPath Mode)
        """
        valid, _, numeric_age = self.validate_child_age(age)
        if valid and numeric_age is not None and numeric_age <= 6:
            return "early"
        return "brightpath"

    def format_child(self, child_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        """Ensures child has valid mode, childId, and timestamp fields."""
        raw_age = child_data.get("age", 5)
        valid, err, numeric_age = self.validate_child_age(raw_age)
        if not valid:
            raise ValueError(err)

        child_id = child_data.get("childId")
        if not child_id:
            rand_suffix = "".join(random.choices("abcdefghijklmnopqrstuvwxyz0123456789", k=6))
            child_id = f"child_{int(time.time() * 1000)}_{rand_suffix}"

        now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        return {
            "childId": child_id,
            "userId": user_id or child_data.get("userId") or "guest_user",
            "name": str(child_data.get("name", "Child")).strip(),
            "age": numeric_age,
            "mode": self.resolve_activity_mode(numeric_age),
            "notes": child_data.get("notes", ""),
            "createdAt": child_data.get("createdAt") or now_iso,
            "updatedAt": now_iso
        }

    def create_child(self, child_data: Dict[str, Any], user_id: Optional[str] = None) -> Dict[str, Any]:
        formatted = self.format_child(child_data, user_id=user_id)
        return storage_service.save_child(formatted)

    def update_child(self, child_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        existing = storage_service.get_child(child_id)
        if not existing:
            return None

        if "age" in updates:
            valid, err, numeric_age = self.validate_child_age(updates["age"])
            if not valid:
                raise ValueError(err)
            updates["age"] = numeric_age
            updates["mode"] = self.resolve_activity_mode(numeric_age)

        updates["updatedAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        return storage_service.update_child(child_id, updates)

child_service = ChildService()

