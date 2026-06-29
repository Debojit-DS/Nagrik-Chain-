from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class IdentityVerifyRequest(BaseModel):
    chin: str
    biometric_type: str = Field(..., pattern="^(fingerprint|face|iris)$")
    template_data: str  # base64 encoded template
    device_id: str

class DocumentVerifyRequest(BaseModel):
    doc_id: str
    ocr_languages: List[str] = ["en"]
    expected_fields: List[str] = []

class EligibilityVerifyRequest(BaseModel):
    chin: str
    benefit_program: str  # e.g., PM-KISAN, Scholarship, Pension

class FraudDetectRequest(BaseModel):
    chin: str
    doc_ids: List[str]
    context: str  # e.g., property_registration, loan_application
    institution_id: str

class FraudDetectResponse(BaseModel):
    verdict: str  # approved | assisted_review | manual_review | rejected
    fraud_score: float
    flags: List[str]
    explanation: str
    verification_id: str
    blockchain_tx: str

class AIVerificationResponse(BaseModel):
    verification_id: str
    chin: Optional[str]
    doc_id: Optional[str]
    verification_type: str
    result: str
    confidence: float
    blockchain_tx: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class SHAPExplanationResponse(BaseModel):
    verification_id: str
    features: List[str]
    shap_values: List[float]
    base_value: float
    readable_summary: str
