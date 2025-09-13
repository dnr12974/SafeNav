from fastapi import APIRouter, Depends, HTTPException, Body
from services.database import sos_collection, contacts_collection, users_collection
from utils.auth import get_current_user
from datetime import datetime
from pydantic import BaseModel
from twilio.rest import Client
import os

router = APIRouter()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER")

# Update the trigger_sos function to manage SMS length better

@router.post("/trigger", response_model=dict)
async def trigger_sos(
    current_user: dict = Depends(get_current_user),
    data: dict = Body(...)
):
    user = await users_collection.find_one({"email": current_user["email"]})
    user_email = current_user["email"]
    user_name = user["full_name"] if user and "full_name" in user else "SafeNav User"
    
    # Extract location and route details from request
    location = data.get("location", {})
    route_details = data.get("routeDetails", {})
    
    contacts = await contacts_collection.find({"user_email": user_email}).to_list(length=100)
    if not contacts:
        raise HTTPException(status_code=404, detail="No emergency contacts found")

    # Create a shortened message with essential info only
    # Start with the alert notification
    message_body = f"🚨 SOS Alert from {user_name}!"
    
    # Add location info - highest priority
    if location and "lat" in location and "lng" in location:
        loc_str = f" Location: https://maps.google.com/?q={location['lat']},{location['lng']}"
        message_body += loc_str
    
    # Calculate remaining characters for route info
    max_sms_length = 160
    remaining_chars = max_sms_length - len(message_body) - 10  # Buffer for safety
    
    # Add route information if there's space
    if route_details and remaining_chars > 20:
        route_str = ""
        
        # Destination is most important
        if route_details.get("destination"):
            dest = route_details["destination"]
            # Truncate if too long
            if len(dest) > 30:
                dest = dest[:27] + "..."
            route_str = f" To: {dest}"
        
        # Add ETA if there's space
        if route_details.get("eta") and len(route_str) + 10 < remaining_chars:
            route_str += f" ETA: {route_details['eta']}"
        
        # Only add path details if there's significant space left
        path_added = False
        if route_details.get("pathDetails") and len(route_details["pathDetails"]) > 0 and len(route_str) + 20 < remaining_chars:
            remaining_for_path = remaining_chars - len(route_str)
            if remaining_for_path > 30:
                # Take first path detail only
                path = route_details["pathDetails"][0]
                if len(path) > remaining_for_path - 10:
                    path = path[:remaining_for_path - 13] + "..."
                route_str += f" Via: {path}"
                path_added = True
        
        # Add route info to message if it fits
        if len(route_str) <= remaining_chars:
            message_body += route_str
    
    # Send SMS via Twilio
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    notified_contacts = []
    for c in contacts:
        phone = c.get("phone_number")
        if phone:
            try:
                client.messages.create(
                    body=message_body,
                    from_= "+14302200936",
                    to=phone,
                )
                notified_contacts.append({"name": c.get("name"), "phone_number": phone})
            except Exception as e:
                # Optionally log or handle failed sends
                pass
    
    # For database storage, keep the full details (not truncated)
    full_message = f"🚨 SOS Alert from {user_name}!"
    
    if location and "lat" in location and "lng" in location:
        full_message += f" Current location: https://maps.google.com/?q={location['lat']},{location['lng']}"
    
    if route_details:
        if route_details.get("fullPath"):
            full_message += f" Route: {route_details['fullPath']}"
        elif route_details.get("origin") and route_details.get("destination"):
            full_message += f" Route: {route_details['origin']} to {route_details['destination']}"
        
        if route_details.get("pathDetails") and len(route_details["pathDetails"]) > 0:
            paths = route_details["pathDetails"][:2]
            path_str = ", ".join(paths)
            if len(route_details["pathDetails"]) > 2:
                path_str += "..."
            full_message += f" Via: {path_str}"
        
        if route_details.get("eta"):
            full_message += f" ETA: {route_details['eta']}"
        
        if route_details.get("distance"):
            full_message += f" Distance: {route_details['distance']}"
    
    # Store SOS alert with location and route details
    sos_doc = {
        "user_email": user_email,
        "timestamp": datetime.utcnow(),
        "location": location,
        "route_details": route_details,  
        "contacts": contacts,
        "message_sent": message_body,  
        "full_message": full_message   
    }
    
    result = await sos_collection.insert_one(sos_doc)
    
    return {
        "message": "SOS Alert sent",
        "sos_id": str(result.inserted_id),
        "notified_contacts": notified_contacts,
        "sms_content": message_body  # Return what was actually sent
    }

@router.get("/history", response_model=list)
async def sos_history(current_user: dict = Depends(get_current_user)):
    user_email = current_user["email"]
    history = await sos_collection.find({"user_email": user_email}).sort("timestamp", -1).to_list(length=20)
    
    # Format for frontend
    return [
        {
            "id": str(alert["_id"]),
            "date": alert["timestamp"].strftime("%Y-%m-%d"),
            "time": alert["timestamp"].strftime("%H:%M"),
            "location": alert.get("location", {}),
            "route_details": alert.get("route_details", {}),
            "contacts_notified": len(alert.get("contacts", []))
        }
        for alert in history
    ]