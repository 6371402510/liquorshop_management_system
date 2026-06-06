from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=True, index=True) # ─── ADDED
    invoice_number = Column(String, unique=True, index=True, nullable=False)
    customer_name = Column(String, default="Walk-in Customer")
    customer_phone = Column(String, nullable=True)
    total_amount = Column(Float, default=0.0)
    payment_mode = Column(String, default="CASH")
    status = Column(String, default="COMPLETED")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"), nullable=False)
    company_id = Column(Integer, nullable=True, index=True) # ─── ADDED
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    product_name = Column(String, nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    total_price = Column(Float, default=0.0)

    sale = relationship("Sale", back_populates="items")