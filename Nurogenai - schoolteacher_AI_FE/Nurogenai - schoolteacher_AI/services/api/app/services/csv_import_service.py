from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date
from io import StringIO

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.enums import ExamType
from app.models.student_profile import StudentProfile
from app.models.student_subject import StudentSubject
from app.schemas.exam import ExamWriteRequest
from app.services.exam_service import create_exam

EXPECTED_HEADERS = [
    "exam_name",
    "exam_type",
    "exam_date",
    "subject",
    "marks_obtained",
    "max_marks",
]


def parse_csv_file(file: UploadFile) -> tuple[list[dict], list[dict]]:
    content = file.file.read().decode("utf-8-sig")
    reader = csv.DictReader(StringIO(content))
    if reader.fieldnames != EXPECTED_HEADERS:
        return [], [
            {
                "row_number": 0,
                "message": f"CSV headers must be exactly: {', '.join(EXPECTED_HEADERS)}",
            }
        ]

    rows = []
    errors = []
    for index, raw_row in enumerate(reader, start=2):
        try:
            exam_type = ExamType(raw_row["exam_type"].strip())
            exam_date = date.fromisoformat(raw_row["exam_date"].strip())
            marks_obtained = float(raw_row["marks_obtained"])
            max_marks = float(raw_row["max_marks"])
            if marks_obtained < 0 or max_marks <= 0:
                raise ValueError("Marks must be positive and max marks must be greater than zero")
            if marks_obtained > max_marks:
                raise ValueError("Marks obtained cannot exceed maximum marks")
            rows.append(
                {
                    "exam_name": raw_row["exam_name"].strip(),
                    "exam_type": exam_type,
                    "exam_date": exam_date.isoformat(),
                    "subject": raw_row["subject"].strip(),
                    "marks_obtained": marks_obtained,
                    "max_marks": max_marks,
                }
            )
        except Exception as exc:
            errors.append({"row_number": index, "message": str(exc)})

    return rows, errors


def preview_import(file: UploadFile) -> dict:
    rows, errors = parse_csv_file(file)
    return {
        "valid": len(errors) == 0 and len(rows) > 0,
        "rows": rows,
        "errors": errors,
        "subject_names": sorted({row["subject"] for row in rows}),
    }


def commit_import(db: Session, student: StudentProfile, file: UploadFile) -> dict:
    preview = preview_import(file)
    if not preview["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV contains validation errors. Preview and fix the file before importing.",
        )

    existing_subjects = db.scalars(
        select(StudentSubject).where(StudentSubject.student_id == student.id)
    ).all()
    subject_map = {subject.name.strip().lower(): subject for subject in existing_subjects}
    imported_subjects: list[str] = []

    for subject_name in preview["subject_names"]:
        normalized = subject_name.strip().lower()
        if normalized not in subject_map:
            subject = StudentSubject(student_id=student.id, name=subject_name.strip())
            db.add(subject)
            db.flush()
            subject_map[normalized] = subject
            imported_subjects.append(subject.name)

    grouped_rows: dict[tuple[str, str, str], list[dict]] = defaultdict(list)
    for row in preview["rows"]:
        key = (row["exam_name"], row["exam_type"], row["exam_date"])
        grouped_rows[key].append(row)

    imported_exam_ids: list[str] = []
    for (exam_name, exam_type, exam_date), rows in grouped_rows.items():
        payload = ExamWriteRequest(
            exam_name=exam_name,
            exam_type=exam_type,
            exam_date=exam_date,
            marks=[
                {
                    "subject_id": subject_map[row["subject"].strip().lower()].id,
                    "marks_obtained": row["marks_obtained"],
                    "max_marks": row["max_marks"],
                }
                for row in rows
            ],
        )
        exam = create_exam(db, student, payload)
        imported_exam_ids.append(exam.id)

    return {
        "imported_exam_ids": imported_exam_ids,
        "imported_subjects": imported_subjects,
    }
