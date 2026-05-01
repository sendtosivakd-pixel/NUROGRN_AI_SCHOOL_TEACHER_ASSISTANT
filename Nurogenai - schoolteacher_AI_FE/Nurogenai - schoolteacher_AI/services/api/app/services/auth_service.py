from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password, verify_password
from app.models.enums import AuthProvider, UserRole
from app.models.student_profile import StudentProfile
from app.models.user import User


def is_profile_completed(profile: StudentProfile | None) -> bool:
    if profile is None:
        return False
    return bool(profile.full_name and profile.class_grade and profile.school_name)


def serialize_auth_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role,
        "provider": user.provider,
        "profile_completed": is_profile_completed(user.student_profile),
    }


def create_student_user(db: Session, name: str, email: str, password: str) -> User:
    existing_user = db.scalar(select(User).where(User.email == email.lower()))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists",
        )

    user = User(
        name=name.strip(),
        email=email.lower(),
        password_hash=hash_password(password),
        provider=AuthProvider.PASSWORD,
        role=UserRole.STUDENT,
    )
    user.student_profile = StudentProfile(
        full_name=name.strip(),
        class_grade="",
        school_name="",
        section=None,
        age=None,
        target_goal=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email.lower()))
    if user is None or user.password_hash is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    return user


def verify_google_credential(credential: str) -> dict[str, str]:
    settings = get_settings()
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google sign-in is not configured",
        )
    try:
        token_info = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except Exception as exc:  # pragma: no cover - external dependency branch
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google credential could not be verified",
        ) from exc

    email = token_info.get("email")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google account is missing an email address",
        )

    return {
        "email": email.lower(),
        "name": token_info.get("name") or email.split("@")[0],
    }


def find_or_create_google_user(db: Session, credential: str) -> User:
    profile = verify_google_credential(credential)
    user = db.scalar(select(User).where(User.email == profile["email"]))
    if user:
        if user.provider == AuthProvider.PASSWORD and not user.password_hash:
            user.provider = AuthProvider.GOOGLE
            db.commit()
            db.refresh(user)
        return user

    user = User(
        name=profile["name"],
        email=profile["email"],
        password_hash=None,
        provider=AuthProvider.GOOGLE,
        role=UserRole.STUDENT,
    )
    user.student_profile = StudentProfile(
        full_name=profile["name"],
        class_grade="",
        school_name="",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
