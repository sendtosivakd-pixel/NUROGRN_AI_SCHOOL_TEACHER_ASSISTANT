from app.models.enums import ExamType
from app.schemas.base import CamelModel


class ImportPreviewRowResponse(CamelModel):
    exam_name: str
    exam_type: ExamType
    exam_date: str
    subject: str
    marks_obtained: float
    max_marks: float


class ImportPreviewErrorResponse(CamelModel):
    row_number: int
    message: str


class ImportPreviewResponse(CamelModel):
    valid: bool
    rows: list[ImportPreviewRowResponse]
    errors: list[ImportPreviewErrorResponse]
    subject_names: list[str]


class ImportCommitResponse(CamelModel):
    imported_exam_ids: list[str]
    imported_subjects: list[str]
