from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db # Adjust import based on your structure
from .schema import CompanyCreate, CompanyUpdate, CompanyResponse
from .service import (
    get_companies, 
    get_company, 
    create_company, 
    update_company, 
    delete_company
)
# Optional: Import your auth dependency if you want to protect these routes
# from auth.utils import get_current_user 

router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)

@router.get("/", response_model=List[CompanyResponse])
def list_companies(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user) # Uncomment if using auth
):
    """Get a list of all companies"""
    # If you want to filter by logged-in user: owner_id=current_user.id
    companies = get_companies(db, skip=skip, limit=limit)
    return companies

@router.get("/{company_id}", response_model=CompanyResponse)
def read_company(company_id: int, db: Session = Depends(get_db)):
    """Get a single company by ID"""
    company = get_company(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.post("/", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_new_company(
    company_data: CompanyCreate, 
    db: Session = Depends(get_db)
    # current_user: User = Depends(get_current_user) # Uncomment if using auth
):
    """Create a new company"""
    # If using auth, pass owner_id=current_user.id
    company = create_company(db, company_data)
    if not company:
        raise HTTPException(
            status_code=400, 
            detail="Company with this GSTIN or License No already exists."
        )
    return company

@router.put("/{company_id}", response_model=CompanyResponse)
def update_existing_company(
    company_id: int, 
    company_data: CompanyUpdate, 
    db: Session = Depends(get_db)
):
    """Update a company"""
    company = update_company(db, company_id, company_data)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found or update failed")
    return company

@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company"""
    success = delete_company(db, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Company not found")
    return