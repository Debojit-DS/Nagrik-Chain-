from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any, Dict, List

class DocumentIssueRequest(BaseModel):
    chin: str
    doc_type: str
    title: str
    issued_by: str  # P-DID or institution name/id
    valid_until: Optional[datetime] = None
    language: str = "en"
    metadata: Dict[str, Any] = Field(default_factory=dict)
    document_file: str  # base64 encoded document content

class DocumentResponse(BaseModel):
    doc_id: str
    chin: str
    doc_type: str
    title: Optional[str]
    issued_by: str
    issued_at: datetime
    valid_until: Optional[datetime]
    content_hash: str
    ipfs_cid: Optional[str]
    status: str
    language: str
    blockchain_tx: Optional[str]
    metadata_json: Optional[Dict[str, Any]] = Field(None, serialization_alias="metadata")

    class Config:
        from_attributes = True
        populate_by_name = True

class DocumentVerifyResponse(BaseModel):
    doc_id: str
    is_valid: bool
    content_hash_match: bool
    chain_status: str  # on_chain | not_found | revoked
    issued_by_verified: bool
    blockchain_tx: str

class BatchVerifyRequest(BaseModel):
    doc_hashes: List[str]

class BatchVerifyResult(BaseModel):
    hash: str
    doc_id: Optional[str]
    is_valid: bool
    chain_status: str

class BatchVerifyResponse(BaseModel):
    results: List[BatchVerifyResult]
