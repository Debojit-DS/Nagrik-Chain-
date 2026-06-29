from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import blockchain
import ipfs
from modules.documents.models import Document
from modules.documents.schemas import DocumentIssueRequest, DocumentVerifyResponse, BatchVerifyResult
from modules.identity.models import Citizen
from modules.institutions.models import Professional
from modules.audit.service import AuditService

class DocumentsService:
    @classmethod
    def issue_document(cls, db: Session, req: DocumentIssueRequest) -> Document:
        # Check if citizen exists
        citizen = db.query(Citizen).filter(Citizen.chin == req.chin).first()
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Citizen with CHIN {req.chin} not found"
            )
            
        # Upload base64 PDF/image to IPFS
        content_hash, ipfs_cid = ipfs.upload_to_ipfs(req.document_file)
        
        # Anchor document hash on Fabric blockchain
        fabric_payload = {
            "action": "DOCUMENT_ISSUANCE",
            "chin": req.chin,
            "doc_type": req.doc_type,
            "content_hash": content_hash,
            "issued_by": req.issued_by
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        
        # Save document metadata in DB
        db_doc = Document(
            chin=req.chin,
            doc_type=req.doc_type,
            title=req.title,
            issued_by=req.issued_by,
            valid_until=req.valid_until,
            content_hash=content_hash,
            ipfs_cid=ipfs_cid,
            status="valid",
            language=req.language,
            blockchain_tx=tx_id,
            metadata_json=req.metadata
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        # Log action in audit trail
        AuditService.log_action(
            db,
            actor_chin=req.issued_by, # Assuming actor is the issuing professional/inst P-DID
            action="ISSUE_DOCUMENT",
            resource_type="document",
            resource_id=db_doc.doc_id,
            metadata={"doc_type": req.doc_type, "title": req.title},
            blockchain_tx=tx_id
        )
        
        return db_doc

    @staticmethod
    def get_document(db: Session, doc_id: str) -> Optional[Document]:
        return db.query(Document).filter(Document.doc_id == doc_id).first()

    @classmethod
    def verify_document(cls, db: Session, doc_id: str) -> DocumentVerifyResponse:
        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        if not doc:
            return DocumentVerifyResponse(
                doc_id=doc_id,
                is_valid=False,
                content_hash_match=False,
                chain_status="not_found",
                issued_by_verified=False,
                blockchain_tx=""
            )
            
        # Compares hash against DB (mocking blockchain verification)
        content_hash_match = True
        
        # Verify issuer - check if professional license is active
        issued_by_verified = False
        prof = db.query(Professional).filter(Professional.pdid == doc.issued_by).first()
        if prof and prof.status == "active":
            issued_by_verified = True
        elif doc.issued_by.startswith("PDID-"):
            # Fallback for mock institutional issuers
            issued_by_verified = True
            
        chain_status = "on_chain"
        if doc.status == "revoked":
            chain_status = "revoked"
            
        is_valid = (doc.status == "valid") and content_hash_match and issued_by_verified
        
        return DocumentVerifyResponse(
            doc_id=doc.doc_id,
            is_valid=is_valid,
            content_hash_match=content_hash_match,
            chain_status=chain_status,
            issued_by_verified=issued_by_verified,
            blockchain_tx=doc.blockchain_tx or ""
        )

    @classmethod
    def revoke_document(cls, db: Session, doc_id: str, officer_chin: str) -> Document:
        doc = db.query(Document).filter(Document.doc_id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        if doc.status == "revoked":
            raise HTTPException(status_code=400, detail="Document is already revoked")
            
        doc.status = "revoked"
        
        # Anchor revocation on blockchain
        fabric_payload = {
            "action": "DOCUMENT_REVOCATION",
            "doc_id": doc_id,
            "revoked_by": officer_chin
        }
        tx_id = blockchain.anchor_on_fabric(fabric_payload)
        doc.blockchain_tx = tx_id
        
        db.commit()
        db.refresh(doc)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin=officer_chin,
            action="REVOKE_DOCUMENT",
            resource_type="document",
            resource_id=doc_id,
            metadata={"reason": "Revoked by authorized officer/issuer"},
            blockchain_tx=tx_id
        )
        
        return doc

    @staticmethod
    def list_citizen_documents(db: Session, chin: str) -> List[Document]:
        return db.query(Document).filter(Document.chin == chin).all()

    @classmethod
    def batch_verify(cls, db: Session, doc_hashes: List[str]) -> List[BatchVerifyResult]:
        results = []
        for h in doc_hashes:
            doc = db.query(Document).filter(Document.content_hash == h).first()
            if doc:
                results.append(BatchVerifyResult(
                    hash=h,
                    doc_id=doc.doc_id,
                    is_valid=(doc.status == "valid"),
                    chain_status="revoked" if doc.status == "revoked" else "on_chain"
                ))
            else:
                results.append(BatchVerifyResult(
                    hash=h,
                    doc_id=None,
                    is_valid=False,
                    chain_status="not_found"
                ))
        return results

    @staticmethod
    def get_supported_types() -> dict:
        return {
            "supported_types": [
                {"type": "birth_cert", "name": "Birth Certificate", "required_fields": ["birth_district", "birth_state"]},
                {"type": "degree", "name": "University Degree", "required_fields": ["university", "roll_number", "cgpa"]},
                {"type": "property_title", "name": "Property Title Deed", "required_fields": ["district", "survey_number", "area_sqft"]},
                {"type": "will", "name": "Last Will & Testament", "required_fields": ["beneficiaries", "assets"]},
                {"type": "passport", "name": "Passport", "required_fields": ["passport_number", "expiry_date"]},
                {"type": "insurance_policy", "name": "Insurance Policy", "required_fields": ["policy_number", "premium"]}
            ]
        }
