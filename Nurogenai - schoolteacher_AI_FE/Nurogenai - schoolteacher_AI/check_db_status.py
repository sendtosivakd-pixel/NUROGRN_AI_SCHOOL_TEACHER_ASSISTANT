import sys
from pathlib import Path

# Setup project root for imports
CURRENT_DIR = Path(__file__).resolve().parent
API_ROOT = CURRENT_DIR / "services" / "api"
sys.path.insert(0, str(API_ROOT))

# Test imports
try:
    from app.db.session import SessionLocal
    from app.models.textbook import Textbook
except ImportError as e:
    print(f"FAILED TO IMPORT: {e}")
    sys.exit(1)

def check_db():
    try:
        with SessionLocal() as db:
            from sqlalchemy import select, func
            count = db.scalar(select(func.count()).select_from(Textbook))
            print(f"DATABASE_STATUS: {count} textbooks found.")
            
            if count > 0:
                books = db.scalars(select(Textbook)).all()
                for book in books:
                    print(f"BOOK: {book.title} (ID: {book.id})")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    check_db()
