from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Any, Dict, List

class SmartContractDeployRequest(BaseModel):
    contract_type: str = Field(..., pattern="^(will|property_sale|loan|insurance|crop_insurance|scholarship|pension)$")
    chin_initiator: str
    chin_beneficiary: str
    trigger_condition: Dict[str, Any]
    actions: List[Dict[str, Any]]

class SmartContractResponse(BaseModel):
    contract_id: str
    contract_type: str
    chin_initiator: Optional[str]
    chin_beneficiary: Optional[str]
    trigger_condition: Dict[str, Any]
    actions: List[Dict[str, Any]]
    status: str
    deployed_at: datetime
    triggered_at: Optional[datetime]
    executed_at: Optional[datetime]
    blockchain_tx: Optional[str]
    ethereum_address: Optional[str]

    class Config:
        from_attributes = True

class WebhookEventRequest(BaseModel):
    event_name: str
    contract_address: str
    payload: Dict[str, Any]
    signature: str  # HMAC or Ethereum signature for security
