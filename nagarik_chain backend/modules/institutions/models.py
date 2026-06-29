import uuid
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, JSON, func
from database import Base

class Professional(Base):
    __tablename__ = "professionals"
    
    pdid = Column(String(64), primary_key=True)  # P-DID
    chin = Column(String(64), ForeignKey("citizens.chin"), nullable=False)
    profession = Column(String(64), nullable=False)  # doctor | lawyer | ca | engineer
    license_number = Column(String(128), unique=True, nullable=False)
    issuing_body = Column(String(128), nullable=True)
    valid_from = Column(Date, nullable=False)
    valid_until = Column(Date, nullable=True)
    specializations = Column(JSON, nullable=True)
    status = Column(String(32), default="active")  # active | suspended | revoked
    blockchain_tx = Column(String(128), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Institution(Base):
    __tablename__ = "institutions"
    
    inst_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(256), nullable=False)
    type = Column(String(64), nullable=False)  # hospital | court | bank | university | revenue_office
    registration_no = Column(String(128), unique=True, nullable=True)
    state = Column(String(64), nullable=True)
    district = Column(String(128), nullable=True)
    node_public_key = Column(String, nullable=True)
    status = Column(String(32), default="active")  # active | suspended | inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())
