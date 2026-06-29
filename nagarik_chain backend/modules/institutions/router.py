from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import require_chin_auth, require_officer_integrity, TokenClaims
from modules.institutions.schemas import (
    InstitutionRegisterRequest, 
    InstitutionResponse, 
    ProfessionalRegisterRequest, 
    ProfessionalResponse
)
from modules.institutions.service import InstitutionsService
from modules.documents.schemas import DocumentResponse

router = APIRouter()

@router.post("/register", response_model=InstitutionResponse, status_code=status.HTTP_201_CREATED)
def register_institution(req: InstitutionRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a new institution node (hospital, court, bank, university, etc.).
    """
    inst = InstitutionsService.register_institution(db, req)
    return inst

@router.get("/{inst_id}", response_model=InstitutionResponse)
def get_institution_details(inst_id: str, db: Session = Depends(get_db)):
    """
    Retrieves details of an institution.
    """
    inst = InstitutionsService.get_institution(db, inst_id)
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
    return inst

@router.post("/professionals/register", response_model=ProfessionalResponse, status_code=status.HTTP_201_CREATED)
def register_professional(
    req: ProfessionalRegisterRequest, 
    db: Session = Depends(get_db)
):
    """
    Registers a professional and issues a P-DID. Gated by node verification.
    """
    prof = InstitutionsService.register_professional(db, req)
    return prof

@router.get("/professionals/{pdid}", response_model=ProfessionalResponse)
def verify_professional_pdid(pdid: str, db: Session = Depends(get_db)):
    """
    Verifies professional license validity on-chain.
    """
    prof = InstitutionsService.get_professional(db, pdid)
    if not prof:
        raise HTTPException(status_code=404, detail="Professional credential not found")
    return prof

@router.put("/professionals/{pdid}/suspend", response_model=ProfessionalResponse)
def suspend_professional_license(
    pdid: str, 
    db: Session = Depends(get_db),
    current_officer: TokenClaims = Depends(require_officer_integrity)
):
    """
    Suspends a professional's P-DID license. Gated by officer integrity.
    """
    prof = InstitutionsService.suspend_professional(db, pdid, current_officer.sub)
    return prof

@router.get("/professionals/{pdid}/documents", response_model=List[DocumentResponse])
def list_documents_signed_by_professional(
    pdid: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Lists all documents signed/issued by this professional. Gated by citizen auth.
    """
    docs = InstitutionsService.list_professional_signed_documents(db, pdid)
    return docs
