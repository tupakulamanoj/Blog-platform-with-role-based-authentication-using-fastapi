from supabase import create_client, Client
from fastapi import HTTPException
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SUPABASE_URL = "https://ivdsywjayrfqnvatmwpf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZHN5d2pheXJmcW52YXRtd3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODcwNTQsImV4cCI6MjA2ODA2MzA1NH0.9WARa9c6XbbB-mMtOg3M-dLeNJJNvTKBg-su5bKrvBs"
SUPABASE = create_client(SUPABASE_URL, SUPABASE_KEY)

def add_data(user_id,title,body):
    try:
        response = SUPABASE.table("blog").insert({"user_id": user_id, "title": title, "body": body}).execute()
        return response
    except Exception as e:
        return e

def read_data():
    try:
        response = SUPABASE.table("blog").select("*").execute()
        return response
    except Exception as e:
        return e


def delete_data(blog_id):
    try:
        response = SUPABASE.table("blog").delete().eq("blog_id", blog_id).execute()

        # Check if deletion affected any row
        if not response.data:
            raise HTTPException(status_code=404, detail="No Blog found with provided ID")

        return {"message": "Blog deleted successfully", "deleted": response.data}
    
    except HTTPException:
        # Re-raise HTTPException directly
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_data(blog_id, title, body):
    try:
        response = SUPABASE.table("blog").update({
            "title": title,
            "body": body
        }).eq("blog_id", blog_id).execute()

        # Check if any row was updated
        if not response.data:
            raise HTTPException(status_code=404, detail="No Blog found with provided ID")

        return {"message": "Blog updated successfully", "updated": response.data}
    
    except HTTPException:
        raise  # Re-raise known HTTP exceptions as-is
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def add_user(username, password, profile="user"):
    try:
        hashed_password = pwd_context.hash(password)
        response = SUPABASE.table("profiles").insert({
            "username": username,
            "password": hashed_password,
            "profile": profile
        }).execute()

        return {"message": "User created successfully", "data": response.data}

    except Exception as e:
        error_str = str(e)

        # Detect unique constraint violation (Postgres error code 23505)
        if "duplicate key value violates unique constraint" in error_str or '"code": "23505"' in error_str:
            raise HTTPException(
                status_code=409,
                detail="Username already exists"
            )

        # Generic server error for anything else
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {error_str}"
        )
