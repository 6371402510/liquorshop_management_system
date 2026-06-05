from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class EmployeeBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    employee_code: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = "MALE"
    date_of_birth: Optional[str] = None
    
    department: Optional[str] = None
    designation: Optional[str] = None
    date_of_joining: Optional[str] = None
    system_role: Optional[str] = "STAFF"
    status: Optional[str] = "ACTIVE"
    
    salary: float = 0.0
    pan_number: Optional[str] = None
    adhaar_number: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    # All fields optional for update
    employee_code: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    date_of_joining: Optional[str] = None
    system_role: Optional[str] = None
    status: Optional[str] = None
    salary: Optional[float] = None
    pan_number: Optional[str] = None
    adhaar_number: Optional[str] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True