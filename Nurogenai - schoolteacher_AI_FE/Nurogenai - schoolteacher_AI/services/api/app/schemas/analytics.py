from datetime import date

from app.models.enums import PerformanceBand, TrendStatus
from app.schemas.base import CamelModel


class AnalyticsOverviewResponse(CamelModel):
    overall_percentage: float
    total_score: float
    total_max_score: float
    performance_band: PerformanceBand
    strongest_subject: str | None
    weakest_subject: str | None
    trend_status: TrendStatus
    consistency_score: float
    risk_flag: bool
    latest_exam_percentage: float
    previous_exam_percentage: float | None
    improvement_delta: float | None
    strong_subjects_count: int
    weak_subjects_count: int
    risk_reasons: list[str]


class TrendPointResponse(CamelModel):
    exam_id: str
    exam_name: str
    exam_date: date
    overall_percentage: float


class SubjectTrendPointResponse(CamelModel):
    exam_id: str
    exam_date: date
    percentage: float


class AnalyticsTrendsResponse(CamelModel):
    points: list[TrendPointResponse]
    subject_series: dict[str, list[SubjectTrendPointResponse]]


class SubjectAnalyticsResponse(CamelModel):
    subject_id: str
    subject_name: str
    latest_percentage: float
    average_percentage: float
    trend_status: TrendStatus
    exams_taken: int
    previous_percentage: float | None
    delta_percentage: float | None
    risk_level: str
    action_hint: str


class AnalyticsSubjectsResponse(CamelModel):
    subjects: list[SubjectAnalyticsResponse]


class PriorityItemResponse(CamelModel):
    subject_id: str
    subject_name: str
    current_percentage: float
    priority_score: float
    effort_share: float
    reason: str
    trend_status: TrendStatus
    average_percentage: float
    delta_percentage: float | None
    risk_level: str


class AnalyticsPrioritiesResponse(CamelModel):
    priorities: list[PriorityItemResponse]
