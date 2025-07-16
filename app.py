from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import create_blog,read_blog,delete_blog,update_blog,user_creation,login


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(user_creation.router)
app.include_router(login.router)    
app.include_router(create_blog.router)
app.include_router(read_blog.router)
app.include_router(delete_blog.router)
app.include_router(update_blog.router)


# from fastapi import Depends
# from jose import jwt
# from passlib.context import CryptContext
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# def create_access_token(data: dict):
#     to_encode = data.copy()
#     encoded_jwt = jwt.encode(to_encode, "secret", algorithm="HS256")
#     return encoded_jwt