"""
VoiceDataset model for managing voice recording datasets.

A voice dataset groups voice entries with a single language
and optional domain category.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class VoiceDataset(Base):
    """
    Represents a collection of voice recording entries.

    Each dataset has a single language (the language being recorded)
    and can be categorized by domain (e.g., "conversational", "formal", "medical").
    """

    __tablename__ = "voice_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Single language for voice recording
    language = Column(String(50), nullable=False)  # e.g. "ar", "en"

    # Optional domain/category (e.g. "conversational", "formal", "medical")
    category = Column(String(100), nullable=True)

    # Who created this dataset (must be superuser) - Keycloak sub
    created_by_sub = Column(String(255), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    entries = relationship(
        "VoiceEntry", back_populates="dataset", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<VoiceDataset {self.name} ({self.language})>"
