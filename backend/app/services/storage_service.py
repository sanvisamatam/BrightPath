import json
import os
import threading
from typing import Dict, List, Optional, Any
from pathlib import Path
from backend.app.core.config import settings

class StorageService:
    def __init__(self):
        self.data_dir = settings.DATA_DIR
        self.sessions_file = self.data_dir / "sessions.json"
        self.children_file = self.data_dir / "children.json"
        self.users_file = self.data_dir / "users.json"
        self.progress_file = self.data_dir / "progress.json"
        self.lock = threading.Lock()
        
        self._init_files()

    def _init_files(self):
        os.makedirs(self.data_dir, exist_ok=True)
        for filepath in [self.sessions_file, self.children_file, self.users_file, self.progress_file]:
            if not filepath.exists():
                with open(filepath, "w", encoding="utf-8") as f:
                    json.dump([] if "progress" not in str(filepath) and "users" not in str(filepath) else {}, f)

    def _read_json(self, filepath: Path, default_val: Any) -> Any:
        try:
            if not filepath.exists():
                return default_val
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return default_val

    def _write_json(self, filepath: Path, data: Any):
        try:
            temp_file = filepath.with_suffix(".tmp")
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            temp_file.replace(filepath)
        except Exception as e:
            print(f"Error writing {filepath}: {e}")

    # ================= Sessions =================
    def save_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            sessions: List[Dict[str, Any]] = self._read_json(self.sessions_file, [])
            session_id = session_data.get("id") or session_data.get("sessionId")
            
            # Find and update or prepend
            existing_idx = next((i for i, s in enumerate(sessions) if s.get("id") == session_id), -1)
            if existing_idx >= 0:
                sessions[existing_idx] = session_data
            else:
                sessions.insert(0, session_data)
                
            self._write_json(self.sessions_file, sessions)
            return session_data

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            sessions: List[Dict[str, Any]] = self._read_json(self.sessions_file, [])
            return next((s for s in sessions if s.get("id") == session_id or s.get("sessionId") == session_id), None)

    def list_sessions(self, child_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.lock:
            sessions: List[Dict[str, Any]] = self._read_json(self.sessions_file, [])
            filtered = sessions
            if child_id:
                filtered = [s for s in filtered if s.get("childId") == child_id]
            elif user_id:
                filtered = [s for s in filtered if s.get("userId") == user_id or s.get("userId") == "guest_user"]
            
            # Sort descending by creation or start time
            filtered.sort(key=lambda x: x.get("createdAt") or x.get("startTime") or "", reverse=True)
            return filtered

    # ================= Children =================
    def save_child(self, child_data: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            children: List[Dict[str, Any]] = self._read_json(self.children_file, [])
            cid = child_data.get("childId")
            
            idx = next((i for i, c in enumerate(children) if c.get("childId") == cid), -1)
            if idx >= 0:
                children[idx] = child_data
            else:
                children.insert(0, child_data)
                
            self._write_json(self.children_file, children)
            return child_data

    def get_child(self, child_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            children: List[Dict[str, Any]] = self._read_json(self.children_file, [])
            return next((c for c in children if c.get("childId") == child_id), None)

    def list_children(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.lock:
            children: List[Dict[str, Any]] = self._read_json(self.children_file, [])
            if user_id:
                children = [c for c in children if c.get("userId") == user_id]
            children.sort(key=lambda x: x.get("createdAt") or "", reverse=True)
            return children

    def update_child(self, child_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self.lock:
            children: List[Dict[str, Any]] = self._read_json(self.children_file, [])
            idx = next((i for i, c in enumerate(children) if c.get("childId") == child_id), -1)
            if idx < 0:
                return None
            
            existing = children[idx]
            existing.update(updates)
            self._write_json(self.children_file, children)
            return existing

    # ================= Users =================
    def save_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            users: Dict[str, Any] = self._read_json(self.users_file, {})
            uid = user_data.get("userId")
            if uid:
                users[uid] = user_data
                self._write_json(self.users_file, users)
            return user_data

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            users: Dict[str, Any] = self._read_json(self.users_file, {})
            return users.get(user_id)

    # ================= Progress =================
    def save_progress(self, child_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        with self.lock:
            progress_db: Dict[str, Any] = self._read_json(self.progress_file, {})
            progress_db[child_id] = progress_data
            self._write_json(self.progress_file, progress_db)
            return progress_data

    def get_progress(self, child_id: str) -> Optional[Dict[str, Any]]:
        with self.lock:
            progress_db: Dict[str, Any] = self._read_json(self.progress_file, {})
            return progress_db.get(child_id)

storage_service = StorageService()

