from fastapi import APIRouter, Depends
from database import update_data
from auth import admin_required
router = APIRouter()

@router.put("/update")
def update(blog_id: int, title: str, body: str,current_user: dict = Depends(admin_required)):
    response = update_data(blog_id, title, body)
    return response
