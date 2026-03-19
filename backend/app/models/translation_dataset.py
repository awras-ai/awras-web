"""
TranslationDataset model for managing translation correction datasets.

A translation dataset groups translation entries with a specific
source->target language pair and optional domain category.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class TranslationDataset(Base):
    """
    Represents a collection of translation entries to be corrected.

    Each dataset has a directional language pair (source -> target)
    and can be categorized by domain (e.g., "medical", "news", "legal").
    """

    __tablename__ = "translation_datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Directional language pair for translation
    source_language = Column(String(50), nullable=False)  # e.g. "en", "fr"
    target_language = Column(String(50), nullable=False)  # e.g. "ar"

    # Optional domain/category (e.g. "medical", "news", "legal")
    category = Column(String(100), nullable=True)

    # Who created this dataset (must be superuser)
    created_by_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

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
    created_by = relationship("User", foreign_keys=[created_by_id])
    entries = relationship(
        "TranslationEntry", back_populates="dataset", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<TranslationDataset {self.name} ({self.source_language}->{self.target_language})>"
