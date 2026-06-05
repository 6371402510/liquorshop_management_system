from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class SupplierBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str # Compulsory
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    gst_number: Optional[str] = None
    license_number: Optional[str] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    # Make name optional for updates, in case they only want to update the phone/address
    name: Optional[str] = None 

class SupplierResponse(SupplierBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True