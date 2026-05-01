from __future__ import annotations

from collections import defaultdict
from statistics import pstdev

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.exam import Exam, Mark
from app.models.enums import PerformanceBand, TrendStatus
from app.models.student_profile import StudentProfile


def derive_risk_level(latest_percentage: float, trend_status: TrendStatus, average_percentage: float) -> str:
    if latest_percentage < 50 or trend_status == TrendStatus.DECLINING:
        return "high"
    if latest_percentage < 70 or average_percentage < 65:
        return "medium"
    return "low"


def build_action_hint(latest_percentage: float, trend_status: TrendStatus, average_percentage: float) -> str:
    if latest_percentage < 50:
        return "Immediate guided practice and teacher review recommended."
    if trend_status == TrendStatus.DECLINING:
        return "Re-teach recent concepts and add short revision cycles."
    if average_percentage < 65:
        return "Increase consistency with weekly recap and timed practice."
    return "Maintain current performance with regular reinforcement."


def derive_risk_reasons(latest_percentage: float, subject_percentages: list[tuple[str, float]], trend_status: TrendStatus, consistency_score: float) -> list[str]:
    reasons: list[str] = []
    weak_subjects = [name for name, score in subject_percentages if score < 60]
    if latest_percentage < 50:
        reasons.append("overall performance is below the expected threshold")
    if weak_subjects:
        reasons.append(f"weak subject scores detected in {', '.join(weak_subjects[:3])}")
    if trend_status == TrendStatus.DECLINING:
        reasons.append("overall trend has declined compared with the previous exam")
    if consistency_score < 70:
        reasons.append("performance consistency has dropped across recent exams")
    return reasons


def load_exam_series(db: Session, student: StudentProfile) -> list[Exam]:
    return list(
        db.scalars(
            select(Exam)
            .options(selectinload(Exam.marks).selectinload(Mark.subject))
            .where(Exam.student_id == student.id)
            .order_by(Exam.exam_date.asc(), Exam.created_at.asc())
        )
    )


def compute_mark_percentage(mark: Mark) -> float:
    return round((mark.marks_obtained / mark.max_marks) * 100, 2) if mark.max_marks else 0.0


def compute_exam_percentage(exam: Exam) -> float:
    total_score = sum(mark.marks_obtained for mark in exam.marks)
    total_max = sum(mark.max_marks for mark in exam.marks)
    return round((total_score / total_max) * 100, 2) if total_max else 0.0


def get_performance_band(percentage: float) -> PerformanceBand:
    if percentage >= 85:
        return PerformanceBand.EXCELLENT
    if percentage >= 70:
        return PerformanceBand.GOOD
    if percentage >= 50:
        return PerformanceBand.AVERAGE
    return PerformanceBand.NEEDS_IMPROVEMENT


def compare_percentages(current: float, previous: float | None) -> TrendStatus:
    if previous is None:
        return TrendStatus.INSUFFICIENT_DATA
    delta = round(current - previous, 2)
    if delta >= 5:
        return TrendStatus.IMPROVING
    if delta <= -5:
        return TrendStatus.DECLINING
    return TrendStatus.STABLE


def build_overview(exams: list[Exam]) -> dict:
    if not exams:
        return {
            "overall_percentage": 0.0,
            "total_score": 0.0,
            "total_max_score": 0.0,
            "performance_band": PerformanceBand.NEEDS_IMPROVEMENT,
            "strongest_subject": None,
            "weakest_subject": None,
            "trend_status": TrendStatus.INSUFFICIENT_DATA,
            "consistency_score": 0.0,
            "risk_flag": False,
            "latest_exam_percentage": 0.0,
            "previous_exam_percentage": None,
            "improvement_delta": None,
            "strong_subjects_count": 0,
            "weak_subjects_count": 0,
            "risk_reasons": [],
        }

    latest = exams[-1]
    latest_percentage = compute_exam_percentage(latest)
    previous_percentage = compute_exam_percentage(exams[-2]) if len(exams) > 1 else None
    subject_percentages = [
        (mark.subject.name, compute_mark_percentage(mark)) for mark in latest.marks
    ]
    strongest_subject = max(subject_percentages, key=lambda item: item[1])[0] if subject_percentages else None
    weakest_subject = min(subject_percentages, key=lambda item: item[1])[0] if subject_percentages else None

    scores = [compute_exam_percentage(exam) for exam in exams]
    consistency_score = 100.0
    if len(scores) > 1:
        consistency_score = max(0.0, round(100 - (pstdev(scores) * 2.5), 2))

    total_score = round(sum(mark.marks_obtained for mark in latest.marks), 2)
    total_max_score = round(sum(mark.max_marks for mark in latest.marks), 2)
    trend_status = compare_percentages(latest_percentage, previous_percentage)
    weak_subject_detected = any(score < 60 for _, score in subject_percentages)
    risk_reasons = derive_risk_reasons(latest_percentage, subject_percentages, trend_status, consistency_score)

    return {
        "overall_percentage": latest_percentage,
        "total_score": total_score,
        "total_max_score": total_max_score,
        "performance_band": get_performance_band(latest_percentage),
        "strongest_subject": strongest_subject,
        "weakest_subject": weakest_subject,
        "trend_status": trend_status,
        "consistency_score": consistency_score,
        "risk_flag": latest_percentage < 50 or weak_subject_detected,
        "latest_exam_percentage": latest_percentage,
        "previous_exam_percentage": previous_percentage,
        "improvement_delta": round(latest_percentage - previous_percentage, 2) if previous_percentage is not None else None,
        "strong_subjects_count": sum(1 for _, score in subject_percentages if score >= 75),
        "weak_subjects_count": sum(1 for _, score in subject_percentages if score < 60),
        "risk_reasons": risk_reasons,
    }


