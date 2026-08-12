# app/schemas.py
from datetime import datetime
from typing import Annotated, Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(max_length=200)]

class UserOut(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class PostBase(BaseModel):
    title: str
    content: str
    published: bool = True

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    created_at: datetime
    owner_id: Optional[int] = None
    owner: Optional[UserOut] = None

    class Config:
        from_attributes = True

class PostOut(BaseModel):
    Post: Post
    votes: int
    user_voted: Optional[bool] = False

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    id: Optional[int] = None

class Vote(BaseModel):
    post_id: int
    dir: Annotated[int, Field(ge=0, le=1)]

# Comment Schemas
class CommentCreate(BaseModel):
    post_id: int
    content: str

class CommentOut(BaseModel):
    id: int
    content: str
    post_id: int
    owner_id: int
    created_at: datetime
    owner: Optional[UserOut] = None

    class Config:
        from_attributes = True

# Direct Message Schemas
class DirectMessageCreate(BaseModel):
    receiver_id: int
    content: str

class DirectMessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    is_read: bool
    sender: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    user: UserOut
    last_message: str
    timestamp: datetime