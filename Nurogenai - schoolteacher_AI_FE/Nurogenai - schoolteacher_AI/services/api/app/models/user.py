from __future__ import annotations

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import AuthProvider, UserRole


class User(Base, IdMixin, TimestampMixin):
    __tablename__ = "users"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    provider: Mapped[AuthProvider] = mapped_column(
        Enum(AuthProvider, create_type=False),
        default=AuthProvider.PASSWORD,
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, create_type=False),
        default=UserRole.STUDENT,
        nullable=False,
    )

    student_profile = relationship(
        "StudentProfile",
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
    )
