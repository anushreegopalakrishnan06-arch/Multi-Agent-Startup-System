"""
auth_routes.py — FastAPI router for authentication endpoints.

POST /api/auth/signup  — Register with email/password
POST /api/auth/login   — Login, returns JWT
POST /api/auth/google  — Server-side Google token verification, returns JWT
GET  /api/auth/me      — Get current user from JWT
"""

import os
import sys
import uuid
import shutil
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from bson import ObjectId
from pydantic import BaseModel

import bcrypt
from jose import jwt, JWTError

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

try:
    from backend.db import users_collection
except ImportError:
    from db import users_collection

# --- Config ---
JWT_SECRET = os.getenv("JWT_SECRET", "fallback-insecure-secret-change-me")
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def _verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], hashed.encode("utf-8"))
    except Exception:
        return False

router = APIRouter(prefix="/api/auth", tags=["auth"])


# --- Pydantic Models ---

class SignupRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class GoogleAuthRequest(BaseModel):
    token: str  # The raw Google access token from the frontend

class AuthResponse(BaseModel):
    status: str
    token: str
    user: dict


# --- Helpers ---

def is_admin_check(email: str) -> bool:
    """Check if the given email is the designated admin."""
    admin_email = os.getenv("ADMIN_EMAIL", "anushreegopalakrishnan06@gmail.com").lower().strip()
    return email.lower().strip() == admin_email

def create_jwt(user_id: str, email: str) -> str:
    """Create a signed JWT with user id and email."""
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRY_DAYS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_jwt(token: str) -> dict:
    """Decode and validate a JWT. Raises JWTError on failure."""
    return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    """
    FastAPI dependency: extracts and validates the JWT from the Authorization header.
    Returns the user dict from MongoDB.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    # Support "Bearer <token>" format
    parts = authorization.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        token = parts[1]
    elif len(parts) == 1:
        token = parts[0]
    else:
        raise HTTPException(status_code=401, detail="Invalid authorization format")

    try:
        payload = decode_jwt(token)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_email = payload.get("email")
    if not user_email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = await users_collection().find_one({"email": user_email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Convert ObjectId to string for JSON serialization
    user["_id"] = str(user["_id"])
    return user


# --- Routes ---

@router.post("/signup")
async def signup(req: SignupRequest):
    """Register a new user with email and password."""
    users = users_collection()

    # Check for existing user
    existing = await users.find_one({"email": req.email.lower().strip()})
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    # Hash password and insert
    hashed = _hash_password(req.password)
    user_doc = {
        "email": req.email.lower().strip(),
        "password_hash": hashed,
        "name": req.name or req.email.split("@")[0],
        "picture": None,
        "provider": "email",
        "created_at": datetime.now(timezone.utc),
    }
    result = await users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    token = create_jwt(user_id, user_doc["email"])

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user_id,
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc["picture"],
            "is_admin": is_admin_check(user_doc["email"]),
        }
    }


@router.post("/login")
async def login(req: LoginRequest):
    """Authenticate with email and password, returns JWT."""
    users = users_collection()

    user = await users.find_one({"email": req.email.lower().strip()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not user.get("password_hash") or not _verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_jwt(user_id, user["email"])

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user_id,
            "email": user["email"],
            "name": user.get("name", user["email"].split("@")[0]),
            "picture": user.get("picture"),
            "is_admin": is_admin_check(user["email"]),
        }
    }


@router.post("/google")
async def google_auth(req: GoogleAuthRequest):
    """
    Verify Google token server-side, upsert user in MongoDB, return our JWT.
    The frontend sends the Google access_token; we use it to fetch user info
    from Google's userinfo endpoint.
    """
    import aiohttp

    # Verify the token by calling Google's userinfo API
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {req.token}"}
            ) as resp:
                if resp.status != 200:
                    raise HTTPException(status_code=401, detail="Invalid Google token")
                google_data = await resp.json()
    except aiohttp.ClientError:
        raise HTTPException(status_code=502, detail="Failed to verify Google token")

    email = google_data.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Could not retrieve email from Google token")

    users = users_collection()

    # Upsert: create if not exists, update profile if exists
    user = await users.find_one({"email": email.lower().strip()})

    if user:
        # Update profile info from Google
        await users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "name": google_data.get("name", user.get("name")),
                "picture": google_data.get("picture", user.get("picture")),
                "last_login": datetime.now(timezone.utc),
            }}
        )
        user_id = str(user["_id"])
    else:
        # Create new user
        user_doc = {
            "email": email.lower().strip(),
            "password_hash": None,  # Google users don't have a password
            "name": google_data.get("name", email.split("@")[0]),
            "picture": google_data.get("picture"),
            "provider": "google",
            "google_sub": google_data.get("sub"),
            "created_at": datetime.now(timezone.utc),
        }
        result = await users.insert_one(user_doc)
        user_id = str(result.inserted_id)
        user = user_doc

    token = create_jwt(user_id, email.lower().strip())

    return {
        "status": "success",
        "token": token,
        "user": {
            "id": user_id,
            "email": email.lower().strip(),
            "name": google_data.get("name", email.split("@")[0]),
            "picture": google_data.get("picture"),
            "is_admin": is_admin_check(email.lower().strip()),
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Return the current authenticated user's profile."""
    return {
        "status": "success",
        "user": {
            "id": current_user["_id"],
            "email": current_user["email"],
            "name": current_user.get("name", current_user["email"].split("@")[0]),
            "picture": current_user.get("picture"),
            "mobile": current_user.get("mobile"),
            "company": current_user.get("company"),
            "designation": current_user.get("designation"),
            "country": current_user.get("country"),
            "timezone": current_user.get("timezone"),
            "is_admin": is_admin_check(current_user["email"]),
        }
    }


