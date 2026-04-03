"""
JWT Authentication Router for MedRetain CRM.
Handles user login, token generation, and user management.
"""
import os
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel

from ..database import get_db, SessionLocal
from ..models import CRMUser

# ─── Config ──────────────────────────────────────────────────────────────────

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "medretain-crm-super-secret-key-change-in-production-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "480"))  # 8 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter(prefix="/auth", tags=["Authentication"])

# ─── Schemas ─────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class UserCreate(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    role: Optional[str] = "staff"

class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# ─── Helpers ─────────────────────────────────────────────────────────────────

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> CRMUser:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session expired or invalid. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(CRMUser).filter(CRMUser.username == username, CRMUser.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user

def ensure_default_admin(db: Session):
    """Create default admin user if no users exist."""
    count = db.query(CRMUser).count()
    if count == 0:
        admin = CRMUser(
            username="admin",
            hashed_password=hash_password("medretain@admin123"),
            full_name="System Administrator",
            role="admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("✅ Default admin user created: admin / medretain@admin123")

# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT access token.
    Accepts application/x-www-form-urlencoded (standard OAuth2).
    """
    ensure_default_admin(db)

    user = db.query(CRMUser).filter(CRMUser.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated.")

    token = create_access_token(data={"sub": user.username})
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
        }
    }


@router.get("/me")
async def get_me(current_user: CRMUser = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return {
        "id": current_user.id,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
    }


@router.post("/users", response_model=UserOut)
async def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user)
):
    """Create a new CRM user (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create users.")
    
    existing = db.query(CRMUser).filter(CRMUser.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists.")
    
    user = CRMUser(
        username=payload.username,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role or "staff",
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("/users")
async def list_users(
    db: Session = Depends(get_db),
    current_user: CRMUser = Depends(get_current_user)
):
    """List all CRM users (admin only)."""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all users.")
    users = db.query(CRMUser).all()
    return [{"id": u.id, "username": u.username, "full_name": u.full_name, "role": u.role, "is_active": u.is_active} for u in users]


@router.post("/logout")
async def logout():
    """Client-side logout (token invalidation is handled client-side)."""
    return {"message": "Logged out successfully."}
