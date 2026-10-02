"""
db.py — Async MongoDB connection using Motor for FastAPI, with automatic local JSON fallback.

Connects to MongoDB Atlas via MONGODB_URL env var.
If MONGODB_URL is not set or unreachable, automatically falls back to a local persistent
async store so the application runs out-of-the-box without crashing.
Database: startup_intelligence
Collections: users, reports, activities, agent_outputs
"""

import os
import json
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

# Module-level client reference — initialized at app startup, closed at shutdown
_client: AsyncIOMotorClient | None = None
_db = None

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
LOCAL_DB_FILE = os.path.join(ROOT_DIR, "outputs", "local_db.json")


class _InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _AsyncCursor:
    def __init__(self, docs: list):
        self._docs = list(docs)

    def sort(self, key: str, direction: int = 1):
        self._docs.sort(
            key=lambda d: str(d.get(key) or ""),
            reverse=(direction < 0),
        )
        return self

    def limit(self, count: int):
        self._docs = self._docs[:count]
        return self

    def __aiter__(self):
        self._iter = iter(self._docs)
        return self

    async def __anext__(self):
        try:
            return next(self._iter)
        except StopIteration:
            raise StopAsyncIteration


class _LocalAsyncCollection:
    """Fallback async collection compatible with Motor methods when MONGODB_URL is not configured."""

    def __init__(self, name: str, store: dict, save_fn):
        self.name = name
        self._store = store
        self._save = save_fn

    def _docs(self) -> list:
        return self._store.setdefault(self.name, [])

    @staticmethod
    def _matches(doc: dict, query: dict) -> bool:
        for k, v in query.items():
            doc_val = doc.get(k)
            if k == "_id":
                if str(doc_val) != str(v):
                    return False
            elif doc_val != v:
                return False
        return True

    async def find_one(self, query: dict):
        for doc in self._docs():
            if self._matches(doc, query):
                copy_doc = dict(doc)
                if "_id" in copy_doc and not isinstance(copy_doc["_id"], ObjectId):
                    try:
                        copy_doc["_id"] = ObjectId(str(copy_doc["_id"]))
                    except Exception:
                        pass
                return copy_doc
        return None

    async def insert_one(self, doc: dict):
        new_doc = dict(doc)
        oid = new_doc.get("_id") or ObjectId()
        new_doc["_id"] = str(oid)
        self._docs().append(new_doc)
        self._save()
        return _InsertOneResult(oid)

    async def update_one(self, query: dict, update: dict):
        for doc in self._docs():
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                self._save()
                return

    async def delete_one(self, query: dict):
        docs = self._docs()
        for i, doc in enumerate(docs):
            if self._matches(doc, query):
                docs.pop(i)
                self._save()
                return

    async def count_documents(self, query: dict) -> int:
        return sum(1 for doc in self._docs() if self._matches(doc, query))

    def find(self, query: dict, projection: dict | None = None):
        matched = []
        for doc in self._docs():
            if self._matches(doc, query):
                copy_doc = dict(doc)
                matched.append(copy_doc)
        return _AsyncCursor(matched)

    def aggregate(self, pipeline: list):
        docs = list(self._docs())
        for stage in pipeline:
            if "$match" in stage:
                q = stage["$match"]
                docs = [d for d in docs if self._matches(d, q)]
            elif "$group" in stage:
                scores = [d["score"] for d in docs if isinstance(d.get("score"), (int, float))]
                avg_score = (sum(scores) / len(scores)) if scores else None
                high_risk = sum(1 for d in docs if (d.get("risk") or 0) > 60)
                docs = [{"_id": None, "avg_score": avg_score, "high_risk": high_risk}]
        return _AsyncCursor(docs)


class _LocalAsyncDatabase:
    def __init__(self):
        self._store = {}
        self._load()

    def _load(self):
        if os.path.exists(LOCAL_DB_FILE):
            try:
                with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                    self._store = json.load(f)
            except Exception:
                self._store = {}

    def _save(self):
        try:
            os.makedirs(os.path.dirname(LOCAL_DB_FILE), exist_ok=True)
            with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(
                    self._store,
                    f,
                    default=lambda o: o.isoformat() if isinstance(o, datetime) else str(o),
                    indent=2,
                )
        except Exception:
            pass

    def __getitem__(self, name: str):
        return _LocalAsyncCollection(name, self._store, self._save)


def get_database():
    """Return the database instance."""
    global _db
    if _db is None:
        _db = _LocalAsyncDatabase()
    return _db


async def connect_db():
    """Open the Motor client connection, or fall back to local JSON DB if MONGODB_URL is not set."""
    global _client, _db
    mongo_url = os.getenv("MONGODB_URL", "").strip()
    if not mongo_url:
        print("MONGODB_URL not set in .env — using local persistent database (outputs/local_db.json).")
        _db = _LocalAsyncDatabase()
        return

    import certifi
    try:
        _client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
        _db = _client["startup_intelligence"]
        await _client.admin.command("ping")
        print("Connected to MongoDB Atlas successfully.")
    except Exception as e:
        print(f"MongoDB Atlas connection failed ({e}) — falling back to local database (outputs/local_db.json).")
        _client = None
        _db = _LocalAsyncDatabase()


async def close_db():
    """Close the Motor client connection. Call during FastAPI shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        print("MongoDB connection closed.")
    _db = None


# --- Collection accessors (convenience) ---

def users_collection():
    return get_database()["users"]

def reports_collection():
    return get_database()["reports"]

def activities_collection():
    return get_database()["activities"]

def agent_outputs_collection():
    return get_database()["agent_outputs"]
