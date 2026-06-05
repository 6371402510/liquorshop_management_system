from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from .schema import SupplierCreate, SupplierUpdate, SupplierResponse
from .service import (
    get_suppliers, 
    get_supplier, 
    create_supplier, 
    update_supplier, 
    soft_delete_supplier
)

router = APIRouter(
    prefix="/suppliers",
    tags=["Suppliers"]
)

@router.get("/", response_model=List[SupplierResponse])
def list_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all active suppliers"""
    suppliers = get_suppliers(db, skip=skip, limit=limit)
    return suppliers

@router.get("/{supplier_id}", response_model=SupplierResponse)
def read_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Get a single supplier by ID"""
    supplier = get_supplier(db, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier

@router.post("/", response_model=SupplierResponse, status_code=status.HTTP_201_CREATED)
def create_new_supplier(supplier_data: SupplierCreate, db: Session = Depends(get_db)):
    """Create a new supplier"""
    supplier = create_supplier(db, supplier_data)
    if not supplier:
        raise HTTPException(status_code=400, detail="Failed to create supplier")
    return supplier

@router.put("/{supplier_id}", response_model=SupplierResponse)
def update_existing_supplier(supplier_id: int, supplier_data: SupplierUpdate, db: Session = Depends(get_db)):
    """Update a supplier"""
    supplier = update_supplier(db, supplier_id, supplier_data)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found or update failed")
    return supplier

@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    """Soft delete a supplier (marks as inactive)"""
    success = soft_delete_supplier(db, supplier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return