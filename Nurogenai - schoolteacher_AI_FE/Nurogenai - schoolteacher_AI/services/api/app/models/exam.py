from __future__ import annotations

from datetime import date

from sqlalchemy import Date, Enum, Float, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import ExamType


class Exam(Base, IdMixin, TimestampMixin):
    __tablename__ = "exams"

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exam_name: Mapped[str] = mapped_column(String(255), nullable=False)
    exam_type: Mapped[ExamType] = mapped_column(
        Enum(ExamType, create_type=False),
        nullable=False,
    )
    exam_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)

    student = relationship("StudentProfile", back_populates="exams")
    marks = relationship(
        "Mark",
        back_populates="exam",
        cascade="all, delete-orphan",
        order_by="Mark.created_at",
    )
    reports = relationship(
        "Report",
        back_populates="exam",
        cascade="all, delete-orphan",
        order_by="Report.created_at.desc()",
    )


class Mark(Base, IdMixin, TimestampMixin):
    __tablename__ = "marks"
    __table_args__ = (UniqueConstraint("exam_id", "subject_id", name="uq_exam_subject"),)

    exam_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("exams.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subject_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_subjects.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    marks_obtained: Mapped[float] = mapped_column(Float, nullable=False)
    max_marks: Mapped[float] = mapped_column(Float, nullable=False)

    exam = relationship("Exam", back_populates="marks")
    subject = relationship("StudentSubject", back_populates="marks")
