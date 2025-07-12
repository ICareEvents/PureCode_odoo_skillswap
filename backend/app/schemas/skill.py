from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class SkillBase(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    
    class Config:
        from_attributes = True

class SkillCreate(BaseModel):
    name: str
    description: Optional[str] = None
    
    @validator('name')
    def validate_name(cls, v):
        if len(v.strip()) < 2:
            raise ValueError('Skill name must be at least 2 characters')
        return v.strip().title()

class SkillUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_approved: Optional[bool] = None

class Skill(SkillBase):
    is_approved: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class SkillSearchResult(BaseModel):
    skills: list[SkillBase]
    total: int
    page: int
    per_page: int
    has_more: bool