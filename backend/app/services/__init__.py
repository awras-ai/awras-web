"""Services module."""

from app.services.auth import AuthService
from app.services.email import EmailService
from app.services.email_subscription import EmailSubscriptionService
from app.services.dictionary import DictionaryService

__all__ = [
    "AuthService",
    "EmailService",
    "EmailSubscriptionService",
    "DictionaryService",
]
