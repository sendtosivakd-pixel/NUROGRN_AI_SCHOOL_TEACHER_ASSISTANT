from datetime import date

from app.models.exam import Exam, Mark
from app.models.enums import ExamType, TrendStatus
from app.models.student_subject import StudentSubject
from app.services.analytics_service import build_overview, build_priorities


def make_exam(exam_name: str, exam_date: date, scores: list[tuple[str, float, float]]) -> Exam:
    exam = Exam(
        student_id="student-1",
        exam_name=exam_name,
        exam_type=ExamType.MONTHLY_TEST,
        exam_date=exam_date,
    )
    marks = []
    for index, (subject_name, obtained, maximum) in enumerate(scores, start=1):
        subject = StudentSubject(id=f"subject-{index}-{exam_name}", student_id="student-1", name=subject_name)
        marks.append(
            Mark(
                subject_id=subject.id,
                subject=subject,
                marks_obtained=obtained,
                max_marks=maximum,
            )
        )
    exam.marks = marks
    return exam


def test_build_overview_flags_latest_risk_and_trend() -> None:
    exams = [
        make_exam(
            "January Test",
            date(2026, 1, 20),
            [("Mathematics", 80, 100), ("Science", 75, 100), ("English", 82, 100)],
        ),
        make_exam(
            "February Test",
            date(2026, 2, 20),
            [("Mathematics", 50, 100), ("Science", 68, 100), ("English", 78, 100)],
        ),
    ]

    overview = build_overview(exams)

    assert overview["overall_percentage"] == 65.33
    assert overview["weakest_subject"] == "Mathematics"
    assert overview["trend_status"] == TrendStatus.DECLINING
    assert overview["risk_flag"] is True


def test_build_priorities_ranks_declining_subject_first() -> None:
    exams = [
        make_exam(
            "Exam A",
            date(2026, 1, 15),
            [("Mathematics", 72, 100), ("Science", 65, 100), ("English", 88, 100)],
        ),
        make_exam(
            "Exam B",
            date(2026, 2, 15),
            [("Mathematics", 52, 100), ("Science", 63, 100), ("English", 85, 100)],
        ),
    ]

    priorities = build_priorities(exams)

    assert priorities[0]["subject_name"] == "Mathematics"
    assert priorities[0]["effort_share"] > priorities[1]["effort_share"]
    assert "declined" in priorities[0]["reason"] or "threshold" in priorities[0]["reason"]
