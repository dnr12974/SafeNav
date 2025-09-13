from fastapi import APIRouter, Depends, HTTPException, Body
from models.auth import User, LoginRequest, UserInDB
from utils.auth import hash_password, verify_password, create_access_token, get_current_user
from services.database import users_collection
from datetime import timedelta

router = APIRouter()

@router.post("/signup", status_code=201)
async def signup(user: User):
    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Hash the password
    hashed_password = hash_password(user.password)

    # Insert user into the database
    user_data = {
        "email": user.email,
        "full_name": user.full_name,
        "phone_number": user.phone_number,
        "address": user.address,
        "hashed_password": hashed_password,
    }
    result = await users_collection.insert_one(user_data)

    return {"message": "User created successfully", "user_id": str(result.inserted_id)}

@router.post("/login")
async def login(request: LoginRequest):
    # Find user by email
    user = await users_collection.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=timedelta(minutes=30)
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(
        email=user["email"],
        full_name=user["full_name"],
        phone_number=user["phone_number"],
        address=user["address"],
        password="********"  # Don't return real password
    )

@router.put("/update_profile")
async def update_profile(
    full_name: str = Body(...),
    phone_number: str = Body(""),
    address: str = Body(""),
    current_user: dict = Depends(get_current_user)
):
    update_data = {
        "full_name": full_name,
        "phone_number": phone_number,
        "address": address
    }
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": update_data}
    )
    return {"msg": "Profile updated successfully"}

@router.post("/change_password")
async def change_password(
    old_password: str = Body(...),
    new_password: str = Body(...),
    current_user: dict = Depends(get_current_user)
):
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user or not verify_password(old_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    new_hashed = hash_password(new_password)
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"hashed_password": new_hashed}}
    )
    return {"msg": "Password updated successfully"}