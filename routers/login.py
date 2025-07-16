from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from passlib.context import CryptContext
from database import SUPABASE
from auth_token import create_access_token
import postgrest

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/login")
def login(request: OAuth2PasswordRequestForm = Depends()):
    try:
        result = SUPABASE.table("profiles").select("*").eq("username", request.username).single().execute()
    except postgrest.exceptions.APIError:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    user = result.data

    if not pwd_context.verify(request.password, user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    token_data = {
        "sub": user["username"],
        "profile": user["profile"]
    }
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }
