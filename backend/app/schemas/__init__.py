"""Schemas module."""

from app.schemas.auth import (
    AuthResponse,
    MessageResponse,
    ResendVerification,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.schemas.email_subscription import (
    EmailSubscriptionCreate,
    EmailSubscriptionResponse,
    SubscriptionCountResponse,
)

__all__ = [
    # Auth schemas
    "AuthResponse",
    "MessageResponse",
    "ResendVerification",
    "UserLogin",
    "UserRegister",
    "UserResponse",
    # Email subscription schemas
    "EmailSubscriptionCreate",
    "EmailSubscriptionResponse",
    "SubscriptionCountResponse",
]
