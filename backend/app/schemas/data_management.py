from typing import List, Dict, Optional, Any
from pydantic import BaseModel

class ColumnMappingRequest(BaseModel):
    dataset_type: str # "athlete_events", "medal_results", "investment"
    mapping: Dict[str, str] # custom_column -> canonical_column

class ValidationErrorDetail(BaseModel):
    row_number: int
    column: str
    invalid_value: Any
    reason: str

class DataQualitySummary(BaseModel):
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    column_null_counts: Dict[str, int]
    column_null_percentages: Dict[str, float]
    unique_countries: int
    unique_sports: int
    year_range: str
    detected_dataset_type: str
    passed_validation: bool
    errors: List[ValidationErrorDetail]

class UploadValidationResponse(BaseModel):
    status: str
    message: str
    quality_summary: DataQualitySummary
    preview_rows: List[Dict[str, Any]]
    suggested_mapping: Dict[str, str]
    file_id: Optional[str] = None
