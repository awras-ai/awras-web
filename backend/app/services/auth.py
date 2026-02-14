"""
Authentication service for user management and session handling.
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Optional

import bcrypt
from sqlalchemy.orm import Session as DBSession
from sqlalchemy.exc import IntegrityError

from app.core.config import get_settings
from app.models.user import User, Session
from app.schemas.auth import UserRegister

logger = logging.getLogger(__name__)
settings = get_settings()


class AuthService:
    """Service for authentication operations."""

    # =========================================================================
    # PASSWORD OPERATIONS
    # =========================================================================

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        password_bytes = password.encode("utf-8")
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode("utf-8")

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        try:
            password_bytes = plain_password.encode("utf-8")
            hashed_bytes = hashed_password.encode("utf-8")
            return bcrypt.checkpw(password_bytes, hashed_bytes)
        except Exception:
            return False

    # =========================================================================
    # USER OPERATIONS
    # =========================================================================

    @staticmethod
    def create_user(db: DBSession, data: UserRegister) -> tuple[Optional[User], str]:
        """
        Create a new user.

        Args:
            db: Database session
            data: User registration data

        Returns:
            Tuple of (User or None, error_message or "")
        """
        # Check for existing email
        existing_email = db.query(User).filter(User.email == data.email).first()
        if existing_email:
            return None, "Email already registered"

        # Check for existing identifier
        existing_identifier = (
            db.query(User).filter(User.identifier == data.identifier).first()
        )
        if existing_identifier:
            return None, "Username already taken"

        # Create user
        user = User(
            email=data.email,
            identifier=data.identifier,
            hashed_password=AuthService.hash_password(data.password),
            first_name=data.first_name,
            last_name=data.last_name,
            is_verified=not settings.REQUIRE_EMAIL_VERIFICATION,
            is_active=True,
        )

        try:
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"User created: {user.identifier} ({user.email})")
            return user, ""
        except IntegrityError as e:
            db.rollback()
            logger.error(f"IntegrityError creating user: {str(e)}")
            return None, "User creation failed due to duplicate data"
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating user: {str(e)}")
            return None, f"User creation failed: {str(e)}"

    @staticmethod
    def get_user_by_email(db: DBSession, email: str) -> Optional[User]:
        """Get a user by email address."""
        return db.query(User).filter(User.email == email.lower()).first()

    @staticmethod
    def get_user_by_identifier(db: DBSession, identifier: str) -> Optional[User]:
        """Get a user by identifier/username."""
        return db.query(User).filter(User.identifier == identifier.lower()).first()

    @staticmethod
    def get_user_by_id(db: DBSession, user_id: uuid.UUID) -> Optional[User]:
        """Get a user by ID."""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def authenticate_user(
        db: DBSession, email: str, password: str
    ) -> tuple[Optional[User], str]:
        """
        Authenticate a user with email and password.

        Args:
            db: Database session
            email: User's email
            password: Plain text password

        Returns:
            Tuple of (User or None, error_message or "")
        """
        user = AuthService.get_user_by_email(db, email)

        if not user:
            return None, "Invalid email or password"

        if not AuthService.verify_password(password, user.hashed_password):
            return None, "Invalid email or password"

        if not user.is_active:
            return None, "Account is deactivated"

        if settings.REQUIRE_EMAIL_VERIFICATION and not user.is_verified:
            return (
                None,
                "Email not verified. Please check your inbox for verification email.",
            )

        return user, ""

    @staticmethod
    def set_user_verification_token(db: DBSession, user: User) -> str:
        """Set verification token for a user and return it."""
        token = user.set_verification_token(
            hours=settings.EMAIL_VERIFICATION_EXPIRE_HOURS
        )
        db.commit()
        return token

    @staticmethod
    def verify_user_email(db: DBSession, token: str) -> tuple[Optional[User], str]:
        """
        Verify a user's email using the verification token.

        Args:
            db: Database session
            token: Verification token

        Returns:
            Tuple of (User or None, error_message or "")
        """
        user = db.query(User).filter(User.verification_token == token).first()

        if not user:
            return None, "Invalid verification token"

        if user.verification_expires and user.verification_expires < datetime.now(
            timezone.utc
        ):
            return None, "Verification token has expired"

        if user.is_verified:
            return user, "Email already verified"

        user.is_verified = True
        user.clear_verification_token()
        db.commit()
        logger.info(f"Email verified for user: {user.identifier}")
        return user, ""

    # =========================================================================
    # SESSION OPERATIONS
    # =========================================================================

    @staticmethod
    def create_session(
        db: DBSession,
        user_id: uuid.UUID,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> Session:
        """
        Create a new session for a user.

        Args:
            db: Database session
            user_id: User's ID
            user_agent: Client's user agent string
            ip_address: Client's IP address

        Returns:
            Created Session object
        """
        session = Session.create(
            user_id=user_id,
            expires_in_days=settings.SESSION_EXPIRE_DAYS,
            user_agent=user_agent,
            ip_address=ip_address,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        logger.info(f"Session created for user {user_id}")
        return session

    @staticmethod
    def get_session_by_token(db: DBSession, token: str) -> Optional[Session]:
        """Get a session by its token, if valid and not expired."""
        session = db.query(Session).filter(Session.token == token).first()

        if not session:
            return None

        if session.is_expired:
            # Clean up expired session
            db.delete(session)
            db.commit()
            return None

        # Update last activity
        session.refresh_activity()
        db.commit()

        return session

    @staticmethod
    def get_user_from_session_token(db: DBSession, token: str) -> Optional[User]:
        """Get the user associated with a session token."""
        session = AuthService.get_session_by_token(db, token)
        if not session:
            return None
        return session.user

    @staticmethod
    def invalidate_session(db: DBSession, token: str) -> bool:
        """
        Invalidate (delete) a session by its token.

        Returns:
            True if session was found and deleted, False otherwise
        """
        session = db.query(Session).filter(Session.token == token).first()
        if not session:
            return False

        db.delete(session)
        db.commit()
        logger.info(f"Session invalidated for user {session.user_id}")
        return True

    @staticmethod
    def invalidate_all_user_sessions(db: DBSession, user_id: uuid.UUID) -> int:
        """
        Invalidate all sessions for a user.

        Returns:
            Number of sessions deleted
        """
        count = db.query(Session).filter(Session.user_id == user_id).delete()
        db.commit()
        logger.info(f"Invalidated {count} sessions for user {user_id}")
        return count

    @staticmethod
    def cleanup_expired_sessions(db: DBSession) -> int:
        """
        Delete all expired sessions from the database.

        Returns:
            Number of sessions deleted
        """
        now = datetime.now(timezone.utc)
        count = db.query(Session).filter(Session.expires_at < now).delete()
        db.commit()
        logger.info(f"Cleaned up {count} expired sessions")
        return count

    @staticmethod
    def count_users(db: DBSession) -> int:
        """
        Count the number of authenticated users.

        Returns:
            Number of users
        """
        return db.query(User).count()
