from sqlalchemy import Column, String, Boolean, Text, Table, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

skills_offered = Table(
    'skills_offered',
    BaseModel.metadata,
    Column('user_id', ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
)

skills_wanted = Table(
    'skills_wanted',
    BaseModel.metadata,
    Column('user_id', ForeignKey('users.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True)
)

class User(BaseModel):
    __tablename__ = "users"
    
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)
    is_public = Column(Boolean, default=True)
    is_banned = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    availability = Column(String(50), default="available")
    
    offered_skills = relationship("Skill", secondary=skills_offered, back_populates="offering_users")
    wanted_skills = relationship("Skill", secondary=skills_wanted, back_populates="wanting_users")
    
    sent_requests = relationship("SwapRequest", foreign_keys="SwapRequest.requester_id", back_populates="requester")
    received_requests = relationship("SwapRequest", foreign_keys="SwapRequest.responder_id", back_populates="responder")
    
    given_ratings = relationship("Rating", foreign_keys="Rating.rater_id", back_populates="rater")
    received_ratings = relationship("Rating", foreign_keys="Rating.rated_id", back_populates="rated")