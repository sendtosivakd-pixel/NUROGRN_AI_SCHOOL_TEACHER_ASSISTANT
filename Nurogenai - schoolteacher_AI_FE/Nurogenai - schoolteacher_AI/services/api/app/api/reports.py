from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile
from app.db.session import get_db
from app.models.student_profile import StudentProfile
from app.schemas.report import ReportGenerateRequest, ReportResponse
from app.services.exam_service import load_student_exam
from app.services.report_service import generate_report, get_latest_report, serialize_report

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post("/generate", response_model=ReportResponse)
def generate_student_report(
    payload: ReportGenerateRequest,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exam = load_student_exam(db, student, payload.exam_id)
    return generate_report(db, student, exam)


@router.get("/latest", response_model=ReportResponse)
def latest_report(
    exam_id: str,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    report = get_latest_report(db, student, exam_id)
    return serialize_report(report, cached=True)
