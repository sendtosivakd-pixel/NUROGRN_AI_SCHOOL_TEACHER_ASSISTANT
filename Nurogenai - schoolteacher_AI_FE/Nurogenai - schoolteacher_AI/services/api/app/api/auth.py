from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.security import clear_auth_cookie, create_access_token, set_auth_cookie
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    GoogleExchangeRequest,
    LoginRequest,
    SignupRequest,
)
from app.services.auth_service import (
    authenticate_user,
    create_student_user,
    find_or_create_google_user,
    serialize_auth_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: SignupRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    user = create_student_user(db, payload.name, payload.email, payload.password)
    token = create_access_token(user.id, user.role)
    set_auth_cookie(response, token)
    return {"user": serialize_auth_user(user)}


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    user = authenticate_user(db, payload.email, payload.password)
    token = create_access_token(user.id, user.role)
    set_auth_cookie(response, token)
    return {"user": serialize_auth_user(user)}


@router.post("/google/exchange", response_model=AuthResponse)
def google_exchange(
    payload: GoogleExchangeRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> dict:
    user = find_or_create_google_user(db, payload.credential)
    token = create_access_token(user.id, user.role)
    set_auth_cookie(response, token)
    return {"user": serialize_auth_user(user)}


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> Response:
    clear_auth_cookie(response)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=AuthResponse)
def me(current_user: User = Depends(get_current_user)) -> dict:
    return {"user": serialize_auth_user(current_user)}
