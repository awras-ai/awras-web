"""Chainlit configuration utilities."""

from typing import Optional, Any
import chainlit as cl


def get_current_user() -> Optional[cl.User]:
    """
    Get the currently authenticated user from the session.

    Returns:
        Optional[cl.User]: The authenticated user, or None if not authenticated
    """
    return cl.user_session.get("user")


def get_user_id() -> Optional[str]:
    """
    Get the current user's identifier.

    Returns:
        Optional[str]: User identifier (username), or None if not authenticated
    """
    user = get_current_user()
    return user.identifier if user else None


def get_user_email() -> Optional[str]:
    """
    Get the current user's email address.

    Returns:
        Optional[str]: User email, or None if not authenticated
    """
    user = get_current_user()
    if user and user.metadata:
        return user.metadata.get("email")
    return None


def require_auth() -> cl.User:
    """
    Get the current user or raise an exception if not authenticated.

    Returns:
        cl.User: The authenticated user

    Raises:
        RuntimeError: If no user is authenticated
    """
    user = get_current_user()
    if not user:
        raise RuntimeError("Authentication required")
    return user
