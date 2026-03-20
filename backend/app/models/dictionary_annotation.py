"""
DictionaryAnnotation model - user correction for a dictionary entry.

One annotation per entry (enforced by unique constraint on entry_id).
Users can correct the translation, pronunciation, examples, and tags.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.database import Base


class DictionaryAnnotation(Base):
    """
    A user's correction of a dictionary entry.

    Constrained to one annotation per entry (unique on entry_id).
    """

    __tablename__ = "dictionary_annotations"
    __table_args__ = (
        UniqueConstraint("entry_id", name="uq_dictionary_annotation_entry"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("dictionary_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Correction fields (all nullable - only correct what's needed)
    corrected_meaning = Column(Text, nullable=True)
    corrected_examples = Column(Text, nullable=True)
    corrected_tags = Column(JSONB, nullable=True)

    notes = Column(Text, nullable=True)

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
    entry = relationship("DictionaryEntry", back_populates="annotation")
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<DictionaryAnnotation entry={self.entry_id} user={self.user_id}>"
