from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date

from .model import Expense, ExpenseCategory
from .schema import ExpenseCreate, ExpenseUpdate, CategoryCreate

DEFAULT_CATEGORIES = [
    
]

# --- Expense Services ---
def get_expenses(
    db: Session, 
    skip: int = 0, 
    limit: int = 1000,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """Fetch expenses with optional date filtering"""
    query = db.query(Expense)
    
    if start_date:
        query = query.filter(Expense.expense_date >= start_date)
    if end_date:
        query = query.filter(Expense.expense_date <= end_date)
        
    return query.order_by(Expense.expense_date.desc()).offset(skip).limit(limit).all()

def get_expense(db: Session, expense_id: int):
    return db.query(Expense).filter(Expense.id == expense_id).first()

def create_expense(db: Session, expense_data: ExpenseCreate):
    db_expense = Expense(**expense_data.model_dump())
    try:
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        return db_expense
    except IntegrityError:
        db.rollback()
        return None

def update_expense(db: Session, expense_id: int, expense_data: ExpenseUpdate):
    db_expense = get_expense(db, expense_id)
    if not db_expense:
        return None
    
    # Only update fields that were explicitly sent
    update_data = expense_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_expense, key, value)
        
    try:
        db.commit()
        db.refresh(db_expense)
        return db_expense
    except IntegrityError:
        db.rollback()
        return None

def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if not db_expense:
        return False
    
    db.delete(db_expense)
    db.commit()
    return True

# --- Category Services ---
def get_categories(db: Session) -> List[ExpenseCategory]:
    """Fetch all categories. Seed defaults if empty."""
    categories = db.query(ExpenseCategory).all()
    
    # Seed defaults if table is completely empty
    if not categories:
        try:
            for cat_name in DEFAULT_CATEGORIES:
                db.add(ExpenseCategory(name=cat_name, is_default=True))
            db.commit()
            # Re-query to return the seeded list
            return db.query(ExpenseCategory).all()
        except IntegrityError:
            db.rollback()
            # If seeding fails (e.g. partial data), just return what we have
            return db.query(ExpenseCategory).all()
        
    return categories

def create_category(db: Session, category_data: CategoryCreate) -> ExpenseCategory:
    """Create a new category."""
    # Normalize name
    clean_name = category_data.name.strip().upper().replace(" ", "_")
    
    db_category = ExpenseCategory(name=clean_name, is_default=False)
    try:
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError:
        db.rollback()
        raise ValueError("Category already exists")


def delete_category(db: Session, category_id: int) -> bool:
    """Delete a category."""
    db_category = db.query(ExpenseCategory).filter(ExpenseCategory.id == category_id).first()
    if not db_category:
        return False
    
    try:
        db.delete(db_category)
        db.commit()
        return True
    except IntegrityError:
        # This block runs if the category is referenced in the expenses table
        db.rollback()
        # Raise a ValueError so the API can return a 400 error with a message
        raise ValueError("Cannot delete this category because it is currently being used by existing expenses.")