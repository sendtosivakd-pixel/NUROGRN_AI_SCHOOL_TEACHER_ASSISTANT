from __future__ import annotations

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.textbook import TextbookChunk
from app.services.embedding_service import EmbeddingService

BATCH_SIZE = 50


def main() -> None:
    db = SessionLocal()
    embedding_service = EmbeddingService()

    if not embedding_service.is_configured:
        raise RuntimeError("OPENAI_API_KEY is required for embedding backfill")

    updated = 0
    try:
        while True:
            chunks = list(
                db.scalars(
                    select(TextbookChunk)
                    .where(TextbookChunk.embedding.is_(None))
                    .order_by(TextbookChunk.created_at.asc())
                    .limit(BATCH_SIZE)
                ).all()
            )
            if not chunks:
                break

            for chunk in chunks:
                embedding = embedding_service.embed_text(chunk.content)
                if embedding is None:
                    continue
                chunk.embedding = embedding
                chunk.embedding_model = embedding_service.model
                updated += 1

            db.commit()
            print({"updated": updated})
    finally:
        db.close()


if __name__ == "__main__":
    main()
