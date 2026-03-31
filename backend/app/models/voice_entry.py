"""
VoiceEntry model for voice recording datasets.

Each entry holds the text that the user will read aloud.
The admin provides the text; the user provides the audio recording via VoiceAnnotation.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class VoiceEntry(Base):
    """
    A text prompt within a voice dataset that a user will read aloud.

    source_text: The text the user must read / record.

    status:
        "pending"   - not yet recorded
        "completed" - has one voice annotation (recording)
    """

    __tablename__ = "voice_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(
        UUID(as_uuid=True),
        ForeignKey("voice_datasets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    source_text = Column(Text, nullable=False)  # Text the user reads aloud

    status = Column(
        String(20), nullable=False, default="pending"
    )  # pending | completed

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    dataset = relationship("VoiceDataset", back_populates="entries")
    annotation = relationship(
        "VoiceAnnotation",
        back_populates="entry",
        uselist=False,  # One annotation per entry
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<VoiceEntry {self.id} [{self.status}]>"
