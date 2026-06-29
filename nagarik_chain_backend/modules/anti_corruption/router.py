from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import require_chin_auth, TokenClaims
from modules.anti_corruption.schemas import (
    BribeReportRequest, 
    BribeReportResponse, 
    IntegrityScoreResponse, 
    DecoyApplicationRequest, 
    DecoyApplicationResponse,
    WhistleblowerVaultResponse
)
from modules.anti_corruption.service import AntiCorruptionService

router = APIRouter()

@router.post("/report/bribe", response_model=BribeReportResponse, status_code=status.HTTP_201_CREATED)
def submit_bribe_report(req: BribeReportRequest, db: Session = Depends(get_db)):
    """
    Submits an anonymous or signed encrypted bribe report. Computes automated integrity score updates.
    """
    report = AntiCorruptionService.submit_bribe_report(db, req)
    return BribeReportResponse(
        report_id=report.report_id,
        status=report.status,
        created_at=report.created_at,
        blockchain_tx=report.blockchain_tx
    )

@router.get("/score/{officer_chin}", response_model=IntegrityScoreResponse)
def get_integrity_score(
    officer_chin: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Retrieves the live integrity score for an officer.
    """
    score = AntiCorruptionService.get_integrity_score(db, officer_chin)
    return score

@router.get("/patterns/{inst_id}")
def get_delay_patterns(
    inst_id: str,
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Queries AI analysis for processing speed delays and spike patterns.
    """
    if current_user.role != "officer" and current_user.role != "court":
        raise HTTPException(status_code=403, detail="Unauthorized to query pattern anomalies")
        
    patterns = AntiCorruptionService.get_office_patterns(inst_id)
    return patterns

@router.post("/decoy", response_model=DecoyApplicationResponse)
def inject_decoy_test(
    req: DecoyApplicationRequest, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Injects a decoy application into an officer's queue for integrity assessment.
    """
    if current_user.role != "officer" and current_user.role != "court":
        raise HTTPException(status_code=403, detail="Only authorized entities can run decoy checks")
        
    decoy = AntiCorruptionService.inject_decoy_application(db, req)
    return decoy

@router.get("/whistleblower/{report_id}", response_model=WhistleblowerVaultResponse)
def get_whistleblower_report(
    report_id: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Sealed access retrieval of decrypted whistleblower report. Gated by Court role key.
    """
    # Enforce Court-only sealed-vault ZK proof/JWT check
    if current_user.role != "court":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Court authorization (special sealed-vault role claim) required"
        )
        
    report = AntiCorruptionService.whistleblower_retrieve(db, report_id)
    return report
