from __future__ import annotations

import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.db.session import SessionLocal
from app.services.textbook_ingestion_service import ingest_textbooks_from_manifest


if __name__ == "__main__":
    manifest_path = "data/textbooks/manifest.json"
    with SessionLocal() as db:
        stats = ingest_textbooks_from_manifest(db=db, manifest_path=manifest_path)
    print(stats)
