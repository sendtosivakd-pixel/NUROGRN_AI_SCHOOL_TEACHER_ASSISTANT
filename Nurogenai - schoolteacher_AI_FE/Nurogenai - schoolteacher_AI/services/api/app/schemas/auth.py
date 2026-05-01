from pydantic import EmailStr, Field

from app.models.enums import AuthProvider, UserRole
from app.schemas.base import CamelModel


class SignupRequest(CamelModel):
    name: str = Field(min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(CamelModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class GoogleExchangeRequest(CamelModel):
    credential: str = Field(min_length=10)


class AuthUserResponse(CamelModel):
    id: str
    email: EmailStr
    name: str
    role: UserRole
    provider: AuthProvider
    profile_completed: bool


class AuthResponse(CamelModel):
    user: AuthUserResponse
