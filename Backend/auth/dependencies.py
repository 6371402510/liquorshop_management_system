from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from auth.utils import decode_access_token
from auth.model import User

security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db)
) -> User:
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    
    return user

def require_admin(current_user: User = Depends(get_current_user)):
    # Convert to uppercase to prevent "admin" vs "ADMIN" mismatch errors
    if current_user.role.upper() != "ADMIN":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def require_manager_or_above(current_user: User = Depends(get_current_user)):
    if current_user.role.upper() not in ["ADMIN", "MANAGER"]:
        raise HTTPException(status_code=403, detail="Manager access required")
    return current_user