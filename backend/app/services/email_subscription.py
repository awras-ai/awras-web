"""
Service layer for email subscription business logic.
"""

import logging
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.email_subscription import EmailSubscription
from app.schemas.email_subscription import (
    EmailSubscriptionCreate,
    EmailSubscriptionResponse,
    SubscriptionCountResponse,
)

logger = logging.getLogger(__name__)


class EmailSubscriptionService:
    """Service for handling email subscription operations."""

    @staticmethod
    def add_email(
        db: Session, subscription: EmailSubscriptionCreate
    ) -> EmailSubscriptionResponse:
        """
        Add an email to the waitlist.

        Args:
            db: Database session
            subscription: Email subscription data

        Returns:
            EmailSubscriptionResponse with success status and message
        """
        email_lower = subscription.email.lower()

        # Check if email already exists
        existing = (
            db.query(EmailSubscription)
            .filter(EmailSubscription.email == email_lower)
            .first()
        )

        if existing:
            logger.warning(f"Duplicate email subscription attempt: {email_lower}")
            return EmailSubscriptionResponse(
                success=False, message="Email already exists", email=None
            )

        # Create new subscription
        db_subscription = EmailSubscription(
            email=email_lower, source=subscription.source
        )

        try:
            db.add(db_subscription)
            db.commit()
            db.refresh(db_subscription)
            logger.info(f"Successfully added email to waitlist: {email_lower}")
            return EmailSubscriptionResponse(
                success=True,
                message="Successfully added to waitlist",
                email=db_subscription.email,
            )
        except IntegrityError:
            db.rollback()
            # Race condition - email was added between check and insert
            logger.warning(f"Duplicate email (race condition): {email_lower}")
            return EmailSubscriptionResponse(
                success=False, message="Email already exists", email=None
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Error adding email {email_lower}: {str(e)}")
            return EmailSubscriptionResponse(
                success=False, message=f"An error occurred: {str(e)}", email=None
            )

    @staticmethod
    def get_count(db: Session) -> SubscriptionCountResponse:
        """
        Get the total count of registered emails.

        Args:
            db: Database session

        Returns:
            SubscriptionCountResponse with the count
        """
        count = (
            db.query(EmailSubscription)
            .filter(EmailSubscription.is_active == True)
            .count()
        )

        return SubscriptionCountResponse(count=count)
