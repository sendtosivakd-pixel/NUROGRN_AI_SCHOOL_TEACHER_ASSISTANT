from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile, get_current_user
from app.db.session import get_db
from app.models.student_profile import StudentProfile
from app.models.user import User
from app.schemas.student import StudentProfileResponse, StudentProfileUpdate

router = APIRouter(prefix="/students", tags=["students"])


def serialize_profile(profile: StudentProfile, user: User) -> dict:
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": profile.full_name,
        "email": user.email,
        "class_grade": profile.class_grade,
        "section": profile.section,
        "school_name": profile.school_name,
        "age": profile.age,
        "target_goal": profile.target_goal,
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }


@router.get("/me", response_model=StudentProfileResponse)
def get_my_profile(
    profile: StudentProfile = Depends(get_current_student_profile),
    current_user: User = Depends(get_current_user),
) -> dict:
    return serialize_profile(profile, current_user)


@router.put("/me", response_model=StudentProfileResponse)
def update_my_profile(
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
    profile: StudentProfile = Depends(get_current_student_profile),
    current_user: User = Depends(get_current_user),
) -> dict:
    profile.full_name = payload.full_name.strip()
    profile.class_grade = payload.class_grade.strip()
    profile.section = payload.section.strip() if payload.section else None
    profile.school_name = payload.school_name.strip()
    profile.age = payload.age
    profile.target_goal = payload.target_goal.strip() if payload.target_goal else None
    current_user.name = profile.full_name
    db.commit()
    db.refresh(profile)
    return serialize_profile(profile, current_user)
