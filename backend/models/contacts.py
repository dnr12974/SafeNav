from pydantic import BaseModel, Field
from models.auth import User
from typing import List

class Contact(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    phone_number: str = Field(..., pattern=r"^\+?[1-9]\d{1,14}$")  # E.164 format
    relationship: str = Field(..., min_length=3, max_length=30)

class UserWithContacts(User):
    contacts: List[Contact] = []