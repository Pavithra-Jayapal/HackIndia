import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

# Load environment variables
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "construction_workspace")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

def serialize_doc(doc) -> dict:
    """Helper to convert MongoDB document _id to id as a string."""
    if not doc:
        return {}
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def serialize_list(docs) -> list:
    """Helper to convert a list of MongoDB documents."""
    return [serialize_doc(doc) for doc in docs]
