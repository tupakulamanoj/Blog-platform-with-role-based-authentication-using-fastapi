from pydantic import BaseModel

class Blog(BaseModel):
    title: str
    body: str
    class Config:
        orm_mode = True

class User(BaseModel):
    username: str
    password: str

class TokenData(BaseModel):
    user_id: int
    username: str
    profile: str
