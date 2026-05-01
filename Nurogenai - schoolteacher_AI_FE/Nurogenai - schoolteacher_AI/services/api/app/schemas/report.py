from datetime import datetime

from app.models.enums import ResourceDifficulty, ResourceType
from app.schemas.analytics import PriorityItemResponse
from app.schemas.base import CamelModel


class RecommendedResourceResponse(CamelModel):
    id: str
    subject: str
    topic: str
    title: str
    url: str
    type: ResourceType
    difficulty: ResourceDifficulty
    reason: str


class WeeklyPlanItemResponse(CamelModel):
    title: str
    cadence: str
    duration_minutes: int
    focus: str


class TargetImprovementResponse(CamelModel):
    subject: str
    current_percentage: float
    target_percentage: float
    rationale: str


class ReportGenerateRequest(CamelModel):
    exam_id: str


class ReportResponse(CamelModel):
    exam_id: str
    summary: str
    strengths: list[str]
    weaknesses: list[str]
    priorities: list[PriorityItemResponse]
    weekly_plan: list[WeeklyPlanItemResponse]
    target_improvements: list[TargetImprovementResponse]
    recommended_resources: list[RecommendedResourceResponse]
    cached: bool
    generated_at: datetime
    risk_reasons: list[str]
    performance_narrative: str
