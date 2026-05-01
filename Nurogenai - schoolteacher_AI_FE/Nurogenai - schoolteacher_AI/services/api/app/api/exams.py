from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile
from app.db.session import get_db
from app.models.student_profile import StudentProfile
from app.schemas.exam import ExamListResponse, ExamResponse, ExamWriteRequest
from app.services.exam_service import (
    create_exam,
    delete_exam,
    list_student_exams,
    load_student_exam,
    serialize_exam,
    update_exam,
)

router = APIRouter(prefix="/exams", tags=["exams"])


@router.get("", response_model=ExamListResponse)
def list_exams(
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exams = list_student_exams(db, student)
    return {"exams": [serialize_exam(exam) for exam in exams]}


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_student_exam(
    payload: ExamWriteRequest,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exam = create_exam(db, student, payload)
    return serialize_exam(exam)


@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exam = load_student_exam(db, student, exam_id)
    return serialize_exam(exam)


@router.put("/{exam_id}", response_model=ExamResponse)
def update_student_exam(
    exam_id: str,
    payload: ExamWriteRequest,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> dict:
    exam = load_student_exam(db, student, exam_id)
    updated = update_exam(db, student, exam, payload)
    return serialize_exam(updated)


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student_exam(
    exam_id: str,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> Response:
    exam = load_student_exam(db, student, exam_id)
    delete_exam(db, student, exam)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
