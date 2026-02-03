"""
User and Session models for authentication.

The User model is compatible with Chainlit's data layer expectations.
"""

import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class User(Base):
    """
    User model compatible with Chainlit's data layer.

    Chainlit REQUIRED fields (do not modify):
    - id: UUID PRIMARY KEY
    - identifier: TEXT NOT NULL UNIQUE
    - metadata: JSONB NOT NULL
    - createdAt: TEXT

    Additional auth fields:
    - email, hashed_password, is_active, is_verified, is_superuser
    - first_name, last_name, profile_image_path
    - verification_token, verification_expires
    """

    __tablename__ = "users"

    # ==========================================================================
    # CHAINLIT REQUIRED FIELDS - DO NOT MODIFY
    # ==========================================================================
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    identifier = Column(Text, nullable=False, unique=True)  # Username/unique identifier
    metadata_ = Column(
        "metadata", JSONB, nullable=False, server_default=text("'{}'::jsonb")
    )
    created_at = Column(
        "createdAt", Text, default=lambda: datetime.now(timezone.utc).isoformat()
    )

    # ==========================================================================
    # AUTHENTICATION FIELDS
    # ==========================================================================
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)

    # ==========================================================================
    # PROFILE FIELDS
    # ==========================================================================
    first_name = Column(String(255), nullable=True)
    last_name = Column(String(255), nullable=True)
    profile_image_path = Column(String(500), nullable=True)

    # ==========================================================================
    # EMAIL VERIFICATION
    # ==========================================================================
    verification_token = Column(String(255), nullable=True, index=True)
    verification_expires = Column(DateTime(timezone=True), nullable=True)

    # ==========================================================================
    # TIMESTAMPS
    # ==========================================================================
    updated_at = Column(
        "updatedAt",
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=func.now(),
    )

    # ==========================================================================
    # RELATIONSHIPS
    # ==========================================================================
    sessions = relationship(
        "Session", back_populates="user", cascade="all, delete-orphan", lazy="dynamic"
    )

    def __repr__(self) -> str:
        return f"<User {self.identifier}>"

    @staticmethod
    def generate_verification_token() -> str:
        """Generate a secure verification token."""
        return secrets.token_urlsafe(32)

    def set_verification_token(self, hours: int = 24) -> str:
        """Set verification token with expiration."""
        token = self.generate_verification_token()
        self.verification_token = token
        self.verification_expires = datetime.now(timezone.utc) + timedelta(hours=hours)
        return token

    def clear_verification_token(self) -> None:
        """Clear the verification token."""
        self.verification_token = None
        self.verification_expires = None

    @property
    def display_name(self) -> str:
        """Get display name from first/last name or identifier."""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        return self.identifier


class Session(Base):
    """
    Server-side session model for authentication.

    Sessions are stored in the database and validated on each request.
    This provides:
    - Immediate session revocation (logout)
    - Logout from all devices
    - Session tracking (user agent, IP)
    """

    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token = Column(String(64), unique=True, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    last_activity = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    user_agent = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length

    # Relationship
    user = relationship("User", back_populates="sessions")

    def __repr__(self) -> str:
        return f"<Session {self.id} for user {self.user_id}>"

    @staticmethod
    def generate_token() -> str:
        """Generate a secure session token."""
        return secrets.token_urlsafe(48)  # 64 characters base64

    @classmethod
    def create(
        cls,
        user_id: uuid.UUID,
        expires_in_days: int = 15,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> "Session":
        """Factory method to create a new session."""
        return cls(
            user_id=user_id,
            token=cls.generate_token(),
            expires_at=datetime.now(timezone.utc) + timedelta(days=expires_in_days),
            user_agent=user_agent,
            ip_address=ip_address,
        )

    @property
    def is_expired(self) -> bool:
        """Check if session has expired."""
        return datetime.now(timezone.utc) > self.expires_at

    def refresh_activity(self) -> None:
        """Update last activity timestamp."""
        self.last_activity = datetime.now(timezone.utc)
