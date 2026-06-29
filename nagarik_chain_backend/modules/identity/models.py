import uuid
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, func
from database import Base

class Citizen(Base):
    __tablename__ = "citizens"
    
    chin = Column(String(64), primary_key=True)
    full_name = Column(String(256), nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String(16))
    birth_district = Column(String(128))
    birth_state = Column(String(64))
    aadhaar_hash = Column(String(64), unique=True, nullable=True)
    pan_hash = Column(String(64), unique=True, nullable=True)
    voter_id_hash = Column(String(64), unique=True, nullable=True)
    status = Column(String(32), default="active")  # active | deceased | suspended
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    blockchain_tx = Column(String(128), nullable=True)

class Biometric(Base):
    __tablename__ = "biometrics"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chin = Column(String(64), ForeignKey("citizens.chin"), nullable=False)
    type = Column(String(32), nullable=False)  # fingerprint | face | iris
    template_hash = Column(String(128), nullable=False)
    ipfs_cid = Column(String(128), nullable=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    last_verified = Column(DateTime(timezone=True), nullable=True)
    device_id = Column(String(64), nullable=True)
