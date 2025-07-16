from fastapi import HTTPException, Depends
from jose import jwt, JWTError
from passlib.context import CryptContext
from supabase import create_client
from schema import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SUPABASE_URL = "https://ivdsywjayrfqnvatmwpf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2ZHN5d2pheXJmcW52YXRtd3BmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODcwNTQsImV4cCI6MjA2ODA2MzA1NH0.9WARa9c6XbbB-mMtOg3M-dLeNJJNvTKBg-su5bKrvBs"
SUPABASE = create_client(SUPABASE_URL, SUPABASE_KEY)

SECRET_KEY = "secret"
ALGORITHM = "HS256"

def create_access_token(data: dict):
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception: HTTPException):
    try:
       
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub") 
        if username is None:
            raise credentials_exception


        response = SUPABASE.table("profiles").select("*").eq("username", username).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")

        user_data = response.data
        return TokenData(user_id=user_data["user_id"], username=user_data["username"], profile=user_data["profile"])


    except JWTError:
        raise credentials_exception
