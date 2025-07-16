from schema import User
from fastapi import APIRouter
from database import add_user
router = APIRouter()

@router.post("/user_creation")
def user_create(request: User):
    response=add_user(request.username,request.password)
    return response

