from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import require_chin_auth, require_pdid_auth, require_officer_integrity, TokenClaims
from modules.documents.schemas import (
    DocumentIssueRequest, 
    DocumentResponse, 
    DocumentVerifyResponse, 
    BatchVerifyRequest, 
    BatchVerifyResponse
)
from modules.documents.service import DocumentsService

router = APIRouter()

@router.post("/issue", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def issue_document(
    req: DocumentIssueRequest, 
    db: Session = Depends(get_db),
    current_professional: TokenClaims = Depends(require_pdid_auth)
):
    """
    Issues a new document (degree, title, cert). Gated by P-DID auth.
    """
    # Enforce that the issuer P-DID matches the one in claims (or let officers override)
    if req.issued_by != current_professional.pdid and current_professional.role != "officer":
         raise HTTPException(
             status_code=status.HTTP_403_FORBIDDEN, 
             detail="Issued-by P-DID must match authenticated P-DID"
         )
         
    doc = DocumentsService.issue_document(db, req)
    return doc

@router.get("/types")
def get_supported_types():
    """
    Lists supported document types and metadata structures.
    """
    return DocumentsService.get_supported_types()

@router.get("/{doc_id}", response_model=DocumentResponse)
def get_document_metadata(
    doc_id: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Retrieves document metadata. Gated by CHIN authentication.
    """
    doc = DocumentsService.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Gated: citizen owns the document, or is an officer
    if doc.chin != current_user.sub and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to access this document metadata")
        
    return doc

@router.get("/{doc_id}/verify", response_model=DocumentVerifyResponse)
def verify_document(doc_id: str, db: Session = Depends(get_db)):
    """
    Verifies document authenticity against ledger. Open to public verification.
    """
    return DocumentsService.verify_document(db, doc_id)

@router.post("/{doc_id}/revoke", response_model=DocumentResponse)
def revoke_document(
    doc_id: str, 
    db: Session = Depends(get_db),
    current_officer: TokenClaims = Depends(require_officer_integrity)
):
    """
    Revokes a document. Gated by officer integrity checks.
    """
    doc = DocumentsService.revoke_document(db, doc_id, current_officer.sub)
    return doc

@router.get("/citizen/{chin}", response_model=List[DocumentResponse])
def list_citizen_documents(
    chin: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Lists all documents belonging to a citizen. Owner/officer only.
    """
    if current_user.sub != chin and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to list documents for this citizen")
        
    docs = DocumentsService.list_citizen_documents(db, chin)
    return docs

@router.post("/batch-verify", response_model=BatchVerifyResponse)
def batch_verify_documents(req: BatchVerifyRequest, db: Session = Depends(get_db)):
    """
    Bulk verify up to 100 document hashes against blockchain anchors.
    """
    if len(req.doc_hashes) > 100:
        raise HTTPException(status_code=400, detail="Cannot verify more than 100 hashes in a single batch")
        
    results = DocumentsService.batch_verify(db, req.doc_hashes)
    return BatchVerifyResponse(results=results)
