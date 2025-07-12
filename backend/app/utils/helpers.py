from typing import Optional, List
from sqlalchemy.orm import Session
from ..models import User, Skill

def is_admin_email(email: str) -> bool:
    from ..config import settings
    return any(domain in email for domain in settings.ADMIN_EMAIL_DOMAINS)

def paginate_query(query, page: int = 1, per_page: int = 10):
    offset = (page - 1) * per_page
    return query.offset(offset).limit(per_page)

def calculate_pagination_info(total: int, page: int, per_page: int) -> dict:
    total_pages = (total + per_page - 1) // per_page
    has_next = page < total_pages
    has_prev = page > 1
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "has_next": has_next,
        "has_prev": has_prev
    }

def validate_skills_exist(db: Session, skill_ids: List[int]) -> bool:
    if not skill_ids:
        return True
    
    existing_skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).count()
    return existing_skills == len(skill_ids)

def get_user_average_rating(db: Session, user_id: int) -> Optional[float]:
    from ..models import Rating
    
    ratings = db.query(Rating).filter(Rating.rated_id == user_id).all()
    if not ratings:
        return None
    
    total_stars = sum(rating.stars for rating in ratings)
    return total_stars / len(ratings)