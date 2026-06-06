# expenses/model.py

from sqlalchemy import Column, Integer, String, Float, Date, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False, index=True)  # ← ADDED
    expense_date = Column(Date, nullable=False, index=True)
    
    category = Column(
        String, 
        ForeignKey('expense_categories.name', ondelete="RESTRICT"), 
        nullable=False, 
        index=True
    )
    
    amount = Column(Float, nullable=False, default=0.0)
    payment_method = Column(String, nullable=False, default="CASH")
    description = Column(Text, nullable=True)
    
    employee_name = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    
    vendor_name = Column(String, nullable=True)
    receipt_number = Column(String, nullable=True)
    status = Column(String, nullable=True, default="PENDING", index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False, index=True)  # ← ADDED
    name = Column(String, index=True, nullable=False)
    is_default = Column(Boolean, default=False)
    
    # Unique constraint: name must be unique PER company
    __table_args__ = (
        # If using PostgreSQL/MySQL with Alembic, add:
        # UniqueConstraint('company_id', 'name', name='uq_category_company'),
    )