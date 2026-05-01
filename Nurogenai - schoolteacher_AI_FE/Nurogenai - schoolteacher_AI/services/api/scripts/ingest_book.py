from __future__ import annotations

import argparse
import sys
from pathlib import Path

# Add the project root to sys.path for absolute imports
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Ensure we can import from app
from app.db.session import SessionLocal
from app.models.textbook import Textbook, TextbookChunk
from app.services.textbook_ingestion_service import extract_pdf_text, chunk_page_text


def ingest_single_book(
    file_path: str, standard: int, medium: str, subject: str, term: str, title: str | None = None
):
    pdf_path = Path(file_path)
    if not pdf_path.exists():
        print(f"ERROR: File not found at {file_path}")
        sys.exit(1)

    if title is None:
        title = f"{standard} Std {medium} {subject} {term}"

    print(f"Starting ingestion for: {title}")
    print(f"File: {pdf_path.absolute()}")

    with SessionLocal() as db:
        # 1. Create the Textbook record
        textbook = Textbook(
            standard=standard,
            medium=medium,
            subject=subject,
            term=term,
            title=title,
            source_file=str(pdf_path.absolute()),
            source_url=None,
        )
        db.add(textbook)
        db.flush()  # Get the ID

        # 2. Extract text from PDF
        print("Extracting text from PDF (this may take a moment)...")
        try:
            pages, failed_pages_count = extract_pdf_text(pdf_path)
        except Exception as e:
            print(f"ERROR during PDF extraction: {e}")
            db.rollback()
            sys.exit(1)

        # 3. Chunk and create TextbookChunk records
        print(f"Processing {len(pages)} pages into chunks...")
        total_chunks = 0
        for page in pages:
            page_chunks = chunk_page_text(page["text"], page_number=page["page_number"])
            for item in page_chunks:
                db.add(
                    TextbookChunk(
                        textbook_id=textbook.id,
                        page_start=item["page_start"],
                        page_end=item["page_end"],
                        chunk_index=total_chunks,
                        content=item["content"],
                    )
                )
                total_chunks += 1

        # 4. Finalize
        db.commit()
        print("-" * 30)
        print(f"SUCCESS: Ingestion complete!")
        print(f"Textbook ID: {textbook.id}")
        print(f"Chunks created: {total_chunks}")
        if failed_pages_count > 0:
            print(f"WARNING: {failed_pages_count} pages failed extraction.")
        print("-" * 30)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest a single PDF textbook into the database.")
    parser.add_argument("--file", required=True, help="Path to the PDF file")
    parser.add_argument("--standard", type=int, required=True, help="Standard/Grade (e.g., 1)")
    parser.add_argument("--subject", required=True, help="Subject (e.g., English)")
    parser.add_argument("--medium", default="English", help="Medium (default: English)")
    parser.add_argument("--term", default="I", help="Term (e.g., I, II, III)")
    parser.add_argument("--title", help="Optional custom title")

    args = parser.parse_args()

    try:
        ingest_single_book(
            file_path=args.file,
            standard=args.standard,
            medium=args.medium,
            subject=args.subject,
            term=args.term,
            title=args.title,
        )
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        sys.exit(1)
