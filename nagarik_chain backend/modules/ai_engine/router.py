from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import require_chin_auth, require_officer_integrity, TokenClaims
from modules.ai_engine.schemas import (
    IdentityVerifyRequest, 
    DocumentVerifyRequest, 
    EligibilityVerifyRequest, 
    FraudDetectRequest, 
    FraudDetectResponse,
    AIVerificationResponse,
    SHAPExplanationResponse
)
from modules.ai_engine.service import AIEngineService

router = APIRouter()

@router.post("/verify/identity", response_model=AIVerificationResponse)
def verify_identity_liveness(req: IdentityVerifyRequest, db: Session = Depends(get_db)):
    """
    Performs real-time AI biometric + liveness verification.
    """
    verification = AIEngineService.verify_identity_ai(db, req)
    return verification

@router.post("/verify/document", response_model=AIVerificationResponse)
def verify_document_ocr(
    req: DocumentVerifyRequest, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Performs AI OCR verification on an issued document.
    """
    verification = AIEngineService.verify_document_ai(db, req)
    return verification

@router.post("/verify/eligibility", response_model=AIVerificationResponse)
def verify_benefits_eligibility(
    req: EligibilityVerifyRequest, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Verifies citizen benefits/schemes eligibility.
    """
    verification = AIEngineService.verify_eligibility_ai(db, req)
    return verification

@router.post("/detect/fraud", response_model=FraudDetectResponse)
def detect_fraud_network(
    req: FraudDetectRequest, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Evaluates risk and detects fraud networks across nodes.
    """
    response = AIEngineService.detect_fraud_ai(db, req)
    return response

@router.get("/explain/{verification_id}", response_model=SHAPExplanationResponse)
def get_shap_explainability(
    verification_id: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Returns SHAP-based feature importance weight values for an AI decision.
    """
    shap = AIEngineService.get_shap_explanation(db, verification_id)
    return shap

@router.post("/escalate/{verification_id}", response_model=AIVerificationResponse)
def escalate_to_human_review(
    verification_id: str, 
    db: Session = Depends(get_db),
    current_officer: TokenClaims = Depends(require_officer_integrity)
):
    """
    Routes an AI verdict to the human review queue. Gated by officer integrity.
    """
    verification = AIEngineService.escalate_verification(db, verification_id, current_officer.sub)
    return verification
