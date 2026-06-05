from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime
from sqlalchemy.sql import func
from database import Base # Adjust import based on your project

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True) # Compulsory
    contact_person = Column(String, nullable=True)    # Optional
    phone = Column(String, nullable=True)             # Optional
    email = Column(String, nullable=True)             # Optional
    address = Column(Text, nullable=True)             # Optional
    gst_number = Column(String, nullable=True)        # Optional
    license_number = Column(String, nullable=True)    # Optional
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())