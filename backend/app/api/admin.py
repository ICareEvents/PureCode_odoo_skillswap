from fastapi import APIRouter, Depends, HTTPException, status, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
import csv
import io
from datetime import datetime
from ..database import get_db
from ..models import User, Skill, SwapRequest, Rating
from ..schemas import UserProfile, Skill as SkillSchema, SwapRequestResponse
from ..core import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/users", response_model=List[UserProfile])
async def get_all_users(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return users

@router.put("/users/{user_id}/ban")
async def ban_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot ban yourself"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_banned = True
    db.commit()
    
    return {"message": f"User {user.name} has been banned"}

@router.put("/users/{user_id}/unban")
async def unban_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_banned = False
    db.commit()
    
    return {"message": f"User {user.name} has been unbanned"}

@router.get("/skills", response_model=List[SkillSchema])
async def get_all_skills_admin(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skills = db.query(Skill).all()
    return skills

@router.put("/skills/{skill_id}/approve")
async def approve_skill(
    skill_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    skill.is_approved = True
    db.commit()
    
    return {"message": f"Skill {skill.name} has been approved"}

@router.put("/skills/{skill_id}/reject")
async def reject_skill(
    skill_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    skill.is_approved = False
    db.commit()
    
    return {"message": f"Skill {skill.name} has been rejected"}

@router.get("/swaps")
async def get_all_swaps_admin(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    swaps = db.query(SwapRequest).all()
    
    return [
        {
            "id": swap.id,
            "requester_name": swap.requester.name,
            "responder_name": swap.responder.name,
            "offered_skill": swap.offered_skill.name,
            "wanted_skill": swap.wanted_skill.name,
            "status": swap.status.value,
            "created_at": swap.created_at
        }
        for swap in swaps
    ]

@router.get("/stats/csv")
async def export_stats_csv(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Type", "ID", "Name", "Email", "Created_At", "Status", "Additional_Info"
    ])
    
    users = db.query(User).all()
    for user in users:
        writer.writerow([
            "User",
            user.id,
            user.name,
            user.email,
            user.created_at,
            "Banned" if user.is_banned else "Active",
            f"Skills: {len(user.offered_skills)}"
        ])
    
    swaps = db.query(SwapRequest).all()
    for swap in swaps:
        writer.writerow([
            "Swap",
            swap.id,
            f"{swap.requester.name} -> {swap.responder.name}",
            "",
            swap.created_at,
            swap.status.value,
            f"{swap.offered_skill.name} for {swap.wanted_skill.name}"
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode()),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=skillswap_stats_{datetime.now().strftime('%Y%m%d')}.csv"}
    )