"""Chainlit header authentication using session cookies."""

from typing import Optional

import chainlit as cl
from app.core.config import get_settings
from app.services.auth import AuthService
from app.db.database import SessionLocal


def header_auth_callback(headers: dict) -> Optional[cl.User]:
    """
    Chainlit header authentication callback.

    This function is called on every request to validate the session cookie.
    It extracts the session token from the Cookie header and validates it
    against the database.

    Args:
        headers: Dictionary of HTTP headers

    Returns:
        Optional[cl.User]: Chainlit User object if session is valid, None otherwise
    """
    try:
        settings = get_settings()
        cookie_name = settings.SESSION_COOKIE_NAME

        # Get Cookie header
        cookie_header = headers.get("cookie", "")
        if not cookie_header:
            return None

        # Parse cookies
        cookies = {}
        for cookie in cookie_header.split(";"):
            if "=" in cookie:
                name, value = cookie.strip().split("=", 1)
                cookies[name] = value

        # Get session token
        session_token = cookies.get(cookie_name)
        if not session_token:
            return None

        # Validate session using AuthService
        db = SessionLocal()
        try:
            user = AuthService.get_user_from_session_token(db, session_token)

            if not user:
                return None

            # Create Chainlit user object
            cl_user = cl.User(
                identifier=str(user.identifier),
                metadata={
                    "email": str(user.email),
                    "first_name": user.first_name or "",
                    "last_name": user.last_name or "",
                    "display_name": user.display_name,
                    "is_superuser": bool(user.is_superuser),
                    "is_verified": bool(user.is_verified),
                },
            )

            return cl_user
        finally:
            db.close()

    except Exception as e:
        print(f"Header authentication error: {e}")
        import traceback

        traceback.print_exc()
        return None
