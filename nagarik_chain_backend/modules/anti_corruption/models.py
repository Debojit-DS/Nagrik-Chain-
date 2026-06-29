import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text, func
from database import Base

class BribeReport(Base):
    __tablename__ = "bribe_reports"
    
    report_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_chin = Column(String(64), ForeignKey("citizens.chin"), nullable=True)  # NULL if anonymous
    officer_inst_id = Column(String(36), ForeignKey("institutions.inst_id"), nullable=True)
    application_ref = Column(String(128), nullable=True)
    description_enc = Column(Text, nullable=False)  # Encrypted at rest
    evidence_ipfs = Column(String(128), nullable=True)
    status = Column(String(32), default="open")  # open | under_review | resolved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    blockchain_tx = Column(String(128), nullable=True)

class IntegrityScore(Base):
    __tablename__ = "integrity_scores"
    
    officer_chin = Column(String(64), ForeignKey("citizens.chin"), primary_key=True)
    score = Column(Float, default=100.0)
    total_cases = Column(Integer, default=0)
    auto_approved = Column(Integer, default=0)
    escalated = Column(Integer, default=0)
    bribe_reports = Column(Integer, default=0)
    decoy_catches = Column(Integer, default=0)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
