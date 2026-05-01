from __future__ import annotations

from typing import Literal

from pydantic import Field

from app.schemas.base import CamelModel

TeacherQueryType = Literal["qa", "lesson_plan", "worksheet", "remediation", "topic_explain"]


class TextbookResponse(CamelModel):
    id: str
    standard: int
    medium: str
    subject: str
    term: str
    title: str
    source_file: str
    source_url: str | None = None


class TextbookChunkResponse(CamelModel):
    id: str
    textbook_id: str
    chapter_title: str | None = None
    section_title: str | None = None
    page_start: int | None = None
    page_end: int | None = None
    chunk_index: int
    content: str


class TextbookSearchRequest(CamelModel):
    query: str = Field(min_length=1)
    standard: int | None = None
    medium: str | None = None
    subject: str | None = None
    limit: int = Field(default=5, ge=1, le=20)


class TextbookSearchResult(CamelModel):
    textbook: TextbookResponse
    chunk: TextbookChunkResponse
    score: float


class TextbookSearchResponse(CamelModel):
    results: list[TextbookSearchResult]
    total: int


class Citation(CamelModel):
    textbook_id: str
    textbook_title: str
    standard: int
    medium: str
    subject: str
    chapter_title: str | None = None
    section_title: str | None = None
    page_start: int | None = None
    page_end: int | None = None


class TeacherAssistantRequest(CamelModel):
    query: str = Field(min_length=1)
    query_type: TeacherQueryType = "qa"
    standard: int | None = None
    medium: str | None = None
    subject: str | None = None
    limit: int = Field(default=5, ge=1, le=10)


class TeacherAssistantResponse(CamelModel):
    answer: str
    query_type: TeacherQueryType
    citations: list[Citation]
    retrieved_chunks: int
