"""
Pydantic schemas for email subscription.
"""
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class EmailSubscriptionCreate(BaseModel):
    """Schema for creating an email subscription."""
    email: EmailStr = Field(..., description="Email address to subscribe")
    source: Optional[str] = Field(default="waitlist", description="Source of subscription")


class EmailSubscriptionResponse(BaseModel):
    """Schema for email subscription response."""
    id: int
    email: str
    subscribed_at: datetime
    is_active: bool
    source: str
    
    class Config:
        from_attributes = True


class EmailSubscriptionList(BaseModel):
    """Schema for listing email subscriptions."""
    total: int
    subscriptions: list[EmailSubscriptionResponse]


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str
    success: bool = True
