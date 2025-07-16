from fastapi import APIRouter,Depends
from auth import get_current_user
from database import read_data
router = APIRouter()

@router.get("/read")
def read(current_user: dict = Depends(get_current_user)):
    response = read_data()
    return response