from sqlalchemy.orm import Session
from fastapi import HTTPException
from inventory.model import Product
from .model import GodownSale, GodownSaleItem
from .schema import GodownCheckoutRequest
from sqlalchemy import or_

def get_godown_products(db: Session, search: str = ""):
    # Query the SAME Product table, but we only care about godown_stock
    query = db.query(Product).filter(Product.is_active == True)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.barcode.ilike(search_term),
                Product.brand.ilike(search_term),
                Product.item_code.ilike(search_term),
                Product.traditional_name.ilike(search_term)
            )
        )
    
    return query.order_by(Product.name).all()


def process_godown_checkout(db: Session, checkout_data: GodownCheckoutRequest):
    # 1. Validate Godown Stock Availability
    for item in checkout_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product ID {item.product_id} not found.")
        if product.godown_stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient godown stock for {product.name}. Available: {product.godown_stock}, Requested: {item.quantity}"
            )

    # 2. Create the Godown Sale Record
    db_sale = GodownSale(
        invoice_number=checkout_data.invoice_number,
        customer_name=checkout_data.customer_name,
        customer_phone=checkout_data.customer_phone,
        total_amount=checkout_data.total_amount,
        payment_mode=checkout_data.payment_mode
    )
    db.add(db_sale)
    db.flush()

    # 3. Create Sale Items & Deduct Godown Stock
    for item in checkout_data.items:
        db_item = GodownSaleItem(
            sale_id=db_sale.id,
            product_id=item.product_id,
            product_name=item.product_name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            discount=item.discount,
            total_price=item.total_price
        )
        db.add(db_item)

        # Deduct from godown_stock and current_stock
        product = db.query(Product).filter(Product.id == item.product_id).first()
        product.godown_stock -= item.quantity
        product.current_stock -= item.quantity # Keep current_stock in sync

    db.commit()
    db.refresh(db_sale)
    return db_sale