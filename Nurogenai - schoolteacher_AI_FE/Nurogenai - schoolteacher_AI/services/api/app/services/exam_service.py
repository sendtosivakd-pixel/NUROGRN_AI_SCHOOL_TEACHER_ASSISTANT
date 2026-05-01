from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session, selectinload

from app.models.exam import Exam, Mark
from app.models.report import Report
from app.models.student_profile import StudentProfile
from app.models.student_subject import StudentSubject
from app.schemas.exam import ExamWriteRequest


def validate_marks_payload(
    db: Session,
    student: StudentProfile,
    payload: ExamWriteRequest,
) -> dict[str, StudentSubject]:
    if not payload.marks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one subject mark is required",
        )

    subject_ids = [mark.subject_id for mark in payload.marks]
    if len(subject_ids) != len(set(subject_ids)):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate subject rows are not allowed in one exam",
        )

    subjects = db.scalars(
        select(StudentSubject).where(
            StudentSubject.student_id == student.id,
            StudentSubject.id.in_(subject_ids),
        )
    ).all()
    subject_map = {subject.id: subject for subject in subjects}

    missing_subjects = [subject_id for subject_id in subject_ids if subject_id not in subject_map]
    if missing_subjects:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more selected subjects do not belong to this student",
        )

    for mark in payload.marks:
        if mark.marks_obtained > mark.max_marks:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Marks obtained cannot exceed maximum marks",
            )

    return subject_map


def compute_exam_totals(exam: Exam) -> tuple[float, float, float]:
    total_score = round(sum(mark.marks_obtained for mark in exam.marks), 2)
    total_max_score = round(sum(mark.max_marks for mark in exam.marks), 2)
    percentage = round((total_score / total_max_score) * 100, 2) if total_max_score else 0.0
    return total_score, total_max_score, percentage


def serialize_exam(exam: Exam) -> dict:
    total_score, total_max_score, percentage = compute_exam_totals(exam)
    marks = sorted(exam.marks, key=lambda item: item.subject.name.lower())
    return {
        "id": exam.id,
        "student_id": exam.student_id,
        "exam_name": exam.exam_name,
        "exam_type": exam.exam_type,
        "exam_date": exam.exam_date,
        "created_at": exam.created_at,
        "updated_at": exam.updated_at,
        "total_score": total_score,
        "total_max_score": total_max_score,
        "percentage": percentage,
        "marks": [
            {
                "id": mark.id,
                "subject_id": mark.subject_id,
                "subject_name": mark.subject.name,
                "marks_obtained": round(mark.marks_obtained, 2),
                "max_marks": round(mark.max_marks, 2),
            }
            for mark in marks
        ],
    }


def load_student_exam(db: Session, student: StudentProfile, exam_id: str) -> Exam:
    exam = db.scalar(
        select(Exam)
        .options(selectinload(Exam.marks).selectinload(Mark.subject))
        .where(Exam.id == exam_id, Exam.student_id == student.id)
    )
    if exam is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exam not found",
        )
    return exam


def list_student_exams(db: Session, student: StudentProfile) -> list[Exam]:
    return list(
        db.scalars(
            select(Exam)
            .options(selectinload(Exam.marks).selectinload(Mark.subject))
            .where(Exam.student_id == student.id)
            .order_by(Exam.exam_date.desc(), Exam.created_at.desc())
        )
    )


def create_exam(db: Session, student: StudentProfile, payload: ExamWriteRequest) -> Exam:
    validate_marks_payload(db, student, payload)
    exam = Exam(
        student_id=student.id,
        exam_name=payload.exam_name.strip(),
        exam_type=payload.exam_type,
        exam_date=payload.exam_date,
    )
    exam.marks = [
        Mark(
            subject_id=mark.subject_id,
            marks_obtained=mark.marks_obtained,
            max_marks=mark.max_marks,
        )
        for mark in payload.marks
    ]
    db.add(exam)
    db.commit()
    return load_student_exam(db, student, exam.id)


def update_exam(
    db: Session,
    student: StudentProfile,
    exam: Exam,
    payload: ExamWriteRequest,
) -> Exam:
    validate_marks_payload(db, student, payload)
    exam.exam_name = payload.exam_name.strip()
    exam.exam_type = payload.exam_type
    exam.exam_date = payload.exam_date
    exam.marks.clear()
    db.flush()

    for mark in payload.marks:
        exam.marks.append(
            Mark(
                subject_id=mark.subject_id,
                marks_obtained=mark.marks_obtained,
                max_marks=mark.max_marks,
            )
        )

    db.execute(delete(Report).where(Report.exam_id == exam.id))
    db.commit()
    return load_student_exam(db, student, exam.id)


def delete_exam(db: Session, student: StudentProfile, exam: Exam) -> None:
    db.execute(delete(Report).where(Report.exam_id == exam.id))
    db.delete(exam)
    db.commit()
