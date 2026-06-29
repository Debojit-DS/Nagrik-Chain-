import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, func
from database import Base

class SmartContract(Base):
    __tablename__ = "smart_contracts"
    
    contract_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contract_type = Column(String(64), nullable=False)  # will | property_sale | loan | insurance | crop_insurance | scholarship | pension
    chin_initiator = Column(String(64), ForeignKey("citizens.chin"), nullable=True)
    chin_beneficiary = Column(String(64), ForeignKey("citizens.chin"), nullable=True)
    trigger_condition = Column(JSON, nullable=False)  # e.g. {"event": "death_certificate", "chin": "..."}
    actions = Column(JSON, nullable=False)  # e.g. [{"transfer_funds": 500000, "to": "..."}]
    status = Column(String(32), default="pending")  # pending | triggered | executed | failed
    deployed_at = Column(DateTime(timezone=True), server_default=func.now())
    triggered_at = Column(DateTime(timezone=True), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)
    blockchain_tx = Column(String(128), nullable=True)
    ethereum_address = Column(String(42), nullable=True)
