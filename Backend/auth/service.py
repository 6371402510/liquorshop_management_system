from sqlalchemy.orm import Session
from .model import User
from .schema import RegisterSchema
from .utils import hash_password, verify_password

def create_user(db: Session, user_data: RegisterSchema):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        return None

    # MANAGER and SALESMAN must have a company_id
    if user_data.role in ["MANAGER", "SALESMAN"] and not user_data.company_id:
        raise ValueError("Company ID is required for Manager and Salesman roles")

    new_user = User(
        name=user_data.name,
        email=user_data.email,
        password=hash_password(user_data.password),
        role=user_data.role,
        company_id=user_data.company_id if user_data.role != "ADMIN" else None
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password):
        return None
    if not user.is_active:
        return None
    return user