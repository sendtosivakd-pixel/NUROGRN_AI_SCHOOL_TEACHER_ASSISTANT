import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.db.session import SessionLocal
from app.services.auth_service import create_student_user
from app.models.user import User
from sqlalchemy import select

def create_admin():
    email = "test@example.com"
    name = "Test Teacher"
    password = "password123"
    
    with SessionLocal() as db:
        # Check if user already exists
        existing = db.scalar(select(User).where(User.email == email))
        if existing:
            print(f"User {email} already exists!")
            return

        try:
            user = create_student_user(db, name, email, password)
            # You might want to override role to 'teacher' or 'admin' 
            # depending on your needs. For now, default student role works for basic login.
            db.commit()
            print(f"Successfully created test user!")
            print(f"Email: {email}")
            print(f"Password: {password}")
        except Exception as e:
            print(f"Error creating user: {e}")

if __name__ == "__main__":
    create_admin()
