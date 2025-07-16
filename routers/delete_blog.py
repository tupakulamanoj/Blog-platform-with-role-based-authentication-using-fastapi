from fastapi import APIRouter, Depends
from database import delete_data
from auth import admin_required
router = APIRouter()

@router.delete("/delete")
def delete(blog_id: int,current_user: dict = Depends(admin_required)):
    response = delete_data(blog_id)
    return response