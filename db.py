"""
db.py — Async MongoDB connection using Motor for FastAPI.

Connects to MongoDB Atlas via MONGODB_URL env var.
Database: startup_intelligence
Collections: users, reports, activities
"""

import os
from motor.motor_asyncio import AsyncIOMotorClient

# Module-level client reference — initialized at app startup, closed at shutdown
_client: AsyncIOMotorClient | None = None
_db = None


def get_database():
    """Return the database instance. Must be called after connect_db()."""
    if _db is None:
        raise RuntimeError("Database not initialized. Call connect_db() first.")
    return _db


async def connect_db():
    """Open the Motor client connection. Call once during FastAPI startup."""
    global _client, _db
    mongo_url = os.getenv("MONGODB_URL")
    if not mongo_url:
        raise RuntimeError("MONGODB_URL environment variable is not set.")
    import certifi
    _client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    _db = _client["startup_intelligence"]
    # Verify connectivity
    try:
        await _client.admin.command("ping")
        print("Connected to MongoDB Atlas successfully.")
    except Exception as e:
        print(f"MongoDB connection failed: {e}")
        raise


async def close_db():
    """Close the Motor client connection. Call during FastAPI shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        print("MongoDB connection closed.")


# --- Collection accessors (convenience) ---

def users_collection():
    return get_database()["users"]

def reports_collection():
    return get_database()["reports"]

def activities_collection():
    return get_database()["activities"]

def agent_outputs_collection():
    return get_database()["agent_outputs"]
