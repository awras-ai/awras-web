"""
Dataset model for managing annotation datasets.

A dataset groups translation/voice/dictionary entries under a common
source/target language pair and optional domain category.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class Dataset(Base):
    """
    Represents a collection of entries to be annotated.

    entry_type: "translation" for translation correction datasets,
                "voice" for voice recording datasets,
                "dictionary" for word/translation pairs.
    """

    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    # Language pair
    source_language = Column(String(50), nullable=False)  # e.g. "en", "fr"
    target_language = Column(String(50), nullable=False)  # e.g. "ar"

    # Optional domain/category (e.g. "medical", "news", "legal")
    category = Column(String(100), nullable=True)

    # "translation", "voice", or "dictionary"
    entry_type = Column(String(20), nullable=False)

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
    translation_entries = relationship(
        "TranslationEntry", back_populates="dataset", cascade="all, delete-orphan"
    )
    voice_entries = relationship(
        "VoiceEntry", back_populates="dataset", cascade="all, delete-orphan"
    )
    dictionary_entries = relationship(
        "DictionaryEntry", back_populates="dataset", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Dataset {self.name} ({self.source_language}->{self.target_language})>"
