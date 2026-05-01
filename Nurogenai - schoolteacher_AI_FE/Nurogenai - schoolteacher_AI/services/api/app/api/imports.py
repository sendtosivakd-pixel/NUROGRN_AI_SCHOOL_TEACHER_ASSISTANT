from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile
from app.db.session import get_db
from app.models.student_profile import StudentProfile
from app.schemas.imports import ImportCommitResponse, ImportPreviewResponse
from app.services.csv_import_service import commit_import, preview_import

router = APIRouter(prefix="/imports", tags=["imports"])


@router.post("/marks/preview", response_model=ImportPreviewResponse)
def preview_marks_import(file: UploadFile = File(...)) -> dict:
    return preview_import(file)


@router.post("/marks/commit", response_model=ImportCommitResponse)
def commit_marks_import(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    return commit_import(db, student, file)
