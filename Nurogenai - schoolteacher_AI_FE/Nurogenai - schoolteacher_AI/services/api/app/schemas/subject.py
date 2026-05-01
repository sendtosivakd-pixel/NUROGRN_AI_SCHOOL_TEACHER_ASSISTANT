from datetime import datetime

from pydantic import Field

from app.schemas.base import CamelModel


class SubjectCreate(CamelModel):
    name: str = Field(min_length=2, max_length=120)


class SubjectUpdate(CamelModel):
    name: str = Field(min_length=2, max_length=120)


class SubjectResponse(CamelModel):
    id: str
    student_id: str
    name: str
    created_at: datetime
