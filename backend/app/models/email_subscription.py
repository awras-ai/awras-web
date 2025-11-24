"""
Email subscription model.
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.db.database import Base


class EmailSubscription(Base):
    """Email subscription model for waitlist."""
    
    __tablename__ = "email_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    source = Column(String(50), default="waitlist", nullable=False)  # e.g., "waitlist", "newsletter"
    
    def __repr__(self) -> str:
        return f"<EmailSubscription(id={self.id}, email={self.email})>"
