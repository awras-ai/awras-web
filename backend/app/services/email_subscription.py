"""
Service layer for email subscription business logic.
"""
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status

from app.models.email_subscription import EmailSubscription
from app.schemas.email_subscription import EmailSubscriptionCreate


class EmailSubscriptionService:
    """Service for handling email subscription operations."""
    
    @staticmethod
    def create_subscription(db: Session, subscription: EmailSubscriptionCreate) -> EmailSubscription:
        """
        Create a new email subscription.
        
        Args:
            db: Database session
            subscription: Email subscription data
            
        Returns:
            Created email subscription
            
        Raises:
            HTTPException: If email already exists
        """
        db_subscription = EmailSubscription(
            email=subscription.email.lower(),  # Store emails in lowercase
            source=subscription.source
        )
        
        try:
            db.add(db_subscription)
            db.commit()
            db.refresh(db_subscription)
            return db_subscription
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already subscribed"
            )
    
    @staticmethod
    def get_subscription_by_email(db: Session, email: str) -> EmailSubscription | None:
        """Get subscription by email."""
        return db.query(EmailSubscription).filter(
            EmailSubscription.email == email.lower()
        ).first()
    
    @staticmethod
    def get_all_subscriptions(
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        active_only: bool = True
    ) -> tuple[list[EmailSubscription], int]:
        """
        Get all email subscriptions with pagination.
        
        Returns:
            Tuple of (subscriptions list, total count)
        """
        query = db.query(EmailSubscription)
        
        if active_only:
            query = query.filter(EmailSubscription.is_active)
        
        total = query.count()
        subscriptions = query.offset(skip).limit(limit).all()
        
        return subscriptions, total
    
    @staticmethod
    def delete_subscription(db: Session, subscription_id: int) -> bool:
        """
        Soft delete a subscription (deactivate).
        
        Returns:
            True if deleted, False if not found
        """
        subscription = db.query(EmailSubscription).filter(
            EmailSubscription.id == subscription_id
        ).first()
        
        if not subscription:
            return False
        
        subscription.is_active = False
        db.commit()
        return True
