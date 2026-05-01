from __future__ import annotations

from sqlalchemy import ForeignKey, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class Report(Base, IdMixin, TimestampMixin):
    __tablename__ = "reports"
    __table_args__ = (
        UniqueConstraint("student_id", "exam_id", "input_hash", name="uq_report_hash"),
    )

    student_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("student_profiles.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    exam_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("exams.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    input_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    strengths: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    weaknesses: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    priorities: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    weekly_plan: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    target_improvements: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)
    recommended_resources: Mapped[list[dict]] = mapped_column(JSON, default=list, nullable=False)

    student = relationship("StudentProfile", back_populates="reports")
    exam = relationship("Exam", back_populates="reports")
