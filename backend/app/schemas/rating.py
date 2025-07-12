from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime

class RatingCreate(BaseModel):
    swap_id: int
    rated_id: int
    stars: int
    comment: Optional[str] = None
    
    @validator('stars')
    def validate_stars(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Stars must be between 1 and 5')
        return v
    
    @validator('comment')
    def validate_comment(cls, v):
        if v and len(v) > 140:
            raise ValueError('Comment must be less than 140 characters')
        return v

class RatingResponse(BaseModel):
    id: int
    swap_id: int
    rater_id: int
    rated_id: int
    rater_name: str
    rated_name: str
    stars: int
    comment: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True