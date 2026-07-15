from fastapi import APIRouter, Depends
from auth.dependencies import get_current_admin
from .schemas import AdminSchema
from .models import Admin

router = APIRouter()

@router.get("/me", response_model=AdminSchema)
def read_me(current_admin: Admin = Depends(get_current_admin)):
    return current_admin