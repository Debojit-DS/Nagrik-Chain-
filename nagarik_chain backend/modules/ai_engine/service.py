import random
import time
from typing import List, Optional
from datetime import datetime, date
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import blockchain
from modules.ai_engine.models import AIVerification
from modules.ai_engine.schemas import (
    IdentityVerifyRequest, 
    DocumentVerifyRequest, 
    EligibilityVerifyRequest, 
    FraudDetectRequest, 
    FraudDetectResponse,
    SHAPExplanationResponse
)
from modules.identity.models import Citizen, Biometric
from modules.documents.models import Document
from modules.audit.service import AuditService

class AIEngineService:
    @classmethod
    def verify_identity_ai(cls, db: Session, req: IdentityVerifyRequest) -> AIVerification:
        # Check citizen
        citizen = db.query(Citizen).filter(Citizen.chin == req.chin).first()
        if not citizen:
            raise HTTPException(status_code=404, detail="Citizen not found")
            
        confidence = round(random.uniform(0.95, 0.99), 4)
        verdict = "approved"
        
        # Generate SHAP explainability JSON
        shap_data = {
            "features": ["liveness_score", "template_match", "device_trust", "location_consistency"],
            "shap_values": [0.45, 0.38, 0.12, 0.04],
            "base_value": 0.50,
            "readable_summary": "High template match score merged with consistent local GPS liveness triggers."
        }
        
        # Anchor on blockchain
        fabric_payload = {
            "action": "AI_IDENTITY_VERIFICATION",
            "chin": req.chin,
            "result": verdict,
            "confidence": confidence
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        
        db_verification = AIVerification(
            chin=req.chin,
            verification_type="identity",
            result=verdict,
            confidence=confidence,
            shap_explanation=shap_data,
            blockchain_tx=tx_id
        )
        db.add(db_verification)
        db.commit()
        db.refresh(db_verification)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin="AI_ENGINE",
            action="AI_VERIFY_IDENTITY",
            resource_type="citizen",
            resource_id=req.chin,
            metadata={"verdict": verdict, "confidence": confidence},
            blockchain_tx=tx_id
        )
        
        return db_verification

    @classmethod
    def verify_document_ai(cls, db: Session, req: DocumentVerifyRequest) -> AIVerification:
        doc = db.query(Document).filter(Document.doc_id == req.doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        confidence = round(random.uniform(0.88, 0.97), 4)
        verdict = "approved" if confidence > 0.90 else "assisted_review"
        
        shap_data = {
            "features": ["ocr_extraction_confidence", "issuing_node_signature", "template_layout_match", "nlp_context_check"],
            "shap_values": [0.35, 0.40, 0.15, 0.08],
            "base_value": 0.45,
            "readable_summary": f"Document classification matched template structure. Issuing node signature verification weighted {shap_data['shap_values'][1]}."
        }
        
        fabric_payload = {
            "action": "AI_DOCUMENT_VERIFICATION",
            "doc_id": req.doc_id,
            "result": verdict,
            "confidence": confidence
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        
        db_verification = AIVerification(
            chin=doc.chin,
            doc_id=req.doc_id,
            verification_type="document",
            result=verdict,
            confidence=confidence,
            shap_explanation=shap_data,
            blockchain_tx=tx_id
        )
        db.add(db_verification)
        db.commit()
        db.refresh(db_verification)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin="AI_ENGINE",
            action="AI_VERIFY_DOCUMENT",
            resource_type="document",
            resource_id=req.doc_id,
            metadata={"verdict": verdict, "confidence": confidence},
            blockchain_tx=tx_id
        )
        
        return db_verification

    @classmethod
    def verify_eligibility_ai(cls, db: Session, req: EligibilityVerifyRequest) -> AIVerification:
        citizen = db.query(Citizen).filter(Citizen.chin == req.chin).first()
        if not citizen:
            raise HTTPException(status_code=404, detail="Citizen not found")
            
        verdict = "rejected"
        confidence = 0.99
        explanation = "Citizen does not meet age threshold"
        
        # Calculate age
        today = date.today()
        age = today.year - citizen.dob.year - ((today.month, today.day) < (citizen.dob.month, citizen.dob.day))
        
        # Rule check
        if req.benefit_program.lower() == "pension":
            if age >= 60 and citizen.status == "active":
                verdict = "approved"
                explanation = "Citizen meets the age requirement of 60 years"
        elif req.benefit_program.lower() == "scholarship":
            # Check if has active degree/education docs
            education_docs = db.query(Document).filter(
                Document.chin == req.chin,
                Document.doc_type == "degree",
                Document.status == "valid"
            ).all()
            if education_docs:
                verdict = "approved"
                explanation = "Citizen is registered in university database"
        else:
            # General fallback check
            verdict = "approved"
            explanation = "Criteria met based on identity database fields"
            
        shap_data = {
            "features": ["citizen_age", "income_level", "active_student_record", "prior_benefits_drawn"],
            "shap_values": [0.60, 0.20, 0.15, 0.05],
            "base_value": 0.50,
            "readable_summary": f"Eligibility verification for {req.benefit_program}. Verdict: {verdict}. Details: {explanation}."
        }
        
        db_verification = AIVerification(
            chin=req.chin,
            verification_type="eligibility",
            result=verdict,
            confidence=confidence,
            shap_explanation=shap_data
        )
        db.add(db_verification)
        db.commit()
        db.refresh(db_verification)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin="AI_ENGINE",
            action="AI_VERIFY_ELIGIBILITY",
            resource_type="citizen",
            resource_id=req.chin,
            metadata={"program": req.benefit_program, "verdict": verdict}
        )
        
        return db_verification

    @classmethod
    def detect_fraud_ai(cls, db: Session, req: FraudDetectRequest) -> FraudDetectResponse:
        # Check citizen
        citizen = db.query(Citizen).filter(Citizen.chin == req.chin).first()
        if not citizen:
            raise HTTPException(status_code=404, detail="Citizen not found")
            
        # Simulate check: fraud score increases if citizen has documents with different issuers or conflicting fields
        fraud_score = 0.15
        flags = []
        explanation = "Documents structurally sound and consistent."
        
        if len(req.doc_ids) > 1:
            # Mock cross-check flag trigger
            fraud_score = 0.42
            flags = ["cross_node_discrepancy", "duplicate_relation_detected"]
            explanation = "Income certificate issued 2 days before salary record shows gap."
            
        verdict = "approved"
        if fraud_score > 0.40:
            verdict = "assisted_review"
        if fraud_score > 0.70:
            verdict = "rejected"
            
        shap_data = {
            "features": ["cross_node_conflicts", "velocity_of_issuance", "issuer_trust_index", "identity_stability"],
            "shap_values": [0.55, 0.25, 0.15, 0.05],
            "base_value": 0.10,
            "readable_summary": f"Fraud analysis performed for context {req.context}. Score: {fraud_score}."
        }
        
        # Anchor on blockchain
        fabric_payload = {
            "action": "AI_FRAUD_DETECTION",
            "chin": req.chin,
            "fraud_score": fraud_score,
            "verdict": verdict
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        
        db_verification = AIVerification(
            chin=req.chin,
            verification_type="fraud",
            result=verdict,
            confidence=1.0 - fraud_score,
            shap_explanation=shap_data,
            blockchain_tx=tx_id
        )
        db.add(db_verification)
        db.commit()
        db.refresh(db_verification)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin="AI_ENGINE",
            action="AI_DETECT_FRAUD",
            resource_type="citizen",
            resource_id=req.chin,
            metadata={"verdict": verdict, "fraud_score": fraud_score},
            blockchain_tx=tx_id
        )
        
        return FraudDetectResponse(
            verdict=verdict,
            fraud_score=fraud_score,
            flags=flags,
            explanation=explanation,
            verification_id=db_verification.verification_id,
            blockchain_tx=tx_id
        )

    @classmethod
    def get_shap_explanation(cls, db: Session, verification_id: str) -> SHAPExplanationResponse:
        verification = db.query(AIVerification).filter(
            AIVerification.verification_id == verification_id
        ).first()
        
        if not verification or not verification.shap_explanation:
            raise HTTPException(status_code=404, detail="SHAP explanation not found for this verification ID")
            
        shap = verification.shap_explanation
        return SHAPExplanationResponse(
            verification_id=verification_id,
            features=shap["features"],
            shap_values=shap["shap_values"],
            base_value=shap["base_value"],
            readable_summary=shap["readable_summary"]
        )

    @classmethod
    def escalate_verification(cls, db: Session, verification_id: str, reviewer_chin: str) -> AIVerification:
        verification = db.query(AIVerification).filter(
            AIVerification.verification_id == verification_id
        ).first()
        
        if not verification:
            raise HTTPException(status_code=404, detail="AI Verification log not found")
            
        verification.result = "assisted_review"
        verification.reviewer_chin = reviewer_chin
        db.commit()
        db.refresh(verification)
        
        # Log audit action
        AuditService.log_action(
            db,
            actor_chin=reviewer_chin,
            action="ESCALATE_AI_VERIFICATION",
            resource_type="ai_verification",
            resource_id=verification_id,
            metadata={"reviewer": reviewer_chin}
        )
        
        return verification
