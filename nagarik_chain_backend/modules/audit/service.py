from typing import List, Optional
from sqlalchemy.orm import Session
import blockchain
from modules.audit.models import AuditLog

class AuditService:
    @classmethod
    def log_action(
        cls,
        db: Session,
        actor_chin: Optional[str],
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        metadata: Optional[dict] = None,
        blockchain_tx: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        # If not already anchored, anchor this audit event on-chain
        if not blockchain_tx:
            payload = {
                "actor": actor_chin or "SYSTEM",
                "action": action,
                "resource_type": resource_type or "none",
                "resource_id": resource_id or "none",
                "timestamp": str(time.time())
            }
            blockchain_tx = blockchain.anchor_on_fabric(payload)
            
        db_log = AuditLog(
            actor_chin=actor_chin,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            metadata_json=metadata,
            ip_address=ip_address or "127.0.0.1",
            blockchain_tx=blockchain_tx
        )
        db.add(db_log)
        db.commit()
        db.refresh(db_log)
        return db_log

    @staticmethod
    def get_citizen_trail(db: Session, chin: str) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            (AuditLog.actor_chin == chin) |
            ((AuditLog.resource_type == "citizen") & (AuditLog.resource_id == chin))
        ).order_by(AuditLog.created_at.desc()).all()

    @staticmethod
    def get_document_trail(db: Session, doc_id: str) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            (AuditLog.resource_type == "document") & (AuditLog.resource_id == doc_id)
        ).order_by(AuditLog.created_at.desc()).all()

    @staticmethod
    def get_institution_trail(db: Session, inst_id: str) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            (AuditLog.resource_type == "institution") & (AuditLog.resource_id == inst_id)
        ).order_by(AuditLog.created_at.desc()).all()

    @staticmethod
    def get_officer_trail(db: Session, chin: str) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            (AuditLog.actor_chin == chin)
        ).order_by(AuditLog.created_at.desc()).all()

    @staticmethod
    def get_by_tx(db: Session, tx: str) -> Optional[AuditLog]:
        return db.query(AuditLog).filter(AuditLog.blockchain_tx == tx).first()

import time
