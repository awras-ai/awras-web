"""
TranslationEntry model for translation correction datasets.

Each entry holds an original source text and its reference translation.
Users annotate by providing a corrected translation.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class TranslationEntry(Base):
    """
    A single translation pair within a translation dataset.

    status:
        "pending"     - not yet annotated
        "completed"   - has one annotation
    """

    __tablename__ = "translation_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(
        UUID(as_uuid=True),
        ForeignKey("translation_datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    source_text = Column(Text, nullable=False)  # Original text
    reference_translation = Column(Text, nullable=False)  # Provided translation

    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending | completed

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    dataset = relationship("TranslationDataset", back_populates="entries")
    annotation = relationship(
        "TranslationAnnotation",
        back_populates="entry",
        uselist=False,  # One annotation per entry
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<TranslationEntry {self.id} [{self.status}]>"
