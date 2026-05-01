from __future__ import annotations

from typing import Any
from sqlalchemy import ForeignKey, Integer, String, Text
try:
    from pgvector.sqlalchemy import Vector
except ImportError:
    Vector = Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, IdMixin, TimestampMixin


class Textbook(Base, IdMixin, TimestampMixin):
    __tablename__ = "textbooks"

    standard: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    medium: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    subject: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    term: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_file: Mapped[str] = mapped_column(String(1024), nullable=False, unique=True)
    source_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)

    chunks = relationship(
        "TextbookChunk",
        back_populates="textbook",
        cascade="all, delete-orphan",
    )


class TextbookChunk(Base, IdMixin, TimestampMixin):
    __tablename__ = "textbook_chunks"

    textbook_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("textbooks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chapter_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    section_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    page_start: Mapped[int | None] = mapped_column(Integer, nullable=True)
    page_end: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    if Vector is Text:
        embedding: Mapped[str | None] = mapped_column(Text, nullable=True)
        embedding_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    else:
        embedding: Mapped[Any] = mapped_column(Vector(1536), nullable=True)
        embedding_model: Mapped[str | None] = mapped_column(String(100), nullable=True)

    textbook = relationship("Textbook", back_populates="chunks")
