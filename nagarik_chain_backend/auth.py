from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from pydantic import BaseModel

from config import settings
from database import get_db
from sqlalchemy.orm import Session

# Since models are defined in separate files, we import them dynamically inside the functions 
# to prevent circular imports before the database is initialized.

security = HTTPBearer()

class TokenClaims(BaseModel):
    sub: str  # CHIN
    role: str  # citizen | doctor | lawyer | ca | engineer | officer | court
    biometric_verified: bool
    pdid: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def verify_jwt(token: str) -> TokenClaims:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        chin: str = payload.get("sub")
        role: str = payload.get("role")
        biometric_verified: bool = payload.get("biometric_verified", False)
        pdid: Optional[str] = payload.get("pdid")
        
        if chin is None or role is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
            )
        return TokenClaims(sub=chin, role=role, biometric_verified=biometric_verified, pdid=pdid)
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

async def require_chin_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenClaims:
    claims = verify_jwt(credentials.credentials)
    if not claims.biometric_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Biometric re-verification required"
        )
    return claims

async def require_pdid_auth(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenClaims:
    claims = verify_jwt(credentials.credentials)
    if claims.role not in ("doctor", "lawyer", "ca", "engineer"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="P-DID credential required"
        )
    return claims

async def require_officer_integrity(
    claims: TokenClaims = Depends(require_chin_auth), 
    db: Session = Depends(get_db)
) -> TokenClaims:
    # Query officer's integrity score from the database
    from modules.anti_corruption.models import IntegrityScore
    
    score_record = db.query(IntegrityScore).filter(IntegrityScore.officer_chin == claims.sub).first()
    
    # If there is no record, assume default starting score 100.0
    score = score_record.score if score_record else 100.0
    
    if score < 60.0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Access denied: Officer integrity score ({score}) below threshold (60.0)"
        )
    return claims
