from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings

# For SQLite, we enable WAL mode and foreign keys enforcement
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL, 
    connect_args=connect_args
)

# Enable foreign keys for SQLite
if settings.DATABASE_URL.startswith("sqlite"):
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    # Import all models to ensure they are registered before creating tables
    # Importing inline to avoid circular dependency
    from modules.identity.models import Citizen, Biometric
    from modules.documents.models import Document
    from modules.institutions.models import Institution, Professional
    from modules.smart_contracts.models import SmartContract
    from modules.ai_engine.models import AIVerification
    from modules.anti_corruption.models import BribeReport, IntegrityScore
    from modules.audit.models import AuditLog
    
    Base.metadata.create_all(bind=engine)
