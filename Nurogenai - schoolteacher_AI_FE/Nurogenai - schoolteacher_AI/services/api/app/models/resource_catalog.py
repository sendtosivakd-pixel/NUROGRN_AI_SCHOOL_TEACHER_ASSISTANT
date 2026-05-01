from __future__ import annotations

from sqlalchemy import Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, IdMixin, TimestampMixin
from app.models.enums import ResourceDifficulty, ResourceType


class ResourceCatalog(Base, IdMixin, TimestampMixin):
    __tablename__ = "resource_catalog"

    subject: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    topic: Mapped[str] = mapped_column(String(255), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    type: Mapped[ResourceType] = mapped_column(
        Enum(ResourceType, create_type=False),
        nullable=False,
    )
    difficulty: Mapped[ResourceDifficulty] = mapped_column(
        Enum(ResourceDifficulty, create_type=False),
        nullable=False,
    )
