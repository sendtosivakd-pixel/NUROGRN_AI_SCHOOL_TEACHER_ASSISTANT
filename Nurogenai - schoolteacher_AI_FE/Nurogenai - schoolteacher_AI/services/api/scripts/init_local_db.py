import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.db.session import engine, init_db
from app.models.base import Base

def run_init():
    print(f"Initializing database at: {engine.url}")
    try:
        init_db()
        print("Successfully created all tables.")
    except Exception as e:
        print(f"Error creating tables: {e}")

if __name__ == "__main__":
    run_init()