@router.put("/profile")
async def update_profile(
    name: Optional[str] = Form(None),
    mobile: Optional[str] = Form(None),
    company: Optional[str] = Form(None),
    designation: Optional[str] = Form(None),
    country: Optional[str] = Form(None),
    timezone: Optional[str] = Form(None),
    picture: Optional[UploadFile] = File(None),
    current_user: dict = Depends(get_current_user)
):
    """Update user profile details and picture."""
    users = users_collection()
    update_data = {}
    
    if name is not None:
        update_data["name"] = name
    if mobile is not None:
        update_data["mobile"] = mobile
    if company is not None:
        update_data["company"] = company
    if designation is not None:
        update_data["designation"] = designation
    if country is not None:
        update_data["country"] = country
    if timezone is not None:
        update_data["timezone"] = timezone

    if picture and picture.filename and picture.filename.strip():
        uploads_dir = os.path.join(ROOT_DIR, "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        raw_filename = picture.filename.strip()
        ext = raw_filename.rsplit(".", 1)[-1].lower() if "." in raw_filename else "jpg"
        if not ext.isalnum() or len(ext) > 5:
            ext = "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(uploads_dir, filename)

        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(picture.file, buffer)

        update_data["picture"] = f"/api/uploads/{filename}"

    # Safe lookup supporting both MongoDB ObjectId and local fallback string IDs
    user_query = {"email": current_user["email"]}
    if current_user.get("_id"):
        try:
            user_query = {"_id": ObjectId(str(current_user["_id"]))}
        except Exception:
            user_query = {"_id": str(current_user["_id"])}

    if update_data:
        await users.update_one(user_query, {"$set": update_data})

    updated_user = await users.find_one(user_query)
    if not updated_user:
        updated_user = current_user

    return {
        "status": "success",
        "user": {
            "id": str(updated_user.get("_id", current_user.get("_id", ""))),
            "email": updated_user.get("email", current_user.get("email")),
            "name": updated_user.get("name"),
            "picture": updated_user.get("picture"),
            "mobile": updated_user.get("mobile"),
            "company": updated_user.get("company"),
            "designation": updated_user.get("designation"),
            "country": updated_user.get("country"),
            "timezone": updated_user.get("timezone"),
            "is_admin": is_admin_check(updated_user.get("email", "")),
        }
    }
