from __future__ import annotations

from pathlib import Path
import json
import re
from typing import Any

from sqlalchemy import Select, and_, or_, select
from sqlalchemy.orm import Session

from app.models.textbook import Textbook, TextbookChunk
from app.schemas.textbook import (
    Citation,
    TeacherAssistantRequest,
    TeacherAssistantResponse,
    TextbookSearchRequest,
    TextbookSearchResponse,
    TextbookSearchResult,
)


STOPWORDS = {
    "a", "an", "and", "are", "class", "explain", "for", "from", "give", "how", "in", "into",
    "is", "lesson", "of", "on", "students", "subject", "teach", "teacher", "the", "this", "to",
    "topic", "what", "with",
}

SUBJECT_HINTS = {
    "photosynthesis": "Science",
    "plant": "Science",
    "plants": "Science",
    "leaf": "Science",
    "leaves": "Science",
    "fraction": "Mathematics",
    "addition": "Mathematics",
    "subtraction": "Mathematics",
    "grammar": "English",
    "poem": "English",
}

MVP_PREFERRED_MEDIUM = "English"
MVP_PREFERRED_SUBJECTS = {"science", "mathematics", "english"}
NOISY_SUBJECT_MARKERS = {"social", "vol-ii", "vol ii", "reader"}


class TextbookService:
    def __init__(self, db: Session):
        self.db = db

    def _normalize_text(self, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.strip().split())
        return normalized or None

    def _tokenize_query(self, query: str) -> list[str]:
        normalized = self._normalize_text(query)
        if not normalized:
            return []
        tokens = re.findall(r"[a-zA-Z0-9]+", normalized.lower())
        return [token for token in tokens if len(token) >= 3 and token not in STOPWORDS]

    def _infer_subject_hint(self, tokens: list[str]) -> str | None:
        for token in tokens:
            hint = SUBJECT_HINTS.get(token)
            if hint:
                return hint
        return None

    def _is_default_mvp_query(
        self,
        medium: str | None,
        subject: str | None,
    ) -> bool:
        return not medium and not subject

    def list_textbooks(
        self,
        standard: int | None = None,
        medium: str | None = None,
        subject: str | None = None,
    ) -> list[Textbook]:
        stmt = select(Textbook).order_by(Textbook.standard, Textbook.medium, Textbook.subject)
        if standard is not None:
            stmt = stmt.where(Textbook.standard == standard)
        if medium:
            stmt = stmt.where(Textbook.medium == medium)
        if subject:
            stmt = stmt.where(Textbook.subject == subject)
        return list(self.db.scalars(stmt).all())

    def search(self, request: TextbookSearchRequest) -> TextbookSearchResponse:
        stmt: Select[tuple[TextbookChunk, Textbook]] = (
            select(TextbookChunk, Textbook)
            .join(Textbook, TextbookChunk.textbook_id == Textbook.id)
            .order_by(Textbook.standard, Textbook.subject, TextbookChunk.chunk_index)
        )

        normalized_medium = self._normalize_text(request.medium)
        normalized_subject = self._normalize_text(request.subject)
        normalized_query = self._normalize_text(request.query) or request.query
        tokens = self._tokenize_query(normalized_query)
        inferred_subject = None if normalized_subject else self._infer_subject_hint(tokens)
        default_mvp_query = self._is_default_mvp_query(normalized_medium, normalized_subject)

        if request.standard is not None:
            stmt = stmt.where(Textbook.standard == request.standard)
        if normalized_medium:
            stmt = stmt.where(Textbook.medium.ilike(f"%{normalized_medium}%"))
        if normalized_subject:
            stmt = stmt.where(Textbook.subject.ilike(f"%{normalized_subject}%"))

        search_clauses = []
        if normalized_query:
            exact_term = f"%{normalized_query}%"
            search_clauses.append(
                or_(
                    TextbookChunk.content.ilike(exact_term),
                    TextbookChunk.chapter_title.ilike(exact_term),
                    TextbookChunk.section_title.ilike(exact_term),
                    Textbook.title.ilike(exact_term),
                    Textbook.subject.ilike(exact_term),
                )
            )

        token_clauses = []
        for token in tokens:
            token_term = f"%{token}%"
            token_clauses.append(
                or_(
                    TextbookChunk.content.ilike(token_term),
                    TextbookChunk.chapter_title.ilike(token_term),
                    TextbookChunk.section_title.ilike(token_term),
                    Textbook.title.ilike(token_term),
                    Textbook.subject.ilike(token_term),
                )
            )

        if token_clauses:
            search_clauses.append(and_(*token_clauses[:4]))
            search_clauses.append(or_(*token_clauses))

        if search_clauses:
            stmt = stmt.where(or_(*search_clauses))

        rows = self.db.execute(stmt.limit(max(request.limit * 25, 50))).all()

        scored_results: list[tuple[float, TextbookSearchResult]] = []
        lowered_query = normalized_query.lower()
        for chunk, book in rows:
            haystacks = [
                book.title or "",
                book.subject or "",
                chunk.chapter_title or "",
                chunk.section_title or "",
                chunk.content or "",
            ]
            haystack_text = " ".join(haystacks).lower()
            score = 0.0
            token_hits = 0
            if lowered_query and lowered_query in haystack_text:
                score += 6.0
            for token in tokens:
                if token in haystack_text:
                    token_hits += 1
                    score += 1.2
            if token_hits == 0 and tokens:
                continue
            subject_text = (book.subject or "").lower()
            medium_text = (book.medium or "").lower()
            title_text = (book.title or "").lower()
            chapter_text = (chunk.chapter_title or "").lower()
            section_text = (chunk.section_title or "").lower()
            content_text = (chunk.content or "").lower()

            if normalized_subject and normalized_subject.lower() in subject_text:
                score += 3.0
            if inferred_subject and inferred_subject.lower() in subject_text:
                score += 2.5
            if normalized_medium and normalized_medium.lower() in medium_text:
                score += 2.0
            if request.standard is not None and book.standard == request.standard:
                score += 2.0

            if default_mvp_query:
                if medium_text == MVP_PREFERRED_MEDIUM.lower():
                    score += 3.0
                else:
                    score -= 2.0

                normalized_book_subject = subject_text.strip().lower()
                if normalized_book_subject in MVP_PREFERRED_SUBJECTS:
                    score += 2.5

                if any(marker in normalized_book_subject for marker in NOISY_SUBJECT_MARKERS):
                    score -= 2.0

            for token in tokens:
                if token in title_text:
                    score += 1.5
                if token in chapter_text:
                    score += 1.5
                if token in section_text:
                    score += 1.0
                if token in content_text:
                    score += 0.3
            if default_mvp_query and medium_text != MVP_PREFERRED_MEDIUM.lower() and score < 6:
                continue
            if score <= 0:
                continue
            scored_results.append(
                (
                    score,
                    TextbookSearchResult(textbook=book, chunk=chunk, score=round(score, 2)),
                )
            )

        scored_results.sort(
            key=lambda item: (
                -item[0],
                item[1].textbook.standard,
                item[1].textbook.subject,
                item[1].chunk.chunk_index,
            )
        )
        deduped_results: list[TextbookSearchResult] = []
        seen_keys: set[tuple[str, int]] = set()
        for _, result in scored_results:
            key = (result.textbook.id, result.chunk.chunk_index)
            if key in seen_keys:
                continue
            seen_keys.add(key)
            deduped_results.append(result)
            if len(deduped_results) >= request.limit:
                break

        return TextbookSearchResponse(results=deduped_results, total=len(deduped_results))

    def teacher_assist(self, request: TeacherAssistantRequest) -> TeacherAssistantResponse:
        search_result = self.search(
            TextbookSearchRequest(
                query=request.query,
                standard=request.standard,
                medium=request.medium,
                subject=request.subject,
                limit=request.limit,
            )
        )

        citations = [
            Citation(
                textbook_id=result.textbook.id,
                textbook_title=result.textbook.title,
                standard=result.textbook.standard,
                medium=result.textbook.medium,
                subject=result.textbook.subject,
                chapter_title=result.chunk.chapter_title,
                section_title=result.chunk.section_title,
                page_start=result.chunk.page_start,
                page_end=result.chunk.page_end,
            )
            for result in search_result.results
        ]

        if not search_result.results:
            answer = (
                "I couldn't find matching textbook content yet. "
                "Try a more specific chapter, standard, or subject query."
            )
        else:
            top = search_result.results[: min(3, len(search_result.results))]
            bullet_points = []
            for item in top:
                label = (
                    f"Std {item.textbook.standard} {item.textbook.medium} {item.textbook.subject}"
                )
                if item.chunk.chapter_title:
                    label += f" / {item.chunk.chapter_title}"
                snippet = item.chunk.content.strip().replace("\n", " ")
                snippet = " ".join(snippet.split())[:280]
                bullet_points.append(f"- {label}: {snippet}")

            answer = (
                "Starter teacher-assistant response based on retrieved textbook content:\n"
                + "\n".join(bullet_points)
                + "\n\nNext step: replace this stub with LLM-based grounded generation."
            )

        return TeacherAssistantResponse(
            answer=answer,
            query_type=request.query_type,
            citations=citations,
            retrieved_chunks=search_result.total,
        )


def build_textbook_manifest(dataset_root: str, output_path: str) -> dict[str, Any]:
    root = Path(dataset_root)
    books: list[dict[str, Any]] = []

    for pdf_path in sorted(root.rglob("*.pdf")):
        rel = pdf_path.relative_to(root)
        parts = rel.parts
        if len(parts) < 4:
            continue

        standard_folder, medium, subject, filename = parts[0], parts[1], parts[2], parts[3]
        try:
            standard = int(standard_folder.split()[0])
        except Exception:
            continue

        term = Path(filename).stem
        title = f"{standard} Std {medium} {subject} {term}"

        books.append(
            {
                "standard": standard,
                "medium": medium,
                "subject": subject,
                "term": term,
                "title": title,
                "source_file": str(pdf_path),
            }
        )

    manifest = {
        "source": "Tamil Nadu official textbooks dataset",
        "dataset_root": str(root),
        "count": len(books),
        "books": books,
    }

    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return manifest
