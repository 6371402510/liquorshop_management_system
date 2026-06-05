from sqlalchemy import Column, Integer, String, Float, Date, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base


class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    supplier_name = Column(String, nullable=True)

    # ─── CHANGED: DateTime → Date (date only, no time) ───
    purchase_date = Column(Date, nullable=False)

    # ─── ADDED: Separate dates from frontend ───
    invoice_date = Column(Date, nullable=True)       # Manual entry from invoice
    billing_date = Column(Date, nullable=False)      # Auto today's date

    subtotal = Column(Float, default=0.0)
    vat_amount = Column(Float, default=0.0)
    cess_amount = Column(Float, default=0.0)
    special_amount = Column(Float, default=0.0)
    tcs_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)

    notes = Column(Text, nullable=True)              # Transport Pass No.
    vehicle_number = Column(String, nullable=True)   # ─── ADDED

    status = Column(String, default="RECEIVED")

    created_at = Column(Date, server_default=func.current_date())  # ─── CHANGED
    updated_at = Column(Date, onupdate=func.current_date())        # ─── CHANGED


class PurchaseItem(Base):
    __tablename__ = "purchase_items"

    id = Column(Integer, primary_key=True, index=True)
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=False)

    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    product_name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)
    barcode = Column(String, nullable=True)

    bottle_size = Column(String, nullable=True)
    traditional_name = Column(String, nullable=True)
    bottles_per_case = Column(Integer, default=0)

    mrp = Column(Float, default=0.0)

    unit_cost = Column(Float, default=0.0)
    purchase_rate_per_unit = Column(Float, default=0.0)
    selling_rate = Column(Float, default=0.0)

    qty_cases = Column(Integer, default=0)
    qty_bottles = Column(Integer, default=0)
    total_bottles = Column(Integer, default=0)
    qty_bulk_liters = Column(Float, default=0.0)
    qty_lp_liters = Column(Float, default=0.0)

    opening_stock = Column(Integer, default=0)
    min_stock = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)