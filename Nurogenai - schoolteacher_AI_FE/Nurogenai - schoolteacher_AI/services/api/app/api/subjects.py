from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_student_profile
from app.db.session import get_db
from app.models.exam import Mark
from app.models.student_profile import StudentProfile
from app.models.student_subject import StudentSubject
from app.schemas.subject import SubjectCreate, SubjectResponse, SubjectUpdate

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.get("/me", response_model=list[SubjectResponse])
def list_my_subjects(
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> list[StudentSubject]:
    return list(
        db.scalars(
            select(StudentSubject)
            .where(StudentSubject.student_id == student.id)
            .order_by(StudentSubject.name.asc())
        )
    )


@router.post("/me", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_my_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> StudentSubject:
    existing = db.scalar(
        select(StudentSubject).where(
            StudentSubject.student_id == student.id,
            StudentSubject.name.ilike(payload.name.strip()),
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject already exists",
        )
    subject = StudentSubject(student_id=student.id, name=payload.name.strip())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


@router.put("/me/{subject_id}", response_model=SubjectResponse)
def update_my_subject(
    subject_id: str,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> StudentSubject:
    subject = db.scalar(
        select(StudentSubject).where(
            StudentSubject.id == subject_id,
            StudentSubject.student_id == student.id,
        )
    )
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    subject.name = payload.name.strip()
    db.commit()
    db.refresh(subject)
    return subject


@router.delete("/me/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_subject(
    subject_id: str,
    db: Session = Depends(get_db),
    student: StudentProfile = Depends(get_current_student_profile),
) -> None:
    subject = db.scalar(
        select(StudentSubject).where(
            StudentSubject.id == subject_id,
            StudentSubject.student_id == student.id,
        )
    )
    if subject is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")

    has_marks = db.scalar(select(Mark).where(Mark.subject_id == subject.id))
    if has_marks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Delete exams that use this subject before removing it",
        )

    db.delete(subject)
    db.commit()
