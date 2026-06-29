import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, func
from database import Base

class Document(Base):
    __tablename__ = "documents"
    
    doc_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chin = Column(String(64), ForeignKey("citizens.chin"), nullable=False)
    doc_type = Column(String(64), nullable=False)  # birth_cert | degree | property_title | will | passport | etc.
    title = Column(String(256), nullable=True)
    issued_by = Column(String(128), nullable=False)  # issuing professional P-DID or institution
    issued_at = Column(DateTime(timezone=True), server_default=func.now())
    valid_until = Column(DateTime(timezone=True), nullable=True)
    content_hash = Column(String(128), nullable=False)  # sha3-256
    ipfs_cid = Column(String(128), nullable=True)
    status = Column(String(32), default="valid")  # valid | revoked | expired
    language = Column(String(16), default="en")
    blockchain_tx = Column(String(128), nullable=True)
    metadata_json = Column("metadata", JSON, nullable=True)  # flexible metadata
