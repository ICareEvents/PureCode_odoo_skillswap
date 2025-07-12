from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
import os
import uuid
from ..database import get_db
from ..models import User, Skill, skills_offered, skills_wanted
from ..schemas import UserProfile, UserPublic, UserUpdate, UserSearch
from ..core import get_current_active_user, get_optional_current_user
from ..config import settings

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserProfile)
async def get_my_profile(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.is_public is not None:
        current_user.is_public = user_update.is_public
    if user_update.availability is not None:
        current_user.availability = user_update.availability
    
    if user_update.offered_skill_ids is not None:
        current_user.offered_skills.clear()
        for skill_id in user_update.offered_skill_ids:
            skill = db.query(Skill).filter(Skill.id == skill_id).first()
            if skill:
                current_user.offered_skills.append(skill)
    
    if user_update.wanted_skill_ids is not None:
        current_user.wanted_skills.clear()
        for skill_id in user_update.wanted_skill_ids:
            skill = db.query(Skill).filter(Skill.id == skill_id).first()
            if skill:
                current_user.wanted_skills.append(skill)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large"
        )
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    current_user.avatar_url = f"/uploads/{filename}"
    db.commit()
    
    return {"avatar_url": current_user.avatar_url}

@router.get("/{user_id}", response_model=UserPublic)
async def get_user_profile(
    user_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.is_public and (not current_user or current_user.id != user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Profile is private"
        )
    
    return user

@router.get("/", response_model=List[UserSearch])
async def search_users(
    q: Optional[str] = None,
    availability: Optional[str] = None,
    skill: Optional[str] = None,
    page: int = 1,
    per_page: int = 8,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(User).filter(
        User.is_public == True,
        User.is_banned == False
    )
    
    if current_user:
        query = query.filter(User.id != current_user.id)
    
    if q:
        search_term = f"%{q}%"
        query = query.filter(
            or_(
                User.name.ilike(search_term),
                User.bio.ilike(search_term)
            )
        )
    
    if availability:
        query = query.filter(User.availability == availability)
    
    if skill:
        skill_search = f"%{skill}%"
        query = query.join(User.offered_skills).filter(
            Skill.name.ilike(skill_search)
        )
    
    offset = (page - 1) * per_page
    users = query.offset(offset).limit(per_page).all()
    
    return users