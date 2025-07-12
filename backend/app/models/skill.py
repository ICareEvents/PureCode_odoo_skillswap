from sqlalchemy import Column, String, Boolean, Index
from sqlalchemy.orm import relationship
from .base import BaseModel
from .user import skills_offered, skills_wanted

class Skill(BaseModel):
    __tablename__ = "skills"
    
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(500), nullable=True)
    is_approved = Column(Boolean, default=True)
    
    offering_users = relationship("User", secondary=skills_offered, back_populates="offered_skills")
    wanting_users = relationship("User", secondary=skills_wanted, back_populates="wanted_skills")
    
    offered_swaps = relationship("SwapRequest", foreign_keys="SwapRequest.offered_skill_id", back_populates="offered_skill")
    wanted_swaps = relationship("SwapRequest", foreign_keys="SwapRequest.wanted_skill_id", back_populates="wanted_skill")

Index('idx_skills_name_trgm', Skill.name, postgresql_using='gin', postgresql_ops={'name': 'gin_trgm_ops'})