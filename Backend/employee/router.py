# employees/router.py

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from .schema import EmployeeCreate, EmployeeUpdate, EmployeeResponse
from .service import get_employees, get_employee, create_employee, update_employee, delete_employee

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)

@router.get("/", response_model=List[EmployeeResponse])
def list_employees(
    company_id: int = Query(..., description="Company ID is required"),  # ← ADDED
    search: Optional[str] = None, 
    department: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    return get_employees(db, company_id=company_id, search=search, department=department)

@router.get("/{employee_id}", response_model=EmployeeResponse)
def read_employee(
    employee_id: int, 
    company_id: int = Query(..., description="Company ID"),  # ← ADDED
    db: Session = Depends(get_db)
):
    employee = get_employee(db, employee_id, company_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@router.post("/", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_new_employee(employee_data: EmployeeCreate, db: Session = Depends(get_db)):
    try:
        return create_employee(db, employee_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create employee: {str(e)}")

@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_existing_employee(
    employee_id: int, 
    employee_data: EmployeeUpdate, 
    company_id: int = Query(..., description="Company ID"),  # ← ADDED
    db: Session = Depends(get_db)
):
    employee = update_employee(db, employee_id, employee_data, company_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found or update failed")
    return employee

@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_employee(
    employee_id: int, 
    company_id: int = Query(..., description="Company ID"),  # ← ADDED
    db: Session = Depends(get_db)
):
    success = delete_employee(db, employee_id, company_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employee not found")
    return