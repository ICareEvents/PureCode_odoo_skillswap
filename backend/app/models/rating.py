from sqlalchemy import Column, Integer, String, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel

class Rating(BaseModel):
    __tablename__ = "ratings"
    
    swap_id = Column(Integer, ForeignKey("swap_requests.id", ondelete="CASCADE"), nullable=False, unique=True)
    rater_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rated_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    stars = Column(Integer, nullable=False)
    comment = Column(String(140), nullable=True)
    
    swap_request = relationship("SwapRequest", back_populates="rating")
    rater = relationship("User", foreign_keys=[rater_id], back_populates="given_ratings")
    rated = relationship("User", foreign_keys=[rated_id], back_populates="received_ratings")
    
    __table_args__ = (
        CheckConstraint('stars >= 1 AND stars <= 5', name='check_stars_range'),
    )