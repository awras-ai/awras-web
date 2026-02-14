import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base


class UsersFeedback(Base):
    __tablename__ = "users_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column(
        "createdAt", Text, default=lambda: datetime.now(timezone.utc).isoformat()
    )
    feedback = Column(String(255), unique=False, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
