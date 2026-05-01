from __future__ import annotations

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class StudentProfile(Base, IdMixin, TimestampMixin):
    __tablename__ = "student_profiles"

    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    class_grade: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    section: Mapped[str | None] = mapped_column(String(50), nullable=True)
    school_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    target_goal: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user = relationship("User", back_populates="student_profile")
    subjects = relationship(
        "StudentSubject",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    exams = relationship(
        "Exam",
        back_populates="student",
        cascade="all, delete-orphan",
    )
    reports = relationship(
        "Report",
        back_populates="student",
        cascade="all, delete-orphan",
    )
