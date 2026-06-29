from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from auth import require_chin_auth, TokenClaims
from modules.smart_contracts.schemas import (
    SmartContractDeployRequest, 
    SmartContractResponse, 
    WebhookEventRequest
)
from modules.smart_contracts.service import SmartContractService

router = APIRouter()

@router.post("/deploy", response_model=SmartContractResponse, status_code=status.HTTP_201_CREATED)
def deploy_smart_contract(
    req: SmartContractDeployRequest, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Deploys a new smart contract to Ethereum. Gated by citizen auth.
    """
    if req.chin_initiator != current_user.sub and current_user.role != "officer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Initiator CHIN must match authenticated CHIN"
        )
        
    contract = SmartContractService.deploy_contract(db, req)
    return contract

@router.get("/{contract_id}", response_model=SmartContractResponse)
def get_contract_status(
    contract_id: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Retrieves status and configurations of a smart contract.
    """
    contract = SmartContractService.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Smart contract not found")
        
    # Gated to parties involved or officers
    if (contract.chin_initiator != current_user.sub and 
        contract.chin_beneficiary != current_user.sub and 
        current_user.role != "officer"):
        raise HTTPException(status_code=403, detail="Unauthorized to access this contract status")
        
    return contract

@router.post("/{contract_id}/trigger", response_model=SmartContractResponse)
def trigger_smart_contract(
    contract_id: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Manually triggers execution of a smart contract. Owner or officer only.
    """
    contract = SmartContractService.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Smart contract not found")
        
    if contract.chin_initiator != current_user.sub and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to trigger this smart contract")
        
    updated_contract = SmartContractService.trigger_contract(db, contract_id)
    return updated_contract

@router.get("/citizen/{chin}", response_model=List[SmartContractResponse])
def list_citizen_contracts(
    chin: str, 
    db: Session = Depends(get_db),
    current_user: TokenClaims = Depends(require_chin_auth)
):
    """
    Lists all smart contracts (initiated or benefited) for a citizen.
    """
    if current_user.sub != chin and current_user.role != "officer":
        raise HTTPException(status_code=403, detail="Unauthorized to view these contracts")
        
    contracts = SmartContractService.list_citizen_contracts(db, chin)
    return contracts

@router.post("/webhook/event")
def receive_blockchain_event(req: WebhookEventRequest, db: Session = Depends(get_db)):
    """
    Internal webhook receiver for blockchain event triggers.
    """
    return SmartContractService.handle_webhook_event(db, req)
