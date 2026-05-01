from __future__ import annotations

from sqlalchemy.orm import Session

from app.schemas.textbook import TeacherAssistantRequest, TeacherAssistantResponse
from app.services.rag_service import CurriculumRAGService
from app.services.textbook_service import TextbookService


class TeacherToolsService:
    def __init__(self, db: Session):
        self.textbook_service = TextbookService(db)
        self.rag_service = CurriculumRAGService(self.textbook_service)

    def ask(self, request: TeacherAssistantRequest) -> TeacherAssistantResponse:
        return self.rag_service.answer(request)
