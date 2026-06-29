import base64
import time
import uuid
import random
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from cryptography.fernet import Fernet

from config import settings
import blockchain
import ipfs
from modules.anti_corruption.models import BribeReport, IntegrityScore
from modules.anti_corruption.schemas import BribeReportRequest, DecoyApplicationRequest, DecoyApplicationResponse, WhistleblowerVaultResponse
from modules.audit.models import AuditLog
from modules.audit.service import AuditService
from modules.identity.models import Citizen

# Derive key from secret to ensure Fernet uses a valid 32-byte urlsafe base64 key
derived_key = base64.urlsafe_b64encode(settings.JWT_SECRET.ljust(32)[:32].encode('utf-8'))
fernet = Fernet(derived_key)

class AntiCorruptionService:
    @classmethod
    def encrypt_text(cls, text: str) -> str:
        return fernet.encrypt(text.encode('utf-8')).decode('utf-8')

    @classmethod
    def decrypt_text(cls, token: str) -> str:
        return fernet.decrypt(token.encode('utf-8')).decode('utf-8')

    @classmethod
    def submit_bribe_report(cls, db: Session, req: BribeReportRequest) -> BribeReport:
        # Encrypt the description (court-only sealed vault access)
        encrypted_description = cls.encrypt_text(req.description)
        
        # Upload evidence to mock IPFS if present
        evidence_cid = None
        if req.evidence_file:
            _, evidence_cid = ipfs.upload_to_ipfs(req.evidence_file)
            
        # Anchor on-chain
        fabric_payload = {
            "action": "SUBMIT_BRIBE_REPORT",
            "officer_inst_id": req.officer_inst_id,
            "application_ref": req.application_ref,
            "evidence_ipfs": evidence_cid
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        
        # Save to database
        db_report = BribeReport(
            reporter_chin=req.reporter_chin,
            officer_inst_id=req.officer_inst_id,
            application_ref=req.application_ref,
            description_enc=encrypted_description,
            evidence_ipfs=evidence_cid,
            status="open",
            blockchain_tx=tx_id
        )
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin=req.reporter_chin or "ANONYMOUS",
            action="SUBMIT_BRIBE_REPORT",
            resource_type="bribe_report",
            resource_id=db_report.report_id,
            blockchain_tx=tx_id
        )
        
        # Penalty: Scan audit logs for the officer who worked on the application reference
        if req.application_ref:
            officer_log = db.query(AuditLog).filter(
                (AuditLog.resource_id == req.application_ref) | 
                (AuditLog.action.contains(req.application_ref))
            ).first()
            
            officer_chin = None
            if officer_log and officer_log.actor_chin and officer_log.actor_chin != "SYSTEM":
                officer_chin = officer_log.actor_chin
                
            if officer_chin:
                cls.apply_integrity_penalty(db, officer_chin, penalty=15.0, case_type="bribe_report")
                
        return db_report

    @classmethod
    def apply_integrity_penalty(cls, db: Session, officer_chin: str, penalty: float, case_type: str):
        """
        Decrements the integrity score of an officer.
        """
        score_record = db.query(IntegrityScore).filter(
            IntegrityScore.officer_chin == officer_chin
        ).first()
        
        if not score_record:
            score_record = IntegrityScore(
                officer_chin=officer_chin,
                score=100.0,
                total_cases=0,
                auto_approved=0,
                escalated=0,
                bribe_reports=0,
                decoy_catches=0
            )
            db.add(score_record)
            
        score_record.total_cases += 1
        if case_type == "bribe_report":
            score_record.bribe_reports += 1
            score_record.score = max(0.0, score_record.score - penalty)
        elif case_type == "decoy_fail":
            score_record.decoy_catches += 1
            score_record.score = max(0.0, score_record.score - penalty)
            
        db.commit()
        
        # Check if score fell below threshold and log a warning
        if score_record.score < 60.0:
            AuditService.log_action(
                db,
                actor_chin="SYSTEM",
                action="INTEGRITY_SCORE_ALERT",
                resource_type="citizen",
                resource_id=officer_chin,
                metadata={"score": score_record.score, "alert": "Suspended from sensitive officer operations"}
            )

    @classmethod
    def get_integrity_score(cls, db: Session, officer_chin: str) -> IntegrityScore:
        score_record = db.query(IntegrityScore).filter(
            IntegrityScore.officer_chin == officer_chin
        ).first()
        
        if not score_record:
            # Create a default score entry if one doesn't exist
            score_record = IntegrityScore(
                officer_chin=officer_chin,
                score=100.0,
                total_cases=0,
                auto_approved=0,
                escalated=0,
                bribe_reports=0,
                decoy_catches=0
            )
            db.add(score_record)
            db.commit()
            db.refresh(score_record)
            
        return score_record

    @staticmethod
    def get_office_patterns(inst_id: str) -> dict:
        """
        Analyzes office patterns for delays and abnormal approvals (Spikes).
        """
        # Returns mock data reflecting potential corruption/efficiency indicators
        return {
            "institution_id": inst_id,
            "average_processing_time_days": 14.2,
            "delay_spike_detected": True,
            "delay_spike_percent": 145.0,
            "irregular_rejections_count": 8,
            "auto_approval_ratio": 0.28,
            "ai_corruption_risk_index": 0.65,  # high risk
            "reasons": ["High density of late-evening approvals", "Duplicate relation nodes detected in manual reviews"]
        }

    @classmethod
    def inject_decoy_application(cls, db: Session, req: DecoyApplicationRequest) -> DecoyApplicationResponse:
        # Check officer
        officer = db.query(Citizen).filter(Citizen.chin == req.officer_chin).first()
        if not officer:
            raise HTTPException(status_code=404, detail="Officer profile not found")
            
        app_ref = f"DEC-{uuid.uuid4().hex[:12].upper()}"
        
        # Log decoy injection
        AuditService.log_action(
            db,
            actor_chin="SYSTEM",
            action="DECOY_APPLICATION_INJECTED",
            resource_type="citizen",
            resource_id=req.officer_chin,
            metadata={"application_ref": app_ref, "decoy_type": req.decoy_type}
        )
        
        # Update decoy counts in score
        score_record = db.query(IntegrityScore).filter(
            IntegrityScore.officer_chin == req.officer_chin
        ).first()
        if not score_record:
            score_record = IntegrityScore(officer_chin=req.officer_chin)
            db.add(score_record)
            
        score_record.total_cases += 1
        score_record.decoy_catches += 1
        
        # Simulate decoy evaluation result: 80% pass (adds 5 points), 20% fail (loses 25 points)
        pass_decoy = random.choice([True, True, True, True, False])
        if pass_decoy:
            score_record.score = min(100.0, score_record.score + 5.0)
            status_result = "passed"
        else:
            score_record.score = max(0.0, score_record.score - 25.0)
            status_result = "failed"
            # Log decoy fail
            AuditService.log_action(
                db,
                actor_chin="SYSTEM",
                action="DECOY_CHECK_FAILED",
                resource_type="citizen",
                resource_id=req.officer_chin,
                metadata={"application_ref": app_ref, "result": "Asked for manual processing override outside checklist"}
            )
            
        db.commit()
        
        return DecoyApplicationResponse(
            application_ref=app_ref,
            officer_chin=req.officer_chin,
            status=status_result,
            created_at=datetime.utcnow()
        )

    @classmethod
    def whistleblower_retrieve(cls, db: Session, report_id: str) -> WhistleblowerVaultResponse:
        report = db.query(BribeReport).filter(BribeReport.report_id == report_id).first()
        if not report:
            raise HTTPException(status_code=404, detail="Bribe report not found in the vault")
            
        # Decrypt description
        decrypted_description = cls.decrypt_text(report.description_enc)
        
        return WhistleblowerVaultResponse(
            report_id=report.report_id,
            reporter_chin=report.reporter_chin,
            officer_inst_id=report.officer_inst_id,
            application_ref=report.application_ref,
            description_decrypted=decrypted_description,
            evidence_ipfs=report.evidence_ipfs,
            status=report.status,
            created_at=report.created_at,
            blockchain_tx=report.blockchain_tx
        )
