from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile
from app.db.session import get_db
from app.models.student_profile import StudentProfile
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    AnalyticsPrioritiesResponse,
    AnalyticsSubjectsResponse,
    AnalyticsTrendsResponse,
)
from app.services.analytics_service import (
    build_overview,
    build_priorities,
    build_subject_analytics,
    build_trends,
    load_exam_series,
)

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def analytics_overview(
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exams = load_exam_series(db, student)
    return build_overview(exams)


@router.get("/trends", response_model=AnalyticsTrendsResponse)
def analytics_trends(
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exams = load_exam_series(db, student)
    return build_trends(exams)


@router.get("/subjects", response_model=AnalyticsSubjectsResponse)
def analytics_subjects(
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exams = load_exam_series(db, student)
    return {"subjects": build_subject_analytics(exams)}


@router.get("/priorities", response_model=AnalyticsPrioritiesResponse)
def analytics_priorities(
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exams = load_exam_series(db, student)
    return {"priorities": build_priorities(exams)}
