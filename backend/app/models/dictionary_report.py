"""
DictionaryReport model - user-submitted flag for a problematic dictionary entry.

Used to collect signals that an entry is wrong/offensive/duplicate/etc.
Reports are collected as data; there is no workflow status (yet).

One report per (entry, user) is enforced via unique constraint.
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base


class DictionaryReport(Base):
    """
    A user's report flagging a dictionary entry as problematic.

    Multiple users can report the same entry (one report per user per entry).
    """

    __tablename__ = "dictionary_reports"
    __table_args__ = (
        UniqueConstraint(
            "entry_id",
            "keycloak_sub",
            name="uq_dictionary_report_entry_user",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    entry_id = Column(
        UUID(as_uuid=True),
        ForeignKey("dictionary_entries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    keycloak_sub = Column(String(255), nullable=False, index=True)

    # Category of the report. Validated at the Pydantic layer (see
    # app.schemas.dictionary.ReportReason). Stored as a short string so
    # adding new reasons does not require a DB migration.
    reason = Column(String(50), nullable=False)

    # Optional free-text explanation from the reporting user.
    details = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    entry = relationship("DictionaryEntry", back_populates="reports")

    def __repr__(self) -> str:
        return (
            f"<DictionaryReport entry={self.entry_id} "
            f"sub={self.keycloak_sub} reason={self.reason}>"
        )
