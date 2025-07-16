from fastapi.security import OAuth2PasswordBearer
from fastapi import HTTPException, Depends, status
from auth_token import verify_token
from schema import TokenData

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(data: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return verify_token(data, credentials_exception)

def admin_required(current_user: TokenData = Depends(get_current_user)):
    if current_user.profile.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )
    return current_user

