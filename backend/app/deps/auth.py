"""
Dependency utilities for authentication and session management.

This module provides reusable FastAPI dependencies for:
- Session cookie management
- OAuth state cookie management
- Current user resolution
- Auth/superuser guards
- User model → response schema conversion
"""

from typing import Optional

from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import UserResponse
from app.services.auth import AuthService
from app.services.object_storage import storage_service

settings = get_settings()
GOOGLE_STATE_COOKIE_NAME = "google_oauth_state"


class SessionCookieManager:
    """Manage session cookies on responses."""

    @staticmethod
    def set(response: Response, token: str) -> None:
        """Set the session cookie on the response."""
        response.set_cookie(
            key=settings.SESSION_COOKIE_NAME,
            value=token,
            httponly=settings.SESSION_COOKIE_HTTPONLY,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite=settings.SESSION_COOKIE_SAMESITE,
            domain=settings.SESSION_COOKIE_DOMAIN,
            max_age=settings.SESSION_EXPIRE_DAYS * 24 * 60 * 60,
            path="/",
        )

    @staticmethod
    def clear(response: Response) -> None:
        """Clear the session cookie."""
        response.delete_cookie(
            key=settings.SESSION_COOKIE_NAME,
            httponly=settings.SESSION_COOKIE_HTTPONLY,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite=settings.SESSION_COOKIE_SAMESITE,
            domain=settings.SESSION_COOKIE_DOMAIN,
            path="/",
        )


class OAuthStateCookieManager:
    """Manage OAuth state cookies for CSRF protection."""

    @staticmethod
    def set(response: Response, state: str) -> None:
        """Set the OAuth state cookie on the response."""
        response.set_cookie(
            key=GOOGLE_STATE_COOKIE_NAME,
            value=state,
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite=settings.SESSION_COOKIE_SAMESITE,
            domain=settings.SESSION_COOKIE_DOMAIN,
            max_age=600,
            path="/",
        )

    @staticmethod
    def clear(response: Response) -> None:
        """Clear the OAuth state cookie."""
        response.delete_cookie(
            key=GOOGLE_STATE_COOKIE_NAME,
            httponly=True,
            secure=settings.SESSION_COOKIE_SECURE,
            samesite=settings.SESSION_COOKIE_SAMESITE,
            domain=settings.SESSION_COOKIE_DOMAIN,
            path="/",
        )


def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP from request, handling proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def get_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user from session cookie. Returns None if not authenticated."""
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        return None
    return AuthService.get_user_from_session_token(db, token)


def require_auth(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency that requires authentication. Raises 401 if not authenticated."""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user


def require_superuser(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency that requires superuser (admin) access. Raises 401 if not authenticated, 403 if not a superuser."""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superuser access required",
        )
    return user


require_admin_auth = require_superuser


def user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse schema."""
    profile_image_url = None
    if user.profile_image_path:
        profile_image_url = storage_service.get_presigned_url(user.profile_image_path)
    elif user.oauth_profile_picture_url:
        profile_image_url = user.oauth_profile_picture_url

    return UserResponse(
        id=user.id,
        identifier=user.identifier,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_verified=user.is_verified,
        profile_image_url=profile_image_url,
        created_at=user.created_at,
    )
