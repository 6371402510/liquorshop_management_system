from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from .schema import CompanyCreate, CompanyUpdate, CompanyResponse
from .service import get_companies, get_company, create_company, update_company, delete_company
from auth.dependencies import get_current_user, require_admin
from auth.model import User

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.get("/", response_model=List[CompanyResponse])
def list_companies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # MANAGER/SALESMAN see only their assigned shop
    if current_user.role in ["MANAGER", "SALESMAN"]:
        company = get_company(db, current_user.company_id)
        return [company] if company else []
    
    # ADMIN sees only the shops THEY OWN
    return get_companies(db, owner_id=current_user.id)

@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_new_company(
    company_data: CompanyCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin) # Only Admins create shops
):
    # Assign ownership to the logged-in Admin
    company = create_company(db, company_data, owner_id=current_user.id)
    if not company:
        raise HTTPException(status_code=400, detail="Company with this GSTIN/License already exists")
    return company

# (Keep update and delete, but add dependency: current_user: User = Depends(require_admin))