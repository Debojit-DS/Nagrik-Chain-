from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any

class BribeReportRequest(BaseModel):
    reporter_chin: Optional[str] = None  # None if anonymous
    officer_inst_id: str
    application_ref: Optional[str] = None
    description: str  # cleartext description; service will encrypt it
    evidence_file: Optional[str] = None  # base64 encoded evidence document

class BribeReportResponse(BaseModel):
    report_id: str
    status: str
    created_at: datetime
    blockchain_tx: Optional[str]

class WhistleblowerVaultResponse(BaseModel):
    report_id: str
    reporter_chin: Optional[str]
    officer_inst_id: Optional[str]
    application_ref: Optional[str]
    description_decrypted: str
    evidence_ipfs: Optional[str]
    status: str
    created_at: datetime
    blockchain_tx: Optional[str]

class IntegrityScoreResponse(BaseModel):
    officer_chin: str
    score: float
    total_cases: int
    auto_approved: int
    escalated: int
    bribe_reports: int
    decoy_catches: int
    updated_at: datetime

    class Config:
        from_attributes = True

class DecoyApplicationRequest(BaseModel):
    officer_chin: str
    decoy_type: str = "passport"  # passport | birth_cert | degree

class DecoyApplicationResponse(BaseModel):
    application_ref: str
    officer_chin: str
    status: str
    created_at: datetime
