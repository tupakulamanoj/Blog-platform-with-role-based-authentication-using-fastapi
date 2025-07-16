from fastapi import APIRouter, Depends
from schema import Blog
from database import add_data
from auth import admin_required
router = APIRouter()

@router.post("/create")
def create_blog(request: Blog,current_user: dict = Depends(admin_required)):
    response=add_data(current_user.user_id,request.title,request.body)
    return response
