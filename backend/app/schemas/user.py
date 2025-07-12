from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime
from .skill import SkillBase

class UserBase(BaseModel):
    name: str
    email: EmailStr
    bio: Optional[str] = None
    is_public: bool = True
    availability: str = "available"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    is_public: Optional[bool] = None
    availability: Optional[str] = None
    offered_skill_ids: Optional[List[int]] = None
    wanted_skill_ids: Optional[List[int]] = None

class UserProfile(UserBase):
    id: int
    avatar_url: Optional[str] = None
    offered_skills: List[SkillBase] = []
    wanted_skills: List[SkillBase] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    availability: str
    offered_skills: List[SkillBase] = []
    wanted_skills: List[SkillBase] = []
    
    class Config:
        from_attributes = True

class UserSearch(BaseModel):
    id: int
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    availability: str
    offered_skills: List[SkillBase] = []
    wanted_skills: List[SkillBase] = []
    
    class Config:
        from_attributes = True