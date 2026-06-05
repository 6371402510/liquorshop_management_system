from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class AttendanceBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    
    employee_id: int
    date: str
    status: Optional[str] = "PRESENT"
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    # All fields optional for update
    employee_id: Optional[int] = None
    date: Optional[str] = None
    status: Optional[str] = None
    check_in_time: Optional[str] = None
    check_out_time: Optional[str] = None
    notes: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: int
    employee_name: Optional[str] = None # Populated by service layer join
    employee_code: Optional[str] = None # Populated by service layer join
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        
class MonthlyReportResponse(BaseModel):
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    present_days: int = 0
    paid_leave_days: int = 0
    unpaid_leave_days: int = 0
    half_days: int = 0
    total_working_days: float = 0.0 # Changed to float because half day / 2 creates decimals