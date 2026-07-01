"""
TranslationAnnotation model - user correction for a translation entry.

One annotation per entry (enforced by unique constraint on entry_id).
The annotator provides a corrected translation and optional notes.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class TranslationAnnotation(Base):
    """
    A user's correction of a translation entry.

    Constrained to one annotation per entry (unique on entry_id).
    """

    __tablename__ = "translation_annotations"
    __table_args__ = (
        UniqueConstraint("entry_id", name="uq_translation_annotation_entry"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("translation_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    keycloak_sub = Column(String(255), nullable=True, index=True)

    corrected_translation = Column(Text, nullable=False)
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
    entry = relationship("TranslationEntry", back_populates="annotation")

    def __repr__(self) -> str:
        return f"<TranslationAnnotation entry={self.entry_id} sub={self.keycloak_sub}>"
