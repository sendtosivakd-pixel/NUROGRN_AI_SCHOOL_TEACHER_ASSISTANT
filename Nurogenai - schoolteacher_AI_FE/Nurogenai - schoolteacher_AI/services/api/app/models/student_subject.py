from __future__ import annotations

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class StudentSubject(Base, IdMixin, TimestampMixin):
    __tablename__ = "student_subjects"
    __table_args__ = (UniqueConstraint("student_id", "name", name="uq_student_subject_name"),)

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    student = relationship("StudentProfile", back_populates="subjects")
    marks = relationship("Mark", back_populates="subject")
