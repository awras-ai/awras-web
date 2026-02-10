"""
Models module.

This module exports all SQLAlchemy models for the application.
Models are organized into:
- user.py: User authentication (User, Session)
- chainlit.py: Chainlit data layer (Thread, Step, Element, Feedback)
- email_subscription.py: Email subscriptions
"""

from app.models.email_subscription import EmailSubscription
from app.models.user import User, Session
from app.models.chainlit import Thread, Step, Element, Feedback

__all__ = [
    # Auth models
    "User",
    "Session",
    # Chainlit data layer models
    "Thread",
    "Step",
    "Element",
    "Feedback",
    # Other models
    "EmailSubscription",
]
