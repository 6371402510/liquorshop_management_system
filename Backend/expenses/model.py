from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    expense_date = Column(Date, nullable=False, index=True)
    
    # Relationship
    category = Column(
        String, 
        ForeignKey('expense_categories.name', ondelete="RESTRICT"), 
        nullable=False, 
        index=True
    )
    
    amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String, nullable=False, default="CASH")
    description = Column(Text, nullable=True)
    
    # ADDED: These columns were missing
    employee_name = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    
    vendor_name = Column(String, nullable=True) # Optional: Keep or remove
    receipt_number = Column(String, nullable=True)
    status = Column(String, nullable=True, default="PENDING", index=True)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    is_default = Column(Boolean, default=False)