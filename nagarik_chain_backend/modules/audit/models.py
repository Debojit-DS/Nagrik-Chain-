import uuid
from sqlalchemy import Column, String, DateTime, JSON, func
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_log"
    
    log_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_chin = Column(String(64), nullable=True)
    action = Column(String(128), nullable=False)
    resource_type = Column(String(64), nullable=True)
    resource_id = Column(String(128), nullable=True)
    metadata_json = Column("metadata", JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)  # maps INET to string (IPv4/IPv6 support)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    blockchain_tx = Column(String(128), nullable=True)  # Fabric audit anchoring tx ID
