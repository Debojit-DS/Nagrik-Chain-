import hashlib
import time
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import blockchain
from modules.institutions.models import Institution, Professional
from modules.institutions.schemas import InstitutionRegisterRequest, ProfessionalRegisterRequest
from modules.identity.models import Citizen
from modules.documents.models import Document
from modules.audit.service import AuditService

class InstitutionsService:
    @classmethod
    def register_institution(cls, db: Session, req: InstitutionRegisterRequest) -> Institution:
        # Check if already exists
        existing = db.query(Institution).filter(Institution.registration_no == req.registration_no).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Institution already registered with Registration Number {req.registration_no}"
            )
            
        db_inst = Institution(
            name=req.name,
            type=req.type,
            registration_no=req.registration_no,
            state=req.state,
            district=req.district,
            node_public_key=req.node_public_key,
            status="active"
        )
        db.add(db_inst)
        db.commit()
        db.refresh(db_inst)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin="SYSTEM",
            action="REGISTER_INSTITUTION",
            resource_type="institution",
            resource_id=db_inst.inst_id,
            metadata={"name": req.name, "type": req.type}
        )
        
        return db_inst

    @staticmethod
    def get_institution(db: Session, inst_id: str) -> Optional[Institution]:
        return db.query(Institution).filter(Institution.inst_id == inst_id).first()

    @classmethod
    def register_professional(cls, db: Session, req: ProfessionalRegisterRequest) -> Professional:
        # Check if citizen exists
        citizen = db.query(Citizen).filter(Citizen.chin == req.chin).first()
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Citizen with CHIN {req.chin} not found"
            )
            
        # Check if license already registered
        existing = db.query(Professional).filter(Professional.license_number == req.license_number).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"License number {req.license_number} is already registered"
            )
            
        # Generate P-DID
        license_hash = hashlib.sha256(req.license_number.encode('utf-8')).hexdigest()
        pdid = f"did:nagarik:pdid:{req.profession.lower()}:{license_hash[:16]}"
        
        # Anchor professional on Fabric blockchain
        fabric_payload = {
            "action": "PROFESSIONAL_REGISTRATION",
            "pdid": pdid,
            "chin": req.chin,
            "profession": req.profession,
            "license_number": req.license_number,
            "issuing_body": req.issuing_body
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        
        # Save professional record
        db_prof = Professional(
            pdid=pdid,
            chin=req.chin,
            profession=req.profession,
            license_number=req.license_number,
            issuing_body=req.issuing_body,
            valid_from=req.valid_from,
            valid_until=req.valid_until,
            specializations=req.specializations,
            status="active",
            blockchain_tx=tx_id
        )
        db.add(db_prof)
        db.commit()
        db.refresh(db_prof)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin="SYSTEM",
            action="REGISTER_PROFESSIONAL",
            resource_type="professional",
            resource_id=pdid,
            metadata={"profession": req.profession, "license": req.license_number},
            blockchain_tx=tx_id
        )
        
        return db_prof

    @staticmethod
    def get_professional(db: Session, pdid: str) -> Optional[Professional]:
        return db.query(Professional).filter(Professional.pdid == pdid).first()

    @classmethod
    def suspend_professional(cls, db: Session, pdid: str, officer_chin: str) -> Professional:
        prof = db.query(Professional).filter(Professional.pdid == pdid).first()
        if not prof:
            raise HTTPException(status_code=404, detail="Professional credential not found")
            
        if prof.status == "suspended":
            raise HTTPException(status_code=400, detail="Professional credential is already suspended")
            
        prof.status = "suspended"
        
        # Anchor suspension on Fabric
        fabric_payload = {
            "action": "PROFESSIONAL_SUSPENSION",
            "pdid": pdid,
            "suspended_by": officer_chin,
            "timestamp": str(time.time())
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        prof.blockchain_tx = tx_id
        
        db.commit()
        db.refresh(prof)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin=officer_chin,
            action="SUSPEND_PROFESSIONAL",
            resource_type="professional",
            resource_id=pdid,
            metadata={"status": "suspended"},
            blockchain_tx=tx_id
        )
        
        return prof

    @staticmethod
    def list_professional_signed_documents(db: Session, pdid: str) -> List[Document]:
        return db.query(Document).filter(Document.issued_by == pdid).all()
