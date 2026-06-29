from datetime import datetime
import time
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

import blockchain
from modules.smart_contracts.models import SmartContract
from modules.smart_contracts.schemas import SmartContractDeployRequest, WebhookEventRequest
from modules.identity.models import Citizen
from modules.documents.models import Document
from modules.audit.service import AuditService

class SmartContractService:
    @classmethod
    def deploy_contract(cls, db: Session, req: SmartContractDeployRequest) -> SmartContract:
        # Verify citizens exist
        initiator = db.query(Citizen).filter(Citizen.chin == req.chin_initiator).first()
        beneficiary = db.query(Citizen).filter(Citizen.chin == req.chin_beneficiary).first()
        if not initiator or not beneficiary:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Initiator or Beneficiary CHIN not found"
            )
            
        # Simulate contract deployment on Ethereum
        eth_address, tx_hash = blockchain.deploy_ethereum_contract(
            req.contract_type, 
            req.chin_initiator, 
            req.chin_beneficiary
        )
        
        db_contract = SmartContract(
            contract_type=req.contract_type,
            chin_initiator=req.chin_initiator,
            chin_beneficiary=req.chin_beneficiary,
            trigger_condition=req.trigger_condition,
            actions=req.actions,
            status="pending",
            blockchain_tx=tx_hash,
            ethereum_address=eth_address
        )
        db.add(db_contract)
        db.commit()
        db.refresh(db_contract)
        
        # Log action
        AuditService.log_action(
            db,
            actor_chin=req.chin_initiator,
            action="DEPLOY_SMART_CONTRACT",
            resource_type="smart_contract",
            resource_id=db_contract.contract_id,
            metadata={"contract_type": req.contract_type, "eth_address": eth_address},
            blockchain_tx=tx_hash
        )
        
        return db_contract

    @staticmethod
    def get_contract(db: Session, contract_id: str) -> Optional[SmartContract]:
        return db.query(SmartContract).filter(SmartContract.contract_id == contract_id).first()

    @classmethod
    def trigger_contract(cls, db: Session, contract_id: str) -> SmartContract:
        contract = db.query(SmartContract).filter(SmartContract.contract_id == contract_id).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Smart contract not found")
            
        if contract.status in ("executed", "failed"):
            raise HTTPException(status_code=400, detail=f"Contract is already in {contract.status} state")
            
        contract.status = "triggered"
        contract.triggered_at = datetime.utcnow()
        db.commit()
        
        # Execute contract actions
        cls.execute_contract_actions(db, contract_id)
        
        return contract

    @classmethod
    def execute_contract_actions(cls, db: Session, contract_id: str):
        contract = db.query(SmartContract).filter(SmartContract.contract_id == contract_id).first()
        if not contract:
            return
            
        try:
            # Simulate executing each contract action
            execution_details = []
            for action in contract.actions:
                # E.g., if action is title transfer, we update the owner of a document
                if "transfer_title" in action:
                    doc_type = action.get("transfer_title")
                    beneficiary_chin = contract.chin_beneficiary
                    # Find a document of this type owned by the initiator
                    doc = db.query(Document).filter(
                        Document.chin == contract.chin_initiator,
                        Document.doc_type == doc_type,
                        Document.status == "valid"
                    ).first()
                    if doc:
                        doc.chin = beneficiary_chin
                        execution_details.append(f"Transferred title of document {doc.doc_id} to beneficiary")
                elif "transfer_funds" in action:
                    amount = action.get("transfer_funds")
                    execution_details.append(f"Transferred mock funds: {amount} INR to beneficiary wallet")
                else:
                    execution_details.append(f"Executed action: {action}")
            
            # Anchor trigger event on Ethereum
            tx_hash = blockchain.trigger_ethereum_event(
                contract.ethereum_address or "0x000", 
                {"status": "executed", "details": execution_details}
            )
            
            contract.status = "executed"
            contract.executed_at = datetime.utcnow()
            contract.blockchain_tx = tx_hash
            db.commit()
            
            # Log action
            AuditService.log_action(
                db,
                actor_chin="ETHEREUM_ORACLE",
                action="EXECUTE_SMART_CONTRACT",
                resource_type="smart_contract",
                resource_id=contract.contract_id,
                metadata={"details": execution_details},
                blockchain_tx=tx_hash
            )
            
        except Exception as e:
            contract.status = "failed"
            db.commit()
            # Log failure
            AuditService.log_action(
                db,
                actor_chin="ETHEREUM_ORACLE",
                action="EXECUTE_SMART_CONTRACT_FAIL",
                resource_type="smart_contract",
                resource_id=contract.contract_id,
                metadata={"error": str(e)}
            )
            raise e

    @staticmethod
    def list_citizen_contracts(db: Session, chin: str) -> List[SmartContract]:
        return db.query(SmartContract).filter(
            (SmartContract.chin_initiator == chin) |
            (SmartContract.chin_beneficiary == chin)
        ).all()

    @classmethod
    def handle_webhook_event(cls, db: Session, req: WebhookEventRequest) -> dict:
        # Verify webhook source authenticity (signature validation mock)
        if not req.signature:
            raise HTTPException(status_code=401, detail="Webhook signature verification failed")
            
        # Find contract by Ethereum address
        contract = db.query(SmartContract).filter(SmartContract.ethereum_address == req.contract_address).first()
        if not contract:
            raise HTTPException(status_code=404, detail="Smart contract not found for specified address")
            
        # Trigger execution if event matches conditions
        if req.event_name == "TriggerEvent":
            cls.trigger_contract(db, contract.contract_id)
            return {"status": "event_processed", "contract_id": contract.contract_id}
            
        return {"status": "ignored", "reason": f"Event {req.event_name} not handled"}
