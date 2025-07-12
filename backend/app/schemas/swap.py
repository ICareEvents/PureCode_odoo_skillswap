from pydantic import BaseModel, validator
from typing import Optional, List
from datetime import datetime
from ..models.swap import SwapStatus
from .skill import SkillBase

class SwapRequestBase(BaseModel):
    responder_id: int
    offered_skill_id: int
    wanted_skill_id: int
    message: Optional[str] = None

class SwapRequestCreate(SwapRequestBase):
    @validator('message')
    def validate_message(cls, v):
        if v and len(v) > 500:
            raise ValueError('Message must be less than 500 characters')
        return v

class SwapRequestUpdate(BaseModel):
    status: SwapStatus
    
class SwapRequestResponse(BaseModel):
    id: int
    requester_id: int
    responder_id: int
    requester_name: str
    responder_name: str
    offered_skill: SkillBase
    wanted_skill: SkillBase
    status: SwapStatus
    message: Optional[str] = None
    created_at: datetime
    has_rating: bool = False
    
    class Config:
        from_attributes = True

class MySwapsResponse(BaseModel):
    pending: List[SwapRequestResponse]
    accepted: List[SwapRequestResponse]
    completed: List[SwapRequestResponse]
    history: List[SwapRequestResponse]