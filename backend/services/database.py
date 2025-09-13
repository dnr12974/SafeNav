from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.collection import Collection

MONGO_URI = "mongodb://localhost:27017/safenav"
DATABASE_NAME = "safenav"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]

# Collections
users_collection: Collection = db["users"]
contacts_collection: Collection = db["contacts"]
sos_collection: Collection = db["sos_alerts"]