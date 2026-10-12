from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class CategoryResult(BaseModel):
    category_id: str
    category_name: str
    historical_manual: str = "DSM-IV / ICD-10"
    current_status: str = "Subsumed into Autism Spectrum Disorder (ASD) in DSM-5 / ICD-11"
    model_available: bool = False
    prediction_percentage: Optional[float] = None
    display_value: str = "Diagnostic prediction model not available"
    status_label: str = "Model Not Available"
    clinical_note: str

class ObservationalIndicator(BaseModel):
    name: str
    value: Any
    unit: str
    category: str
    non_diagnostic_note: str

class DiagnosticEvaluationResponse(BaseModel):
    session_id: str
    child_id: Optional[str] = None
    child_name: Optional[str] = None
    child_age: Optional[int] = None
    evaluated_at: str
    model_available: bool = False
    model_status: str = "EXPERIMENTAL_UNAVAILABLE"
    honest_message: str = "Diagnostic prediction model not available"
    clinical_disclaimer: str = (
        "Educational & Research Notice: Game scores, facial expressions, and keyboard interaction "
        "telemetry CANNOT diagnose autism or differentiate historical DSM-IV subtypes. "
        "Diagnostic determination requires comprehensive multidisciplinary clinical assessment "
        "conducted by qualified medical and developmental healthcare professionals."
    )
    historical_context_summary: str = (
        "Autistic Disorder, Asperger Syndrome, Childhood Disintegrative Disorder, and PDD-NOS "
        "are historical diagnostic subtypes defined under DSM-IV. Modern clinical practice (DSM-5 and ICD-11) "
        "unifies these categories under a single Autism Spectrum Disorder (ASD) continuum with dimensional support levels."
    )
    categories: List[CategoryResult]
    observational_indicators: List[ObservationalIndicator] = []
    research_summary: Dict[str, Any] = {}

