# expenses/schema.py

from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime

class ExpenseBase(BaseModel):
    company_id: int  # ← ADDED
    expense_date: date
    category: str
    amount: float
    payment_method: str = "CASH"
    description: Optional[str] = None
    
    employee_name: Optional[str] = None
    designation: Optional[str] = None
    
    vendor_name: Optional[str] = None
    receipt_number: Optional[str] = None
    status: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(ExpenseBase):
    expense_date: Optional[date] = None
    category: Optional[str] = None
    amount: Optional[float] = None
    payment_method: Optional[str] = None
    status: Optional[str] = None
    # company_id is NOT optional on update — it stays required

class ExpenseResponse(ExpenseBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Category Schemas ---
class CategoryBase(BaseModel):
    company_id: int  # ← ADDED
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    is_default: bool = False

    model_config = ConfigDict(from_attributes=True)