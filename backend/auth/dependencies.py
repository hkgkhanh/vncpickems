from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status, Request
from .schemas import TokenData
from admins.models import Admin
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import ValidationError
import os
import jwt
from dotenv import load_dotenv
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from db.dependencies import get_db
from db.database import engine, Base

load_dotenv()

ENCRYPT_ALGORITHM = os.getenv("ENCRYPT_ALGORITHM")
SECRET_KEY = os.getenv("SECRET_KEY")

Base.metadata.create_all(bind=engine)

reusable_oauth2 = HTTPBearer()
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_admin(db: Session, username: str, password: str):
    admin = get_admin_by_username(db, username)
    if not admin:
        return False
    if not verify_password(password, admin.hashed_password):
        return False
    return admin

def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_seconds: int):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(seconds=expires_seconds)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ENCRYPT_ALGORITHM)
    return encoded_jwt



def validate_token(credentials: HTTPAuthorizationCredentials) -> str:
    """
        Return the username of the token
    """
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ENCRYPT_ALGORITHM])
        exp_timestamp = payload.get("exp")

        if exp_timestamp and datetime.fromtimestamp(exp_timestamp) < datetime.now():
            raise HTTPException(status_code=403, detail="Token expired")

        return payload.get("username")

    except (jwt.PyJWTError, ValidationError):
        raise HTTPException(
            status_code=403,
            detail="Could not validate credentials",
        )
    

def get_admin_by_username(db: Session, username: str):
    return db.query(Admin).filter(Admin.username == username).first()


def get_current_admin(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated.")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ENCRYPT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except jwt.PyJWTError:
        raise credentials_exception
    
    admin = get_admin_by_username(db, username=token_data.username)
    if admin is None:
        raise credentials_exception
    return admin