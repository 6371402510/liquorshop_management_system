from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ─── Product Schema for Godown POS ───
class GodownProductResponse(BaseModel):
    id: int
    item_code: Optional[str] = None
    barcode: Optional[str] = None
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    bottle_size: Optional[str] = None
    traditional_name: Optional[str] = None
    sale_price: float
    mrp: float
    godown_stock: int
    image_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# ─── Checkout Schemas ───
class GodownCheckoutItem(BaseModel):
    product_id: int
    product_name: str
    quantity: int
    unit_price: float
    discount: float = 0.0
    total_price: float

class GodownCheckoutRequest(BaseModel):
    invoice_number: str
    customer_name: str
    customer_phone: Optional[str] = ""
    total_amount: float
    payment_mode: str = "CASH"
    items: List[GodownCheckoutItem]

class GodownSaleItemResponse(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    discount: float
    total_price: float

    class Config:
        from_attributes = True

class GodownSaleResponse(BaseModel):
    invoice_number: str
    customer_name: str
    customer_phone: Optional[str] = ""
    total_amount: float
    payment_mode: str
    created_at: datetime
    items: List[GodownSaleItemResponse]

    class Config:
        from_attributes = True