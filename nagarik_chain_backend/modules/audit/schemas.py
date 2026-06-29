from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any

class AuditLogResponse(BaseModel):
    log_id: str
    actor_chin: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    metadata_json: Optional[Dict[str, Any]] = Field(None, serialization_alias="metadata")
    ip_address: Optional[str]
    created_at: datetime
    blockchain_tx: Optional[str]

    class Config:
        from_attributes = True
        populate_by_name = True
