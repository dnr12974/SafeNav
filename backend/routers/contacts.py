from fastapi import APIRouter, HTTPException, Body, Depends
from models.contacts import Contact
from services.database import contacts_collection
from bson import ObjectId
from utils.auth import get_current_user

router = APIRouter()

@router.get("/list")
async def list_contacts(current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]
    contacts = await contacts_collection.find({"user_email": user_email}).to_list(length=100)
    return [
        {
            "id": str(contact["_id"]),
            "name": contact["name"],
            "phone": contact["phone_number"],
            "relationship": contact["relationship"]
        }
        for contact in contacts
    ]

@router.post("/add", response_model=Contact)
async def add_contact(contact: Contact, current_user: dict = Depends(get_current_user)):
    # Extract user_email from the authenticated user
    user_email = current_user["email"]

    # Create a new contact document with the user's email
    contact_data = contact.model_dump()
    contact_data["user_email"] = user_email

    # Insert the contact into the database
    result = await contacts_collection.insert_one(contact_data)
    if not result.inserted_id:
        raise HTTPException(status_code=500, detail="Failed to add contact")

    # Return the inserted contact
    contact_data["_id"] = str(result.inserted_id)
    return contact

@router.put("/edit", response_model=Contact)
async def edit_contact(
    contact_id: str = Body(...),
    updated_contact: Contact = Body(...),
    current_user: dict = Depends(get_current_user)
):
    user_email = current_user["email"]
    try:
        obj_id = ObjectId(contact_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contact ID")

    result = await contacts_collection.update_one(
        {"user_email": user_email, "_id": obj_id},
        {"$set": updated_contact.dict()}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update contact")

    updated_contact_data = updated_contact.dict()
    updated_contact_data["user_email"] = user_email
    return updated_contact

@router.delete("/delete", response_model=dict)
async def delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]
    try:
        obj_id = ObjectId(contact_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contact ID")

    result = await contacts_collection.delete_one(
        {"user_email": user_email, "_id": obj_id}
    )

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contact not found")

    return {"message": "Contact deleted successfully"}