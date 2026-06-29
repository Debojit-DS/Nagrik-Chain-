import os
import sys

# Ensure local directories are importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from modules.auth.router import router as auth_router
from modules.identity.router import router as identity_router
from modules.documents.router import router as documents_router
from modules.institutions.router import router as institutions_router
from modules.smart_contracts.router import router as contracts_router
from modules.ai_engine.router import router as ai_router
from modules.anti_corruption.router import router as integrity_router
from modules.audit.router import router as audit_router

app = FastAPI(
    title="Nagarik Chain API",
    description="India's Blockchain-Based National Digital Identity & Governance System",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://nagarikchain.gov.in", "http://localhost:3000", "http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# App startup lifecycle
@app.on_event("startup")
def on_startup():
    init_db()

# Mount routers
app.include_router(auth_router,           prefix="/api/v1/auth",         tags=["Auth"])
app.include_router(identity_router,     prefix="/api/v1/identity",     tags=["Identity"])
app.include_router(documents_router,    prefix="/api/v1/documents",    tags=["Documents"])
app.include_router(institutions_router, prefix="/api/v1/institutions", tags=["Institutions"])
app.include_router(contracts_router,    prefix="/api/v1/contracts",    tags=["Smart Contracts"])
app.include_router(ai_router,           prefix="/api/v1/ai",           tags=["AI Engine"])
app.include_router(integrity_router,    prefix="/api/v1/integrity",    tags=["Anti-Corruption"])
app.include_router(audit_router,        prefix="/api/v1/audit",        tags=["Audit"])

@app.get("/health")
async def health():
    return {
        "status": "ok", 
        "system": "nagarik_chain",
        "blockchain": "Fabric cluster simulated",
        "ipfs": "Online"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
