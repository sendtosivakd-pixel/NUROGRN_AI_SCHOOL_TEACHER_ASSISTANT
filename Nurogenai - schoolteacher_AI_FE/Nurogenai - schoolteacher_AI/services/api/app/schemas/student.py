from datetime import datetime

from pydantic import EmailStr, Field

from app.schemas.base import CamelModel


class StudentProfileUpdate(CamelModel):
    full_name: str = Field(min_length=2, max_length=255)
    class_grade: str = Field(min_length=1, max_length=50)
    section: str | None = Field(default=None, max_length=50)
    school_name: str = Field(min_length=2, max_length=255)
    age: int | None = Field(default=None, ge=1, le=100)
    target_goal: str | None = Field(default=None, max_length=255)


class StudentProfileResponse(CamelModel):
    id: str
    user_id: str
    full_name: str
    email: EmailStr
    class_grade: str
    section: str | None
    school_name: str
    age: int | None
    target_goal: str | None
    created_at: datetime
    updated_at: datetime