def build_trends(exams: list[Exam]) -> dict:
    points = []
    subject_series: dict[str, list[dict]] = defaultdict(list)
    for exam in exams:
        points.append(
            {
                "exam_id": exam.id,
                "exam_name": exam.exam_name,
                "exam_date": exam.exam_date,
                "overall_percentage": compute_exam_percentage(exam),
            }
        )
        for mark in exam.marks:
            subject_series[mark.subject.name].append(
                {
                    "exam_id": exam.id,
                    "exam_date": exam.exam_date,
                    "percentage": compute_mark_percentage(mark),
                }
            )
    return {"points": points, "subject_series": dict(subject_series)}


def build_subject_analytics(exams: list[Exam]) -> list[dict]:
    by_subject: dict[str, dict] = defaultdict(
        lambda: {"subject_id": "", "subject_name": "", "scores": []}
    )
    for exam in exams:
        for mark in exam.marks:
            entry = by_subject[mark.subject_id]
            entry["subject_id"] = mark.subject_id
            entry["subject_name"] = mark.subject.name
            entry["scores"].append(compute_mark_percentage(mark))

    items = []
    for value in by_subject.values():
        scores = value["scores"]
        latest = scores[-1]
        previous = scores[-2] if len(scores) > 1 else None
        average_percentage = round(sum(scores) / len(scores), 2)
        trend_status = compare_percentages(latest, previous)
        items.append(
            {
                "subject_id": value["subject_id"],
                "subject_name": value["subject_name"],
                "latest_percentage": latest,
                "average_percentage": average_percentage,
                "trend_status": trend_status,
                "exams_taken": len(scores),
                "previous_percentage": previous,
                "delta_percentage": round(latest - previous, 2) if previous is not None else None,
                "risk_level": derive_risk_level(latest, trend_status, average_percentage),
                "action_hint": build_action_hint(latest, trend_status, average_percentage),
            }
        )
    return sorted(items, key=lambda item: (item["latest_percentage"], item["subject_name"]))


def build_priorities(exams: list[Exam]) -> list[dict]:
    subjects = build_subject_analytics(exams)
    if not subjects:
        return []

    raw_scores = []
    for subject in subjects:
        priority_score = max(0.0, 100 - subject["latest_percentage"])
        reasons = []
        if subject["latest_percentage"] < 60:
            priority_score += 12
            reasons.append("score is below the target threshold")
        if subject["trend_status"] == TrendStatus.DECLINING:
            priority_score += 10
            reasons.append("trend has declined compared with the previous exam")
        if subject["average_percentage"] < 65:
            priority_score += 6
            reasons.append("performance has been inconsistent across exams")
        raw_scores.append((subject, round(priority_score, 2), reasons))

    total = sum(score for _, score, _ in raw_scores) or 1
    priorities = []
    for subject, score, reasons in sorted(raw_scores, key=lambda item: item[1], reverse=True):
        priorities.append(
            {
                "subject_id": subject["subject_id"],
                "subject_name": subject["subject_name"],
                "current_percentage": subject["latest_percentage"],
                "priority_score": score,
                "effort_share": round((score / total) * 100, 1),
                "reason": "; ".join(reasons) or "maintain steady practice and revision",
                "trend_status": subject["trend_status"],
                "average_percentage": subject["average_percentage"],
                "delta_percentage": subject["delta_percentage"],
                "risk_level": subject["risk_level"],
            }
        )
    return priorities
