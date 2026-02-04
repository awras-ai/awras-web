"""
Pydantic schemas for authentication.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


# =============================================================================
# REQUEST SCHEMAS
# =============================================================================


class UserRegister(BaseModel):
    """Schema for user registration."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(
        ..., min_length=8, description="Password (minimum 8 characters)"
    )
    identifier: str = Field(
        ...,
        min_length=3,
        max_length=50,
        description="Unique username/identifier",
    )
    first_name: Optional[str] = Field(None, max_length=255, description="First name")
    last_name: Optional[str] = Field(None, max_length=255, description="Last name")

    @field_validator("identifier")
    @classmethod
    def validate_identifier(cls, v: str) -> str:
        """Validate identifier format (alphanumeric, underscores, hyphens)."""
        import re

        if not re.match(r"^[a-zA-Z0-9_-]+$", v):
            raise ValueError(
                "Identifier can only contain letters, numbers, underscores, and hyphens"
            )
        return v.lower()

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase."""
        return v.lower()


class UserLogin(BaseModel):
    """Schema for user login."""

    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase."""
        return v.lower()


class ResendVerification(BaseModel):
    """Schema for resending verification email."""

    email: EmailStr = Field(..., description="User's email address")

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Normalize email to lowercase."""
        return v.lower()


# =============================================================================
# RESPONSE SCHEMAS
# =============================================================================


class UserResponse(BaseModel):
    """Schema for user data in responses."""

    id: UUID = Field(..., description="User's unique ID")
    identifier: str = Field(..., description="User's unique username")
    email: str = Field(..., description="User's email address")
    first_name: Optional[str] = Field(None, description="First name")
    last_name: Optional[str] = Field(None, description="Last name")
    is_verified: bool = Field(..., description="Email verification status")
    created_at: Optional[str] = Field(None, description="Account creation timestamp")

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    """Schema for authentication responses."""

    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    user: Optional[UserResponse] = Field(None, description="User data (if successful)")
    requires_verification: bool = Field(
        default=False, description="Whether email verification is required"
    )


class MessageResponse(BaseModel):
    """Schema for simple message responses."""

    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
