from __future__ import annotations

import hashlib
import json

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.exam import Exam
from app.models.report import Report
from app.models.student_profile import StudentProfile
from app.schemas.analytics import PriorityItemResponse
from app.services.analytics_service import (
    build_overview,
    build_priorities,
    build_subject_analytics,
    load_exam_series,
)
from app.services.exam_service import serialize_exam
from app.services.resource_service import recommend_resources


def build_report_payload(exam: Exam, exams: list[Exam]) -> dict:
    overview = build_overview(exams)
    subjects = build_subject_analytics(exams)
    priorities = build_priorities(exams)
    return {
        "exam": serialize_exam(exam),
        "overview": overview,
        "subjects": subjects,
        "priorities": priorities,
    }


def compute_input_hash(payload: dict) -> str:
    return hashlib.sha256(json.dumps(payload, default=str, sort_keys=True).encode()).hexdigest()


def create_performance_narrative(overview: dict, priorities: list[dict]) -> str:
    if not priorities:
        return "Performance is stable. Maintain regular revision and keep reinforcing strong subjects."

    lead_priority = priorities[0]["subject_name"]
    trend = overview["trend_status"].value if hasattr(overview["trend_status"], "value") else overview["trend_status"]
    return (
        f"The student is currently in the {overview['performance_band']} band with a {overview['overall_percentage']}% overall. "
        f"The recent trend is {trend}, and the highest intervention priority is {lead_priority}."
    )



def create_fallback_report(payload: dict, resources: list[dict]) -> dict:
    overview = payload["overview"]
    subjects = payload["subjects"]
    priorities = payload["priorities"]
    strongest = [subject for subject in subjects if subject["latest_percentage"] >= 75][:2]
    weakest = priorities[:3]

    strengths = [
        f"{subject['subject_name']} is currently a strength at {subject['latest_percentage']}%."
        for subject in strongest
    ] or ["You are building a foundation, and your strongest subject is starting to stand out."]

    weaknesses = [
        f"{subject['subject_name']} needs attention because {subject['reason']}."
        for subject in weakest
    ] or ["No major weak subjects are flagged yet."]

    focus_subject = weakest[0]["subject_name"] if weakest else "your current weakest subject"
    summary = (
        f"Your latest performance is {overview['overall_percentage']}%, which places you in the "
        f"{overview['performance_band']} band. The current trend is {overview['trend_status']}. "
        f"Put the most effort into {focus_subject} over the next two weeks."
    )

    weekly_plan = []
    for index, priority in enumerate(weakest[:3], start=1):
        weekly_plan.append(
            {
                "title": f"Priority block {index}: {priority['subject_name']}",
                "cadence": "4 times per week",
                "duration_minutes": 35 if index == 1 else 25,
                "focus": priority["reason"],
            }
        )

    if not weekly_plan:
        weekly_plan.append(
            {
                "title": "Maintenance revision",
                "cadence": "3 times per week",
                "duration_minutes": 20,
                "focus": "Revisit the latest topics and complete one timed practice set.",
            }
        )

    target_improvements = [
        {
            "subject": priority["subject_name"],
            "current_percentage": priority["current_percentage"],
            "target_percentage": min(95.0, round(priority["current_percentage"] + 10, 2)),
            "rationale": "Raise the baseline first, then aim for steady gains exam over exam.",
        }
        for priority in weakest[:3]
    ]

    return {
        "summary": summary,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "priorities": priorities,
        "weekly_plan": weekly_plan,
        "target_improvements": target_improvements,
        "recommended_resources": resources,
        "risk_reasons": overview.get("risk_reasons", []),
        "performance_narrative": create_performance_narrative(overview, priorities),
    }


def serialize_report(report: Report, cached: bool) -> dict:
    risk_reasons = []
    performance_narrative = report.summary
    if report.priorities:
        top_priority = report.priorities[0]["subject_name"]
        performance_narrative = f"Current report highlights {top_priority} as the top intervention priority."
        risk_reasons = [item["reason"] for item in report.priorities[:3]]

    return {
        "exam_id": report.exam_id,
        "summary": report.summary,
        "strengths": report.strengths,
        "weaknesses": report.weaknesses,
        "priorities": report.priorities,
        "weekly_plan": report.weekly_plan,
        "target_improvements": report.target_improvements,
        "recommended_resources": report.recommended_resources,
        "cached": cached,
        "generated_at": report.created_at,
        "risk_reasons": risk_reasons,
        "performance_narrative": performance_narrative,
    }


def get_existing_report(db: Session, student: StudentProfile, exam_id: str, input_hash: str) -> Report | None:
    return db.scalar(
        select(Report)
        .where(
            Report.student_id == student.id,
            Report.exam_id == exam_id,
            Report.input_hash == input_hash,
        )
        .order_by(Report.created_at.desc())
    )


def get_latest_report(db: Session, student: StudentProfile, exam_id: str) -> Report:
    report = db.scalar(
        select(Report)
        .where(Report.student_id == student.id, Report.exam_id == exam_id)
        .order_by(Report.created_at.desc())
    )
    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No report has been generated for this exam yet",
        )
    return report


def generate_report(db: Session, student: StudentProfile, exam: Exam) -> dict:
    exams = load_exam_series(db, student)
    payload = build_report_payload(exam, exams)
    input_hash = compute_input_hash(payload)
    cached_report = get_existing_report(db, student, exam.id, input_hash)
    if cached_report is not None:
        return serialize_report(cached_report, cached=True)

    resources = recommend_resources(db, payload["priorities"])
    report_data = create_fallback_report(payload, resources)
    report = Report(
        student_id=student.id,
        exam_id=exam.id,
        input_hash=input_hash,
        summary=report_data["summary"],
        strengths=report_data["strengths"],
        weaknesses=report_data["weaknesses"],
        priorities=report_data["priorities"],
        weekly_plan=report_data["weekly_plan"],
        target_improvements=report_data["target_improvements"],
        recommended_resources=report_data["recommended_resources"],
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return serialize_report(report, cached=False)
