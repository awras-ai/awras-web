"""
Authentication API endpoints.
"""

from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Request,
    Response,
    status,
    UploadFile,
    File,
)
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.database import get_db
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    MessageResponse,
    ResendVerification,
    UserLogin,
    UserRegister,
    UserResponse,
    ProfileImageResponse,
)
from app.services.auth import AuthService
from app.services.email import EmailService
from app.services.object_storage import storage_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================


def get_client_ip(request: Request) -> Optional[str]:
    """Extract client IP from request, handling proxies."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


def set_session_cookie(response: Response, token: str) -> None:
    """Set the session cookie on the response."""
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=token,
        httponly=settings.SESSION_COOKIE_HTTPONLY,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        domain=settings.SESSION_COOKIE_DOMAIN,
        max_age=settings.SESSION_EXPIRE_DAYS * 24 * 60 * 60,  # Convert days to seconds
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    """Clear the session cookie."""
    response.delete_cookie(
        key=settings.SESSION_COOKIE_NAME,
        httponly=settings.SESSION_COOKIE_HTTPONLY,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        domain=settings.SESSION_COOKIE_DOMAIN,
        path="/",
    )


def get_current_user(request: Request, db: Session = Depends(get_db)) -> Optional[User]:
    """Get current user from session cookie. Returns None if not authenticated."""
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)
    if not token:
        return None
    return AuthService.get_user_from_session_token(db, token)


def require_auth(request: Request, db: Session = Depends(get_db)) -> User:
    """Dependency that requires authentication. Raises 401 if not authenticated."""
    user = get_current_user(request, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user


def user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse schema."""
    profile_image_url = None
    if user.profile_image_path:
        profile_image_url = storage_service.get_presigned_url(user.profile_image_path)

    return UserResponse(
        id=user.id,
        identifier=user.identifier,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        is_verified=user.is_verified,
        profile_image_url=profile_image_url,
        created_at=user.created_at,
    )


# =============================================================================
# ENDPOINTS
# =============================================================================


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
@limiter.limit("5/minute")
async def register(
    request: Request,
    response: Response,
    data: UserRegister,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Register a new user account.

    If email verification is required (REQUIRE_EMAIL_VERIFICATION=true):
    - User is created with is_verified=False
    - Verification email is sent
    - Response includes requires_verification=True

    If email verification is NOT required:
    - User is created with is_verified=True
    - Session is created and cookie is set
    - User is logged in immediately
    """
    # Create user
    user, error = AuthService.create_user(db, data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    # Handle email verification flow
    if settings.REQUIRE_EMAIL_VERIFICATION:
        # Generate and send verification email
        token = AuthService.set_user_verification_token(db, user)
        EmailService.send_verification_email(
            to_email=user.email,
            token=token,
            identifier=user.identifier,
        )
        return AuthResponse(
            success=True,
            message="Registration successful. Please check your email to verify your account.",
            user=user_to_response(user),
            requires_verification=True,
        )

    # No verification required - create session and log in
    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )
    set_session_cookie(response, session.token)

    return AuthResponse(
        success=True,
        message="Registration successful",
        user=user_to_response(user),
        requires_verification=False,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login to existing account",
)
@limiter.limit("10/minute")
async def login(
    request: Request,
    response: Response,
    data: UserLogin,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Authenticate a user and create a session.

    Sets an httpOnly cookie with the session token.
    """
    user, error = AuthService.authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error,
        )

    # Create session
    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )
    set_session_cookie(response, session.token)

    return AuthResponse(
        success=True,
        message="Login successful",
        user=user_to_response(user),
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="Logout current session",
)
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """
    Logout the current session.

    Invalidates the session and clears the session cookie.
    """
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)

    if token:
        AuthService.invalidate_session(db, token)

    clear_session_cookie(response)

    return MessageResponse(
        success=True,
        message="Logged out successfully",
    )


@router.post(
    "/logout-all",
    response_model=MessageResponse,
    summary="Logout all sessions",
)
async def logout_all(
    request: Request,
    response: Response,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
) -> MessageResponse:
    """
    Logout all sessions for the current user.

    Invalidates all sessions and clears the current session cookie.
    Requires authentication.
    """
    count = AuthService.invalidate_all_user_sessions(db, user.id)
    clear_session_cookie(response)

    return MessageResponse(
        success=True,
        message=f"Logged out from {count} session(s)",
    )


@router.get(
    "/verify-email",
    response_model=AuthResponse,
    summary="Verify email address",
)
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    response: Response,
    token: str,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Verify a user's email address using the verification token.

    On success, creates a session and logs the user in.
    """
    user, error = AuthService.verify_user_email(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    # If already verified, just return success without creating new session
    if error == "Email already verified":
        return AuthResponse(
            success=True,
            message="Email already verified",
            user=user_to_response(user),
        )

    # Create session and log user in
    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )
    set_session_cookie(response, session.token)

    return AuthResponse(
        success=True,
        message="Email verified successfully",
        user=user_to_response(user),
    )


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Resend verification email",
)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    data: ResendVerification,
    db: Session = Depends(get_db),
) -> MessageResponse:
    """
    Resend the verification email.

    Always returns success to prevent email enumeration.
    """
    user = AuthService.get_user_by_email(db, data.email)

    # Always return success to prevent email enumeration
    if not user:
        return MessageResponse(
            success=True,
            message="If an account exists with this email, a verification link has been sent.",
        )

    if user.is_verified:
        return MessageResponse(
            success=True,
            message="If an account exists with this email, a verification link has been sent.",
        )

    # Generate new token and send email
    token = AuthService.set_user_verification_token(db, user)
    EmailService.send_verification_email(
        to_email=user.email,
        token=token,
        identifier=user.identifier,
    )

    return MessageResponse(
        success=True,
        message="If an account exists with this email, a verification link has been sent.",
    )


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
)
async def get_me(
    user: User = Depends(require_auth),
) -> UserResponse:
    """
    Get the currently authenticated user's information.

    Requires authentication.
    """
    return user_to_response(user)


@router.post(
    "/profile-image",
    response_model=ProfileImageResponse,
    summary="Upload profile image",
)
@limiter.limit("5/minute")
async def upload_profile_image(
    request: Request,
    file: UploadFile = File(...),
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
) -> ProfileImageResponse:
    """
    Upload a profile image for the authenticated user.

    - Validates file type (image/*)
    - Uploads to Cloudflare R2
    - Updates user profile with image path
    - Returns a signed URL for immediate display
    """
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    # Upload to R2
    key = storage_service.upload_file(file, folder="profile-pictures")

    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image",
        )

    # Update user profile
    user.profile_image_path = key
    db.commit()
    db.refresh(user)

    # Generate signed URL
    signed_url = storage_service.get_presigned_url(key)

    return ProfileImageResponse(
        success=True,
        message="Profile image uploaded successfully",
        profile_image_url=signed_url,
    )
