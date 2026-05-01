from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.textbook import TeacherAssistantRequest, TeacherAssistantResponse
from app.services.teacher_tools_service import TeacherToolsService

router = APIRouter(prefix="/teacher-tools", tags=["teacher-tools"])


@router.post("/ask", response_model=TeacherAssistantResponse)
def ask_teacher_assistant(
    payload: TeacherAssistantRequest,
    db: Session = Depends(get_db),
) -> TeacherAssistantResponse:
    service = TeacherToolsService(db)
    return service.ask(payload)
