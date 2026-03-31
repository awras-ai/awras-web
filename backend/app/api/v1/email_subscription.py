"""
Email subscription API endpoints.
"""

from fastapi import APIRouter, Depends, status, Query, Response, Request
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.email_subscription import (
    EmailSubscriptionCreate,
    EmailSubscriptionResponse,
    SubscriptionCountResponse,
)
from app.services.email_subscription import EmailSubscriptionService
from app.core.limiter import limiter

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


@router.post(
    "/subscribe",
    response_model=EmailSubscriptionResponse,
    summary="Add email to waitlist",
    deprecated=True,
)
@limiter.limit("10/minute")
async def subscribe_email(
    request: Request,
    subscription: EmailSubscriptionCreate,
    response: Response,
    db: Session = Depends(get_db),
) -> EmailSubscriptionResponse:
    """
    Add an email to the waitlist.

    Returns:
    - **success**: True if added successfully, False if email already exists
    - **message**: Description of the result
    - **email**: The email address (only if success=True)

    Status codes:
    - 201: Email successfully added to waitlist
    - 409: Email already exists (conflict)
    """
    result = EmailSubscriptionService.add_email(db, subscription)

    # Set appropriate status code based on success
    if result.success:
        response.status_code = status.HTTP_201_CREATED
    else:
        response.status_code = status.HTTP_409_CONFLICT

    return result


@router.get(
    "/count",
    response_model=SubscriptionCountResponse,
    summary="Get waitlist count",
    deprecated=True,
)
@limiter.limit("30/minute")
async def get_waitlist_count(
    request: Request,
    db: Session = Depends(get_db),
) -> SubscriptionCountResponse:
    """
    Get the total count of emails registered in the waitlist.

    Returns:
    - **count**: Total number of registered emails
    """
    return EmailSubscriptionService.get_count(db)
