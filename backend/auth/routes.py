from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.responses import RedirectResponse
import os
from dotenv import load_dotenv
from .dependencies import authenticate_admin, create_access_token, get_password_hash, get_admin_by_username, get_current_admin
from .schemas import LoginRequest, UsernamePasswordSignupRequest
from admins.schemas import AdminSchema
from admins.models import Admin
from db.dependencies import get_db
from sqlalchemy.orm import Session
import uuid
from urllib.parse import urlencode
import urllib.parse
import json

load_dotenv()

ORIGIN = os.getenv("ORIGIN")
ENV = os.getenv("ENV")
KEY_EXPIRE = 60 * 60 * 24 * 3  # 3 days

router = APIRouter()

@router.post('/login')
def login(response: Response, request_data: LoginRequest, db: Session = Depends(get_db)):
    admin = authenticate_admin(db, request_data.username, request_data.password)
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": admin.username}, expires_seconds=KEY_EXPIRE)
    response.set_cookie(
        key="access_token", 
        value=access_token, 
        httponly=True,
        max_age=KEY_EXPIRE,
        expires=KEY_EXPIRE,
        samesite="lax",
        secure=True if ENV == "prod" else False
    )
    
    return {"message": "Login successful"}
    

@router.post('/signup', response_model=AdminSchema)
def signup(request_data: UsernamePasswordSignupRequest, db: Session = Depends(get_db)):
    db_admin = get_admin_by_username(db, username=request_data.username)
    if db_admin:
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = get_password_hash(request_data.password)
    from datetime import datetime, timezone
    now_timestamp = datetime.now(timezone.utc)
    db_admin = Admin(
        username=request_data.username,
        hashed_password=hashed_password,
        created_at=now_timestamp
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out"}