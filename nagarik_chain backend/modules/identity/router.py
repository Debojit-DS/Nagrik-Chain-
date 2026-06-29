import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from auth import require_chin_auth, require_officer_integrity, TokenClaims
from zk import verify_zk_proof
from modules.identity.schemas import (
    CitizenRegisterRequest, 
    CitizenRegisterResponse, 
    CitizenResponse, 
    CitizenUpdateRequest,
    BiometricEnrollRequest,
    BiometricVerifyRequest,
    BiometricVerifyResponse,
    TimelineEvent
)
from modules.identity.service import IdentityService

router = APIRouter()

@router.post("/register", response_model=CitizenRegisterResponse, status_code=status.HTTP_201_CREATED)
def register_citizen(req: CitizenRegisterRequest, db: Session = Depends(get_db)):
    """
    Registers a newborn citizen, generates a CHIN, and anchors registration on Fabric.
    """
    citizen = IdentityService.register_citizen(db, req)
    return CitizenRegisterResponse(
        chin=citizen.chin,
        aadhaar_scheduled=True,
        blockchain_tx=citizen.blockchain_tx,
        chin_card_dispatch_eta_days=7
    )

@router.get("/{chin}", response_model=CitizenResponse)
def get_citizen_profile(
    chin: str,
    proof_json: Optional[str] = Query(None, description="Optional ZK-proof JSON string for gated access"),
    disclosed_fields: Optional[str] = Query(None, description="Comma-separated fields to disclose if using ZK-proof"),
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Retrieves citizen profile. Access is either:
    1. Authenticated owner (current_user.sub == chin)
    2. Gated via verified ZK proof (for third-party verification)
    """
    citizen = IdentityService.get_citizen(db, chin)
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen profile not found")
        
    # Check authorization: owner or officer or ZK proof
    is_owner = current_user.sub == chin
    is_officer = current_user.role == "officer"
    
    if not (is_owner or is_officer):
        if proof_json and disclosed_fields:
            try:
                proof = json.loads(proof_json)
                fields = [f.strip() for f in disclosed_fields.split(",")]
                # Build revealed data structure for mock ZK verify
                revealed_data = {}
                for field in fields:
                    if hasattr(citizen, field):
                        revealed_data[field] = getattr(citizen, field)
                        
                if not verify_zk_proof(proof, revealed_data):
                    raise HTTPException(status_code=403, detail="Invalid ZK-proof verification")
                
                # Verified! Prepare selective disclosure response
                selective_response = {
                    "chin": citizen.chin,
                    "full_name": citizen.full_name if "full_name" in fields else "REDACTED",
                    "dob": citizen.dob if "dob" in fields else citizen.dob.replace(month=1, day=1), # age-only/masked
                    "gender": citizen.gender if "gender" in fields else "REDACTED",
                    "birth_district": citizen.birth_district if "birth_district" in fields else "REDACTED",
                    "birth_state": citizen.birth_state if "birth_state" in fields else "REDACTED",
                    "status": citizen.status,
                    "created_at": citizen.created_at,
                    "updated_at": citizen.updated_at,
                    "blockchain_tx": citizen.blockchain_tx
                }
                return selective_response
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid ZK-proof JSON format")
        else:
            raise HTTPException(status_code=403, detail="Access denied. Owner authorization or valid ZK-proof required")
            
    return citizen

@router.put("/{chin}", response_model=CitizenResponse)
def update_citizen_profile(
    chin: str,
    req: CitizenUpdateRequest,
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Updates mutable citizen details. Gated by owner/officer credentials.
    """
    if current_user.sub != chin and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to update this profile")
    
    citizen = IdentityService.update_citizen(db, chin, req, current_user.sub)
    return citizen

@router.post("/{chin}/biometrics", status_code=status.HTTP_201_CREATED)
def enroll_biometric(
    chin: str,
    req: BiometricEnrollRequest,
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Enrolls citizen biometric template. Stores template in IPFS, metadata in SQL, and anchors on Fabric.
    """
    if current_user.sub != chin and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to enroll biometrics for this citizen")
        
    bio = IdentityService.enroll_biometric(db, chin, req)
    return {
        "biometric_id": bio.id,
        "enrolled": True,
        "ipfs_cid": bio.ipfs_cid
    }

@router.post("/{chin}/verify", response_model=BiometricVerifyResponse)
def verify_biometric(
    chin: str,
    req: BiometricVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verifies citizen biometrics and liveness. If successful, issues a session JWT.
    """
    if req.chin != chin:
        raise HTTPException(status_code=400, detail="CHIN mismatch in path and body")
        
    result = IdentityService.verify_biometric(db, req)
    return result

@router.post("/{chin}/death", response_model=CitizenResponse)
def record_death(
    chin: str,
    db: Session = Depends(get_db),
    current_officer: TokenClaims = Depends(require_officer_integrity)
):
    """
    Records death of a citizen. Triggers downstream smart contracts. Gated by officer integrity.
    """
    citizen = IdentityService.record_death(db, chin, current_officer.sub)
    return citizen

@router.get("/{chin}/timeline", response_model=List[TimelineEvent])
def get_timeline(
    chin: str,
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Returns full life-event timeline based on database audit trail.
    """
    if current_user.sub != chin and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to view this timeline")
        
    timeline = IdentityService.get_timeline(db, chin)
    return timeline
