from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Any

class ProfessionalRegisterRequest(BaseModel):
    chin: str
    profession: str = Field(..., pattern="^(doctor|lawyer|ca|engineer)$")
    license_number: str
    issuing_body: str
    valid_from: date
    valid_until: Optional[date] = None
    specializations: List[str] = Field(default_factory=list)

class ProfessionalResponse(BaseModel):
    pdid: str
    chin: str
    profession: str
    license_number: str
    issuing_body: Optional[str]
    valid_from: date
    valid_until: Optional[date]
    specializations: Optional[List[str]]
    status: str
    blockchain_tx: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class InstitutionRegisterRequest(BaseModel):
    name: str = Field(..., max_length=256)
    type: str = Field(..., pattern="^(hospital|court|bank|university|revenue_office)$")
    registration_no: str
    state: str
    district: str
    node_public_key: str

class InstitutionResponse(BaseModel):
    inst_id: str
    name: str
    type: str
    registration_no: Optional[str]
    state: Optional[str]
    district: Optional[str]
    node_public_key: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
