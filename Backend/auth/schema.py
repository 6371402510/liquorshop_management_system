from pydantic import BaseModel, EmailStr
from typing import Literal # Import Literal

class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    # Enforce exactly these three roles
    role: Literal["admin", "store_manager", "salesman"] 


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True