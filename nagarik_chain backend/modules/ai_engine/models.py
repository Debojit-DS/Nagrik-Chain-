import uuid
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, func
from database import Base

class AIVerification(Base):
    __tablename__ = "ai_verifications"
    
    verification_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chin = Column(String(64), ForeignKey("citizens.chin"), nullable=True)
    doc_id = Column(String(36), ForeignKey("documents.doc_id"), nullable=True)
    verification_type = Column(String(64), nullable=False)  # identity | document | eligibility | fraud
    result = Column(String(32), default="manual_review")  # approved | assisted_review | manual_review | rejected
    confidence = Column(Float, nullable=True)
    shap_explanation = Column(JSON, nullable=True)  # SHAP explainability JSON
    reviewer_chin = Column(String(64), nullable=True)  # officer's CHIN if escalated
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    blockchain_tx = Column(String(128), nullable=True)
