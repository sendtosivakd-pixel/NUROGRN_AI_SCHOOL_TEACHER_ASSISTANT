# Student Analytics API

FastAPI backend for auth, profile, subjects, exams, analytics, reports, and CSV import.

## Milestone 1 starter additions

This repo now includes starter backend scaffolding for a textbook-driven School Teacher App direction:

- `app/models/textbook.py` — textbook + chunk models
- `app/schemas/textbook.py` — API schemas for textbook search and teacher assistant
- `app/services/textbook_service.py` — textbook listing, keyword search, manifest builder, assistant stub
- `app/services/rag_service.py` — curriculum RAG starter orchestration
- `app/services/teacher_tools_service.py` — teacher tools service wrapper
- `app/api/textbooks.py` — textbook endpoints
- `app/api/teacher_tools.py` — teacher assistant endpoint
- `scripts/build_textbook_manifest.py` — builds a canonical manifest from the Tamil Nadu PDF dataset

### Important notes

These files are scaffolding only.

They do **not** yet include:
- alembic migrations for the new textbook tables
- PDF text extraction + chunk persistence into the database
- embeddings / pgvector / hybrid semantic retrieval
- grounded LLM answer generation

### Next commands

Build manifest:

```bash
uv run --project services/api python services/api/scripts/build_textbook_manifest.py
```

Then implement:
1. migration for `textbooks` and `textbook_chunks`
2. ingestion pipeline to populate rows from PDFs
3. better retrieval and citations
4. teacher assistant frontend
