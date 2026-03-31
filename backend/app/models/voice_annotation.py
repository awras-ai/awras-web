"""
VoiceAnnotation model - user audio recording for a voice entry.

The user reads the source_text aloud and submits an audio recording.
One annotation per entry (enforced by unique constraint on entry_id).
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class VoiceAnnotation(Base):
    """
    A user's audio recording for a voice entry.

    audio_path:  Path/key in object storage (e.g. "voice/dataset-id/entry-id/user-id.webm").
    notes:       Optional remarks from the annotator.

    Constrained to one annotation per entry (unique on entry_id).
    """

    __tablename__ = "voice_annotations"
    __table_args__ = (UniqueConstraint("entry_id", name="uq_voice_annotation_entry"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("voice_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    audio_path = Column(Text, nullable=False)  # Object storage key
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
    entry = relationship("VoiceEntry", back_populates="annotation")
    user = relationship("User", foreign_keys=[user_id])

    def __repr__(self) -> str:
        return f"<VoiceAnnotation entry={self.entry_id} user={self.user_id}>"
