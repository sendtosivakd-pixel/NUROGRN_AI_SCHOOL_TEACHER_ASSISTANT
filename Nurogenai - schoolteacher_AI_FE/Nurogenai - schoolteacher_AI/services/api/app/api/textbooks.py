from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.textbook import TextbookResponse, TextbookSearchRequest, TextbookSearchResponse
from app.services.textbook_service import TextbookService

router = APIRouter(prefix="/textbooks", tags=["textbooks"])


@router.get("", response_model=list[TextbookResponse])
def list_textbooks(
    standard: int | None = None,
    medium: str | None = None,
    subject: str | None = None,
    db: Session = Depends(get_db),
) -> list[TextbookResponse]:
    service = TextbookService(db)
    return service.list_textbooks(standard=standard, medium=medium, subject=subject)


@router.post("/search", response_model=TextbookSearchResponse)
def search_textbooks(
    payload: TextbookSearchRequest,
    db: Session = Depends(get_db),
) -> TextbookSearchResponse:
    service = TextbookService(db)
    return service.search(payload)
