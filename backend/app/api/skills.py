from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import List, Optional
from ..database import get_db
from ..models import Skill, User
from ..schemas import SkillBase, SkillCreate, SkillSearchResult
from ..core import get_current_active_user, get_optional_current_user

router = APIRouter(prefix="/skills", tags=["skills"])

@router.get("/search", response_model=SkillSearchResult)
async def search_skills(
    q: Optional[str] = Query(None, min_length=1),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=50),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Skill).filter(Skill.is_approved == True)
    
    if q:
        similarity_threshold = 0.1
        query = query.filter(
            text("similarity(skills.name, :search_term) > :threshold")
        ).params(search_term=q, threshold=similarity_threshold).order_by(
            text("similarity(skills.name, :search_term) DESC")
        ).params(search_term=q)
    else:
        query = query.order_by(Skill.name)
    
    total = query.count()
    offset = (page - 1) * per_page
    skills = query.offset(offset).limit(per_page).all()
    
    has_more = offset + len(skills) < total
    
    return SkillSearchResult(
        skills=skills,
        total=total,
        page=page,
        per_page=per_page,
        has_more=has_more
    )

@router.post("/", response_model=SkillBase)
async def create_skill(
    skill_data: SkillCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    existing_skill = db.query(Skill).filter(
        func.lower(Skill.name) == func.lower(skill_data.name)
    ).first()
    
    if existing_skill:
        return existing_skill
    
    skill = Skill(
        name=skill_data.name,
        description=skill_data.description,
        is_approved=True
    )
    
    db.add(skill)
    db.commit()
    db.refresh(skill)
    
    return skill

@router.get("/", response_model=List[SkillBase])
async def get_all_skills(
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    skills = db.query(Skill).filter(Skill.is_approved == True).order_by(Skill.name).all()
    return skills

@router.get("/{skill_id}", response_model=SkillBase)
async def get_skill(
    skill_id: int,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    return skill