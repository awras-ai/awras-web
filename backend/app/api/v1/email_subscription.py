"""
Email subscription API endpoints.
"""

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.email_subscription import (
    EmailSubscriptionCreate,
    EmailSubscriptionResponse,
    EmailSubscriptionList,
    MessageResponse,
)
from app.services.email_subscription import EmailSubscriptionService

router = APIRouter(prefix="/emails", tags=["Email Subscriptions"])


@router.post(
    "/subscribe",
    response_model=MessageResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Subscribe to waitlist",
)
async def subscribe_email(
    subscription: EmailSubscriptionCreate, db: Session = Depends(get_db)
) -> MessageResponse:
    """
    Subscribe an email to the waitlist.

    - **email**: Valid email address
    - **source**: Source of subscription (default: waitlist)
    """
    EmailSubscriptionService.create_subscription(db, subscription)
    return MessageResponse(
        message="Successfully subscribed to the waitlist!", success=True
    )


@router.get(
    "/subscriptions",
    response_model=EmailSubscriptionList,
    summary="Get all subscriptions",
)
async def get_subscriptions(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum records to return"),
    active_only: bool = Query(True, description="Filter active subscriptions only"),
    db: Session = Depends(get_db),
) -> EmailSubscriptionList:
    """
    Get all email subscriptions with pagination.
    """
    subscriptions, total = EmailSubscriptionService.get_all_subscriptions(
        db, skip=skip, limit=limit, active_only=active_only
    )
    return EmailSubscriptionList(total=total, subscriptions=subscriptions)


@router.get(
    "/subscriptions/{email}",
    response_model=EmailSubscriptionResponse,
    summary="Get subscription by email",
)
async def get_subscription(
    email: str, db: Session = Depends(get_db)
) -> EmailSubscriptionResponse:
    """Get a specific email subscription."""
    subscription = EmailSubscriptionService.get_subscription_by_email(db, email)
    if not subscription:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Email not found"
        )
    return subscription


@router.delete(
    "/subscriptions/{subscription_id}",
    response_model=MessageResponse,
    summary="Unsubscribe email",
)
async def unsubscribe_email(
    subscription_id: int, db: Session = Depends(get_db)
) -> MessageResponse:
    """
    Unsubscribe an email (soft delete).
    """
    deleted = EmailSubscriptionService.delete_subscription(db, subscription_id)
    if not deleted:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found"
        )
    return MessageResponse(message="Successfully unsubscribed", success=True)
