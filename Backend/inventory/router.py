from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from .schema import ProductCreate, ProductUpdate, ProductResponse
from .service import (
    get_products, 
    get_product, 
    create_product, 
    update_product, 
    soft_delete_product
)
from .model import Product # <--- FIX: Import the Product model here

router = APIRouter(
    prefix="/products",
    tags=["Inventory / Products"]
)

# =========================================================
# SEARCH ROUTE (Must be before /{product_id} to work!)
# =========================================================
@router.get("/search/", response_model=List[ProductResponse])
def search_products(q: str, db: Session = Depends(get_db)):
    """Search products by name, barcode, or item code"""
    query = db.query(Product).filter(Product.is_active == True)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            (Product.name.ilike(search_term)) | 
            (Product.barcode.ilike(search_term)) |
            (Product.item_code.ilike(search_term))
        )
    return query.limit(10).all()


# =========================================================
# STANDARD CRUD ROUTES
# =========================================================

@router.get("/", response_model=List[ProductResponse])
def list_products(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    """Get all active products"""
    products = get_products(db, skip=skip, limit=limit)
    return products

@router.get("/{product_id}", response_model=ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    """Get a single product by ID"""
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_new_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product"""
    product = create_product(db, product_data)
    if not product:
        raise HTTPException(
            status_code=400, 
            detail="Product with this Item Code or Barcode already exists."
        )
    return product

@router.put("/{product_id}", response_model=ProductResponse)
def update_existing_product(product_id: int, product_data: ProductUpdate, db: Session = Depends(get_db)):
    """Update a product"""
    product = update_product(db, product_id, product_data)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or update failed")
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Soft delete a product (marks as inactive)"""
    success = soft_delete_product(db, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return