from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.textbook import Textbook, TextbookChunk


def _sanitize_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = "".join(ch for ch in text if ch in {"\n", "\t", "\r"} or ord(ch) >= 32)
    return text


def _extract_page_text_with_pymupdf(pdf_path: Path, page_number: int) -> str:
    try:
        import fitz  # type: ignore
    except Exception as exc:
        raise RuntimeError(f"PyMuPDF not available: {exc}") from exc

    doc = fitz.open(pdf_path)
    try:
        page = doc.load_page(page_number - 1)
        return _sanitize_text(page.get_text("text") or "")
    finally:
        doc.close()


def _extract_page_text_with_pypdf(page: Any) -> str:
    return _sanitize_text(page.extract_text() or "")


def _extract_page_text_with_ocr(pdf_path: Path, page_number: int) -> str:
    try:
        import fitz  # type: ignore
        import pytesseract  # type: ignore
    except Exception as exc:
        raise RuntimeError(f"OCR dependencies not available: {exc}") from exc

    doc = fitz.open(pdf_path)
    try:
        page = doc.load_page(page_number - 1)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
        image_bytes = pix.tobytes("png")
    finally:
        doc.close()

    try:
        from PIL import Image  # type: ignore
        import io
    except Exception as exc:
        raise RuntimeError(f"Pillow not available for OCR: {exc}") from exc

    image = Image.open(io.BytesIO(image_bytes))
    text = pytesseract.image_to_string(image)
    return _sanitize_text(text or "")


def extract_pdf_text(pdf_path: Path) -> tuple[list[dict[str, Any]], int]:
    """Extract text per page with layered fallbacks.

    Order:
    1. PyMuPDF (primary)
    2. pypdf (page fallback)
    3. OCR via PyMuPDF render + pytesseract (last resort)

    Returns: (pages, failed_pages_count)
    """
    try:
        import fitz  # type: ignore
    except Exception as exc:
        raise RuntimeError(f"PyMuPDF not available: {exc}") from exc

    pypdf_reader = None
    try:
        from pypdf import PdfReader  # type: ignore

        pypdf_reader = PdfReader(str(pdf_path))
    except Exception as exc:
        print(f"WARN pypdf reader unavailable: file={pdf_path} error={exc}")

    doc = fitz.open(pdf_path)
    try:
        pages: list[dict[str, Any]] = []
        failed_pages = 0
        for index in range(len(doc)):
            page_number = index + 1
            text = ""
            parser_used = "PyMuPDF"

            try:
                page = doc.load_page(index)
                text = page.get_text("text") or ""
            except Exception as exc:
                print(f"WARN page extract failed: file={pdf_path} page={page_number} parser=PyMuPDF error={exc}")
                if pypdf_reader is not None:
                    try:
                        text = _extract_page_text_with_pypdf(pypdf_reader.pages[index])
                        parser_used = "pypdf"
                        print(f"INFO page fallback succeeded: file={pdf_path} page={page_number} parser=pypdf")
                    except Exception as fallback_exc:
                        print(f"WARN page fallback failed: file={pdf_path} page={page_number} parser=pypdf error={fallback_exc}")
                if not text.strip():
                    try:
                        text = _extract_page_text_with_ocr(pdf_path, page_number)
                        parser_used = "OCR"
                        print(f"INFO page OCR fallback succeeded: file={pdf_path} page={page_number} parser=OCR")
                    except Exception as ocr_exc:
                        failed_pages += 1
                        print(f"WARN page OCR fallback failed: file={pdf_path} page={page_number} parser=OCR error={ocr_exc}")
                        continue

            text = _sanitize_text("\n".join(line.strip() for line in text.splitlines() if line.strip()))
            pages.append(
                {
                    "page_number": page_number,
                    "text": text,
                    "parser": parser_used,
                }
            )
        return pages, failed_pages
    finally:
        doc.close()


def chunk_page_text(text: str, page_number: int, chunk_size: int = 1400, overlap: int = 200) -> list[dict[str, Any]]:
    if not text.strip():
        return []

    chunks: list[dict[str, Any]] = []
    start = 0
    chunk_index = 0
    normalized = _sanitize_text(" ".join(text.split()))

    while start < len(normalized):
        end = min(start + chunk_size, len(normalized))
        if end < len(normalized):
            breakpoint = normalized.rfind(". ", start, end)
            if breakpoint > start + 300:
                end = breakpoint + 1
        content = normalized[start:end].strip()
        if content:
            chunks.append(
                {
                    "chunk_index": chunk_index,
                    "page_start": page_number,
                    "page_end": page_number,
                    "content": content,
                }
            )
        if end >= len(normalized):
            break
        start = max(end - overlap, 0)
        chunk_index += 1

    return chunks


def ingest_textbooks_from_manifest(db: Session, manifest_path: str) -> dict[str, int]:
    manifest = json.loads(Path(manifest_path).read_text(encoding="utf-8"))

    textbooks_created = 0
    textbooks_skipped = 0
    textbooks_failed = 0
    chunks_created = 0
    pages_failed = 0

    for book in manifest.get("books", []):
        source_file = book["source_file"]
        existing = db.scalar(select(Textbook).where(Textbook.source_file == source_file))
        if existing is not None:
            textbooks_skipped += 1
            continue

        textbook = Textbook(
            standard=book["standard"],
            medium=book["medium"],
            subject=book["subject"],
            term=book["term"],
            title=book["title"],
            source_file=source_file,
            source_url=book.get("source_url"),
        )
        db.add(textbook)
        db.flush()

        pdf_path = Path(source_file)
        try:
            pages, failed_page_count = extract_pdf_text(pdf_path)
            pages_failed += failed_page_count
        except Exception as exc:
            db.rollback()
            textbooks_failed += 1
            print(f"WARN textbook failed: file={pdf_path} error={exc}")
            continue

        total_chunk_index = 0
        for page in pages:
            page_chunks = chunk_page_text(page["text"], page_number=page["page_number"])
            for item in page_chunks:
                db.add(
                    TextbookChunk(
                        textbook_id=textbook.id,
                        chapter_title=None,
                        section_title=None,
                        page_start=item["page_start"],
                        page_end=item["page_end"],
                        chunk_index=total_chunk_index,
                        content=item["content"],
                    )
                )
                total_chunk_index += 1
                chunks_created += 1

        textbooks_created += 1
        db.commit()

    return {
        "textbooks_created": textbooks_created,
        "textbooks_skipped": textbooks_skipped,
        "textbooks_failed": textbooks_failed,
        "chunks_created": chunks_created,
        "pages_failed": pages_failed,
    }
