"""
DictionaryEntry model for dictionary datasets.

Each entry holds a word and its translation/definition.
Users can annotate by providing corrections, or add new entries entirely.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base


class DictionaryEntry(Base):
    """
    A dictionary word/translation pair.

    Fields:
        word:              Source word
        translation:       Translation/definition
        pronunciation:     Optional pronunciation guide
        examples:          Optional example usage (single string)
        tags:              Free-form JSON array of tags
        is_user_submitted: False = admin imported, True = added by user
        created_by_id:     Who added it (if user-submitted)

    status:
        "pending"   - not yet annotated
        "completed" - has one annotation
    """

    __tablename__ = "dictionary_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    word = Column(Text, nullable=False)  # Source word
    translation = Column(Text, nullable=False)  # Translation/definition
    pronunciation = Column(Text, nullable=True)  # Optional pronunciation
    examples = Column(Text, nullable=True)  # Single string example usage
    tags = Column(
        JSONB, nullable=True, default=list
    )  # Free-form tags: ["formal", "slang"]

    is_user_submitted = Column(
        Boolean, default=False, nullable=False
    )  # Distinguishes user-added from admin-imported
    created_by_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending | completed

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    dataset = relationship("Dataset", back_populates="dictionary_entries")
    created_by = relationship("User", foreign_keys=[created_by_id])
    annotation = relationship(
        "DictionaryAnnotation",
        back_populates="entry",
        uselist=False,  # One annotation per entry
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<DictionaryEntry {self.word} [{self.status}]>"
