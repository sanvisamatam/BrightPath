import os
from pathlib import Path
from typing import List

class Settings:
    PROJECT_NAME: str = "BrightPath API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Base directories
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATA_DIR: Path = BASE_DIR / "data"
    
    # CORS settings allowing standard Vite dev/preview ports and local network access
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Clinical & Medical Governance Configuration
    DIAGNOSTIC_MODEL_AVAILABLE: bool = False
    DIAGNOSTIC_MODEL_NAME: str = "None (Experimental Diagnostic Subtypes - Clinical Model Not Available)"
    
    # Historical Categories (DSM-IV)
    HISTORICAL_CATEGORIES: List[str] = [
        "Autistic Disorder",
        "Asperger Syndrome",
        "Childhood Disintegrative Disorder",
        "Pervasive Developmental Disorder - Not Otherwise Specified (PDD-NOS)"
    ]

settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
