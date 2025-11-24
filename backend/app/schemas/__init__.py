"""Schemas module."""

from app.schemas.email_subscription import (
    EmailSubscriptionCreate,
    EmailSubscriptionResponse,
    SubscriptionCountResponse,
)

__all__ = [
    "EmailSubscriptionCreate",
    "EmailSubscriptionResponse",
    "SubscriptionCountResponse",
]
