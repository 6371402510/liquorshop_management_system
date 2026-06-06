from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base # Adjust import based on your project

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(String, nullable=False) # Format: YYYY-MM-DD
    status = Column(String, default="PRESENT") # PRESENT, ABSENT, HALF_DAY, ON_LEAVE, HOLIDAY
    check_in_time = Column(String, nullable=True) # Format: HH:MM
    check_out_time = Column(String, nullable=True) # Format: HH:MM
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())