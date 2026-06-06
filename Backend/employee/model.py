from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from sqlalchemy.sql import func
from database import Base # Adjust import based on your project

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False, index=True)  # ← ADDED
    employee_code = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    gender = Column(String, default="MALE")
    date_of_birth = Column(String, nullable=True)
    
    # Job Details
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    date_of_joining = Column(String, nullable=True)
    system_role = Column(String, default="STAFF")
    status = Column(String, default="ACTIVE")
    
    # Compensation & Compliance
    salary = Column(Float, default=0.0)
    pan_number = Column(String, nullable=True)
    adhaar_number = Column(String, nullable=True)
    bank_account = Column(String, nullable=True)
    ifsc_code = Column(String, nullable=True)
    
    # Address
    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())