"""
Chainlit data layer models.

These models match the schema required by Chainlit's SQLAlchemy data layer:
https://docs.chainlit.io/data-layers/sqlalchemy

IMPORTANT: Do not add SQLAlchemy relationships here - Chainlit manages
these tables directly and handles relationships at runtime.

Tables:
- threads: Chat conversation threads
- steps: Individual messages/steps within threads
- elements: File attachments and media
- feedbacks: User feedback on steps
"""

import uuid

from sqlalchemy import ARRAY, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.database import Base


class Thread(Base):
    """
    Chat thread/conversation model.

    Chainlit schema:
    - id: UUID PRIMARY KEY
    - createdAt: String (TEXT)
    - name: String
    - userId: UUID (FK to users)
    - userIdentifier: String
    - tags: ARRAY(String)
    - metadata: JSONB
    """

    __tablename__ = "threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_at = Column("createdAt", String)
    name = Column(String)
    user_id = Column(
        "userId", UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    user_identifier = Column("userIdentifier", String)
    tags = Column(ARRAY(String))
    metadata_ = Column("metadata", JSONB)

    def __repr__(self) -> str:
        return f"<Thread {self.id} - {self.name}>"


class Step(Base):
    """
    Individual step/message within a thread.

    Chainlit schema with snake_case Python attrs and camelCase DB columns.
    """

    __tablename__ = "steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type_ = Column("type", String, nullable=False)
    thread_id = Column(
        "threadId",
        UUID(as_uuid=True),
        ForeignKey("threads.id", ondelete="CASCADE"),
        nullable=False,
    )
    parent_id = Column("parentId", UUID(as_uuid=True))
    streaming = Column(Boolean, nullable=False)
    wait_for_answer = Column("waitForAnswer", Boolean)
    is_error = Column("isError", Boolean)
    metadata_ = Column("metadata", JSONB)
    tags = Column(ARRAY(String))
    input = Column(String)
    output = Column(String)
    created_at = Column("createdAt", String)
    command = Column(String)
    start = Column(String)
    end = Column(String)
    generation = Column(JSONB)
    show_input = Column("showInput", String)
    language = Column(String)
    indent = Column(Integer)
    default_open = Column("defaultOpen", Boolean)

    def __repr__(self) -> str:
        return f"<Step {self.id} - {self.type_}: {self.name}>"


class Element(Base):
    """
    File attachment or media element.

    Chainlit schema with snake_case Python attrs and camelCase DB columns.
    """

    __tablename__ = "elements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(
        "threadId", UUID(as_uuid=True), ForeignKey("threads.id", ondelete="CASCADE")
    )
    type_ = Column("type", String)
    url = Column(String)
    chainlit_key = Column("chainlitKey", String)
    name = Column(String, nullable=False)
    display = Column(String)
    object_key = Column("objectKey", String)
    size = Column(String)
    page = Column(Integer)
    language = Column(String)
    for_id = Column("forId", UUID(as_uuid=True))
    mime = Column(String)
    props = Column(JSONB)
    auto_play = Column("autoPlay", Boolean)

    def __repr__(self) -> str:
        return f"<Element {self.id} - {self.name}>"


class Feedback(Base):
    """
    User feedback on a step.

    Chainlit schema:
    - id: UUID PRIMARY KEY
    - forId: UUID NOT NULL (FK to steps)
    - threadId: UUID NOT NULL (FK to threads)
    - value: INT NOT NULL (e.g., 1 for thumbs up, -1 for thumbs down)
    - comment: String
    """

    __tablename__ = "feedbacks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    for_id = Column("forId", UUID(as_uuid=True), nullable=False)
    thread_id = Column(
        "threadId",
        UUID(as_uuid=True),
        ForeignKey("threads.id", ondelete="CASCADE"),
        nullable=False,
    )
    value = Column(Integer, nullable=False)
    comment = Column(String)

    def __repr__(self) -> str:
        return f"<Feedback {self.id} - value: {self.value}>"
