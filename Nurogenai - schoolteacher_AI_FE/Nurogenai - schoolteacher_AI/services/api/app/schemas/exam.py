from datetime import date, datetime

from pydantic import Field, field_validator

from app.models.enums import ExamType
from app.schemas.base import CamelModel


class ExamMarkInput(CamelModel):
    subject_id: str
    marks_obtained: float = Field(ge=0)
    max_marks: float = Field(gt=0)

    @field_validator("max_marks")
    @classmethod
    def validate_max_marks(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Maximum marks must be greater than zero")
        return value


class ExamWriteRequest(CamelModel):
    exam_name: str = Field(min_length=2, max_length=255)
    exam_type: ExamType
    exam_date: date
    marks: list[ExamMarkInput]


class ExamMarkResponse(CamelModel):
    id: str
    subject_id: str
    subject_name: str
    marks_obtained: float
    max_marks: float


class ExamResponse(CamelModel):
    id: str
    student_id: str
    exam_name: str
    exam_type: ExamType
    exam_date: date
    created_at: datetime
    updated_at: datetime
    total_score: float
    total_max_score: float
    percentage: float
    marks: list[ExamMarkResponse]


class ExamListResponse(CamelModel):
    exams: list[ExamResponse]
