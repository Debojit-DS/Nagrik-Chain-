from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from auth import create_access_token
from modules.identity.models import Citizen
from modules.institutions.models import Professional

router = APIRouter()

class LoginRequest(BaseModel):
    chin: str
    role: str = "citizen"

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    chin: str

@router.post("/token", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    citizen = db.query(Citizen).filter(Citizen.chin == req.chin).first()
    if not citizen:
        raise HTTPException(status_code=404, detail="Citizen not found")
    
    role = req.role
    pdid = None
    
    prof = db.query(Professional).filter(Professional.chin == req.chin).first()
    if prof:
        role = prof.profession
        pdid = prof.pdid
    elif req.chin.startswith("CHIN-OFF-"):
        role = "officer"
    elif req.chin.startswith("CHIN-CRT-"):
        role = "court"
    
    token = create_access_token({
        "sub": req.chin,
        "role": role,
        "biometric_verified": True,
        "pdid": pdid
    })
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": role,
        "chin": req.chin
    }
