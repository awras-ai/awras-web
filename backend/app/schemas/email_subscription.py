"""
Pydantic schemas for email subscription.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class EmailSubscriptionCreate(BaseModel):
    """Schema for creating an email subscription."""

    email: EmailStr = Field(..., description="Email address to subscribe")
    source: Optional[str] = Field(
        default="waitlist", description="Source of subscription"
    )


class EmailSubscriptionResponse(BaseModel):
    """Schema for email subscription response."""

    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    email: Optional[str] = Field(
        None, description="The email address (only if success=True)"
    )


class SubscriptionCountResponse(BaseModel):
    """Schema for subscription count response."""

    count: int = Field(..., description="Total number of registered emails")
