from __future__ import annotations

import sys
from pathlib import Path

CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.services.textbook_service import build_textbook_manifest


if __name__ == "__main__":
    dataset_root = "/Users/karthickrajan/.openclaw/workspace/ameer test folders"
    output_path = "/Users/karthickrajan/Desktop/Nurogenai - schoolteacher_AI/services/api/data/textbooks/manifest.json"
    manifest = build_textbook_manifest(dataset_root=dataset_root, output_path=output_path)
    print(f"Wrote manifest with {manifest['count']} books to {output_path}")
