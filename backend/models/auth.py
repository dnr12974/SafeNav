from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class User(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=3, max_length=50)
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")  # E.164 format
    address: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=3)

class UserInDB(User):
    hashed_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str