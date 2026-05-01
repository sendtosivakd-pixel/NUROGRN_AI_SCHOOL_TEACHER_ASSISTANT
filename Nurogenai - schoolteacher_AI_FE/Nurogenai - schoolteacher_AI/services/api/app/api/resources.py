from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile
from app.db.session import get_db
from app.models.student_profile import StudentProfile
from app.schemas.resource import RecommendedResourcesResponse
from app.services.analytics_service import build_priorities, load_exam_series
from app.services.exam_service import load_student_exam
from app.services.resource_service import recommend_resources

router = APIRouter(prefix="/resources", tags=["resources"])


@router.get("/recommended", response_model=RecommendedResourcesResponse)
def recommended_resources(
    exam_id: str,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    load_student_exam(db, student, exam_id)
    exams = load_exam_series(db, student)
    priorities = build_priorities(exams)
    resources = recommend_resources(db, priorities)
    return {"exam_id": exam_id, "resources": resources}
