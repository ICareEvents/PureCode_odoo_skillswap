from sqlalchemy import Column, Integer, String, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel
import enum

class SwapStatus(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class SwapRequest(BaseModel):
    __tablename__ = "swap_requests"
    
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    responder_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    offered_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    wanted_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    
    status = Column(Enum(SwapStatus), default=SwapStatus.PENDING, nullable=False)
    message = Column(Text, nullable=True)
    
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_requests")
    responder = relationship("User", foreign_keys=[responder_id], back_populates="received_requests")
    offered_skill = relationship("Skill", foreign_keys=[offered_skill_id], back_populates="offered_swaps")
    wanted_skill = relationship("Skill", foreign_keys=[wanted_skill_id], back_populates="wanted_swaps")
    
    rating = relationship("Rating", back_populates="swap_request", uselist=False)