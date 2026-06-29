from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional, List, Any

class CitizenRegisterRequest(BaseModel):
    full_name: str = Field(..., max_length=256)
    dob: date
    gender: str = Field(..., pattern="^(M|F|O)$")
    birth_district: str
    birth_state: str
    hospital_pdid: str
    registrar_chin: str

class CitizenRegisterResponse(BaseModel):
    chin: str
    aadhaar_scheduled: bool = True
    blockchain_tx: str
    chin_card_dispatch_eta_days: int = 7

class CitizenUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, max_length=256)
    dob: Optional[date] = None
    gender: Optional[str] = Field(None, pattern="^(M|F|O)$")
    birth_district: Optional[str] = None
    birth_state: Optional[str] = None
    status: Optional[str] = None

class CitizenResponse(BaseModel):
    chin: str
    full_name: str
    dob: date
    gender: str
    birth_district: str
    birth_state: str
    status: str
    created_at: datetime
    updated_at: datetime
    blockchain_tx: Optional[str]

    class Config:
        from_attributes = True

class BiometricEnrollRequest(BaseModel):
    type: str = Field(..., pattern="^(fingerprint|face|iris)$")
    template_data: str  # Base64 string of biometric image/template
    device_id: str

class BiometricVerifyRequest(BaseModel):
    chin: str
    biometric_type: str = Field(..., pattern="^(fingerprint|face|iris)$")
    template_data: str  # base64 encrypted template
    liveness_score: Optional[float] = None
    device_id: str

class BiometricVerifyResponse(BaseModel):
    verified: bool
    confidence: float
    session_token: Optional[str] = None
    expires_at: Optional[datetime] = None

class TimelineEvent(BaseModel):
    timestamp: datetime
    event_type: str
    description: str
    actor: Optional[str] = None
    blockchain_tx: Optional[str] = None
    metadata: Optional[dict[str, Any]] = None
