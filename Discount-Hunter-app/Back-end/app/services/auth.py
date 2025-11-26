import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.database import get_db_connection
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30 * 24 * 60  # 30 days

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())

def create_access_token(user_id: int, email: str) -> str:
    """Create a JWT access token."""
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def register_user(email: str, first_name: str, last_name: str, password: str) -> dict:
    """Register a new user."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if user already exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        conn.close()
        raise ValueError("User with this email already exists")
    
    # Hash password and insert user
    hashed_password = hash_password(password)
    cursor.execute(
        "INSERT INTO users (email, first_name, last_name, hashed_password) VALUES (?, ?, ?, ?)",
        (email, first_name, last_name, hashed_password),
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    
    # Create token
    token = create_access_token(user_id, email)
    
    return {
        "userId": user_id,
        "email": email,
        "firstName": first_name,
        "lastName": last_name,
        "token": token,
    }

def login_user(email: str, password: str) -> dict:
    """Authenticate a user and return a token."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute(
        "SELECT id, email, first_name, last_name, hashed_password FROM users WHERE email = ?",
        (email,),
    )
    user = cursor.fetchone()
    conn.close()
    
    if not user or not verify_password(password, user["hashed_password"]):
        raise ValueError("Invalid email or password")
    
    # Create token
    token = create_access_token(user["id"], user["email"])
    
    return {
        "userId": user["id"],
        "email": user["email"],
        "firstName": user["first_name"],
        "lastName": user["last_name"],
        "token": token,
    }

def get_user_by_token(token: str) -> Optional[dict]:
    """Get user information from token."""
    payload = verify_token(token)
    if not payload:
        return None
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT id, email, first_name, last_name FROM users WHERE id = ?",
        (payload["user_id"],),
    )
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {
            "userId": user["id"],
            "email": user["email"],
            "firstName": user["first_name"],
            "lastName": user["last_name"],
        }
    return None
