from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from ..database import get_db
from ..models import SwapRequest, SwapStatus, User, Skill, Rating
from ..schemas import SwapRequestCreate, SwapRequestUpdate, SwapRequestResponse, MySwapsResponse
from ..core import get_current_active_user

router = APIRouter(prefix="/swaps", tags=["swaps"])

@router.post("/", response_model=SwapRequestResponse)
async def create_swap_request(
    swap_data: SwapRequestCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if swap_data.responder_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create swap request with yourself"
        )
    
    responder = db.query(User).filter(User.id == swap_data.responder_id).first()
    if not responder:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Responder not found"
        )
    
    offered_skill = db.query(Skill).filter(Skill.id == swap_data.offered_skill_id).first()
    wanted_skill = db.query(Skill).filter(Skill.id == swap_data.wanted_skill_id).first()
    
    if not offered_skill or not wanted_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    
    if offered_skill not in current_user.offered_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You don't offer this skill"
        )
    
    if wanted_skill not in responder.offered_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Responder doesn't offer the wanted skill"
        )
    
    existing_request = db.query(SwapRequest).filter(
        SwapRequest.requester_id == current_user.id,
        SwapRequest.responder_id == swap_data.responder_id,
        SwapRequest.offered_skill_id == swap_data.offered_skill_id,
        SwapRequest.wanted_skill_id == swap_data.wanted_skill_id,
        SwapRequest.status == SwapStatus.PENDING
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pending swap request already exists"
        )
    
    swap_request = SwapRequest(
        requester_id=current_user.id,
        responder_id=swap_data.responder_id,
        offered_skill_id=swap_data.offered_skill_id,
        wanted_skill_id=swap_data.wanted_skill_id,
        message=swap_data.message
    )
    
    db.add(swap_request)
    db.commit()
    db.refresh(swap_request)
    
    return build_swap_response(swap_request, db)

@router.put("/{swap_id}", response_model=SwapRequestResponse)
async def update_swap_request(
    swap_id: int,
    swap_update: SwapRequestUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    swap_request = db.query(SwapRequest).filter(SwapRequest.id == swap_id).first()
    
    if not swap_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap request not found"
        )
    
    if swap_request.requester_id != current_user.id and swap_request.responder_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this swap request"
        )
    
    if swap_request.status != SwapStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update pending swap requests"
        )
    
    if swap_update.status == SwapStatus.CANCELLED and swap_request.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only requester can cancel"
        )
    
    if swap_update.status in [SwapStatus.ACCEPTED, SwapStatus.REJECTED] and swap_request.responder_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only responder can accept or reject"
        )
    
    swap_request.status = swap_update.status
    db.commit()
    db.refresh(swap_request)
    
    return build_swap_response(swap_request, db)

@router.get("/my", response_model=MySwapsResponse)
async def get_my_swaps(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    swaps = db.query(SwapRequest).filter(
        (SwapRequest.requester_id == current_user.id) | 
        (SwapRequest.responder_id == current_user.id)
    ).options(
        joinedload(SwapRequest.requester),
        joinedload(SwapRequest.responder),
        joinedload(SwapRequest.offered_skill),
        joinedload(SwapRequest.wanted_skill),
        joinedload(SwapRequest.rating)
    ).order_by(SwapRequest.created_at.desc()).all()
    
    pending = []
    accepted = []
    completed = []
    history = []
    
    for swap in swaps:
        swap_response = build_swap_response(swap, db)
        
        if swap.status == SwapStatus.PENDING:
            pending.append(swap_response)
        elif swap.status == SwapStatus.ACCEPTED:
            accepted.append(swap_response)
        elif swap.status == SwapStatus.COMPLETED:
            completed.append(swap_response)
        else:
            history.append(swap_response)
    
    return MySwapsResponse(
        pending=pending,
        accepted=accepted,
        completed=completed,
        history=history
    )

@router.delete("/{swap_id}")
async def delete_swap_request(
    swap_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    swap_request = db.query(SwapRequest).filter(SwapRequest.id == swap_id).first()
    
    if not swap_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap request not found"
        )
    
    if swap_request.requester_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only requester can delete"
        )
    
    if swap_request.status != SwapStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete pending swap requests"
        )
    
    db.delete(swap_request)
    db.commit()
    
    return {"message": "Swap request deleted"}

def build_swap_response(swap_request: SwapRequest, db: Session) -> SwapRequestResponse:
    rating = db.query(Rating).filter(Rating.swap_id == swap_request.id).first()
    
    return SwapRequestResponse(
        id=swap_request.id,
        requester_id=swap_request.requester_id,
        responder_id=swap_request.responder_id,
        requester_name=swap_request.requester.name,
        responder_name=swap_request.responder.name,
        offered_skill=swap_request.offered_skill,
        wanted_skill=swap_request.wanted_skill,
        status=swap_request.status,
        message=swap_request.message,
        created_at=swap_request.created_at,
        has_rating=rating is not None
    )