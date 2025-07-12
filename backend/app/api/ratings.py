from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Rating, SwapRequest, SwapStatus, User
from ..schemas import RatingCreate, RatingResponse
from ..core import get_current_active_user

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post("/", response_model=RatingResponse)
async def create_rating(
    rating_data: RatingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    swap_request = db.query(SwapRequest).filter(SwapRequest.id == rating_data.swap_id).first()
    
    if not swap_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Swap request not found"
        )
    
    if swap_request.status != SwapStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only rate accepted swaps"
        )
    
    if swap_request.requester_id != current_user.id and swap_request.responder_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to rate this swap"
        )
    
    rated_user = db.query(User).filter(User.id == rating_data.rated_id).first()
    if not rated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rated user not found"
        )
    
    if rating_data.rated_id != swap_request.requester_id and rating_data.rated_id != swap_request.responder_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only rate participants of the swap"
        )
    
    if rating_data.rated_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot rate yourself"
        )
    
    existing_rating = db.query(Rating).filter(
        Rating.swap_id == rating_data.swap_id,
        Rating.rater_id == current_user.id
    ).first()
    
    if existing_rating:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rating already exists for this swap"
        )
    
    rating = Rating(
        swap_id=rating_data.swap_id,
        rater_id=current_user.id,
        rated_id=rating_data.rated_id,
        stars=rating_data.stars,
        comment=rating_data.comment
    )
    
    db.add(rating)
    
    swap_request.status = SwapStatus.COMPLETED
    
    db.commit()
    db.refresh(rating)
    
    return RatingResponse(
        id=rating.id,
        swap_id=rating.swap_id,
        rater_id=rating.rater_id,
        rated_id=rating.rated_id,
        rater_name=rating.rater.name,
        rated_name=rating.rated.name,
        stars=rating.stars,
        comment=rating.comment,
        created_at=rating.created_at
    )

@router.get("/user/{user_id}", response_model=List[RatingResponse])
async def get_user_ratings(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    ratings = db.query(Rating).filter(Rating.rated_id == user_id).all()
    
    return [
        RatingResponse(
            id=rating.id,
            swap_id=rating.swap_id,
            rater_id=rating.rater_id,
            rated_id=rating.rated_id,
            rater_name=rating.rater.name,
            rated_name=rating.rated.name,
            stars=rating.stars,
            comment=rating.comment,
            created_at=rating.created_at
        )
        for rating in ratings
    ]