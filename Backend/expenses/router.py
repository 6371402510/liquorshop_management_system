from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from database import get_db
from .schema import ExpenseCreate, ExpenseUpdate, ExpenseResponse, CategoryCreate, CategoryResponse
from .service import (
    get_expenses, get_expense, create_expense, update_expense, delete_expense,
    get_categories, create_category, delete_category
)

# --- Expense Router ---
expense_router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)

@expense_router.get("/", response_model=List[ExpenseResponse])
def list_expenses(
    start_date: Optional[date] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    skip: int = 0, 
    limit: int = 1000, 
    db: Session = Depends(get_db)
):
    """Get all expenses, optionally filtered by date range"""
    return get_expenses(db, skip=skip, limit=limit, start_date=start_date, end_date=end_date)

@expense_router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = get_expense(db, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@expense_router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_new_expense(expense_data: ExpenseCreate, db: Session = Depends(get_db)):
    expense = create_expense(db, expense_data)
    if not expense:
        raise HTTPException(status_code=400, detail="Failed to create expense")
    return expense

@expense_router.put("/{expense_id}", response_model=ExpenseResponse)
def update_existing_expense(expense_id: int, expense_data: ExpenseUpdate, db: Session = Depends(get_db)):
    expense = update_expense(db, expense_id, expense_data)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found or update failed")
    return expense

@expense_router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_existing_expense(expense_id: int, db: Session = Depends(get_db)):
    success = delete_expense(db, expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return

# --- Category Router ---
category_router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)

@category_router.get("/", response_model=List[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    return get_categories(db)

@category_router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def add_category(category_data: CategoryCreate, db: Session = Depends(get_db)):
    """Add a new custom category"""
    try:
        return create_category(db, category_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@category_router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category"""
    success = delete_category(db, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return