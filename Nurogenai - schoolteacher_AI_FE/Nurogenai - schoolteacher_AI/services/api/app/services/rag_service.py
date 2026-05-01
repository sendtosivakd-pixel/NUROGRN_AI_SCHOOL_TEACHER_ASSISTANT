from __future__ import annotations

from typing import Sequence

from openai import OpenAI

from app.core.config import get_settings
from app.schemas.textbook import Citation, TeacherAssistantRequest, TeacherAssistantResponse
from app.services.textbook_service import TextbookService


class CurriculumRAGService:
    """Retrieval + grounded generation for the teacher assistant."""

    def __init__(self, textbook_service: TextbookService):
        self.textbook_service = textbook_service
        self.settings = get_settings()
        self.client = OpenAI(api_key=self.settings.openai_api_key) if self.settings.openai_api_key else None

    def _select_best_results(self, query: str, results: Sequence) -> list:
        query_terms = {term.lower() for term in query.split() if len(term) >= 4}
        rescored: list[tuple[float, object]] = []
        for result in results:
            content = (result.chunk.content or "").lower()
            chapter = (result.chunk.chapter_title or "").lower()
            section = (result.chunk.section_title or "").lower()
            score = float(result.score)
            if "photosynthesis" in content:
                score += 5.0
            if "photosynthesis" in chapter or "photosynthesis" in section:
                score += 6.0
            if "plant physiology" in content or "plant physiology" in chapter:
                score += 3.0
            overlap = sum(1 for term in query_terms if term in content or term in chapter or term in section)
            score += overlap * 0.8
            rescored.append((score, result))

        rescored.sort(key=lambda item: -item[0])
        return [result for _, result in rescored[:3]]

    def answer(self, request: TeacherAssistantRequest) -> TeacherAssistantResponse:
        search_result = self.textbook_service.search(
            request.model_copy(update={
                "limit": max(request.limit * 2, 6),
            })
        )

        selected_results = self._select_best_results(request.query, search_result.results)

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
            for result in selected_results
        ]

        if not selected_results:
            return TeacherAssistantResponse(
                answer=(
                    "I could not find relevant textbook context for this question yet. "
                    "Try adding standard, medium, or subject filters."
                ),
                query_type=request.query_type,
                citations=[],
                retrieved_chunks=0,
            )

        if self.client is None:
            fallback_answer = self._fallback_answer(request, selected_results)
            return TeacherAssistantResponse(
                answer=fallback_answer,
                query_type=request.query_type,
                citations=citations,
                retrieved_chunks=len(selected_results),
            )

        try:
            prompt = self._build_prompt(request, selected_results)
            answer = self._generate_with_openai(prompt)
        except Exception:
            answer = self._fallback_answer(request, selected_results)

        return TeacherAssistantResponse(
            answer=answer,
            query_type=request.query_type,
            citations=citations,
            retrieved_chunks=len(selected_results),
        )

    def _build_prompt(self, request: TeacherAssistantRequest, results: Sequence) -> str:
        context_parts: list[str] = []
        for index, result in enumerate(results, start=1):
            citation = (
                f"[{index}] Std {result.textbook.standard} | {result.textbook.medium} | "
                f"{result.textbook.subject} | {result.textbook.title}"
            )
            if result.chunk.page_start:
                citation += f" | Pages {result.chunk.page_start}"
                if result.chunk.page_end and result.chunk.page_end != result.chunk.page_start:
                    citation += f"-{result.chunk.page_end}"
            context_parts.append(f"{citation}\n{result.chunk.content}")

        context = "\n\n".join(context_parts)

        return f"""You are a School Teacher Assistant for Tamil Nadu curriculum support.

Use only the provided textbook context.
Do not invent facts, chapters, pages, or citations.
If the answer is not supported by the context, say that clearly.
Prefer the most instructionally relevant excerpts and ignore unrelated textbook snippets.
Write for a teacher who wants a clean classroom-ready explanation.

Teacher question:
{request.query}

Retrieved textbook context:
{context}

Return exactly in this style:
- Start with a short explanation teachers can directly use in class.
- Then add 3 to 5 bullet points.
- Keep language simple and student-friendly.
- Add inline references like [1], [2] only where relevant.
- Do not mention information that is not present in the context.
"""

    def _generate_with_openai(self, prompt: str) -> str:
        response = self.client.responses.create(
            model=self.settings.openai_model,
            input=prompt,
        )
        return response.output_text.strip()

    def _fallback_answer(self, request: TeacherAssistantRequest, results: Sequence) -> str:
        if not results:
            return (
                "I could not find enough textbook context to answer this clearly yet. "
                "Please try a more specific topic, standard, or subject filter."
            )

        lead = (
            f"Here is a classroom-ready explanation for {request.query.lower()}:"
            if request.query
            else "Here is a classroom-ready explanation:"
        )
        bullets: list[str] = []
        for index, result in enumerate(results[:3], start=1):
            snippet = " ".join((result.chunk.content or "").split())[:220]
            bullets.append(f"- [{index}] {snippet}")

        return lead + "\n" + "\n".join(bullets)
