"""
Authentication API endpoints.
"""

import logging
import secrets
from typing import Optional

import httpx
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
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.database import get_db
from app.models.user import User
from app.models.users_feedback import UsersFeedback
from app.schemas.auth import (
    AuthResponse,
    MessageResponse,
    ResendVerification,
    UserCountResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    ProfileImageResponse,
    FeedbackSubmit,
    FeedbackResponse,
)
from app.services.auth import AuthService
from app.services.email import EmailService
from app.services.object_storage import storage_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()

GOOGLE_STATE_COOKIE_NAME = "google_oauth_state"


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
    elif user.oauth_profile_picture_url:
        profile_image_url = user.oauth_profile_picture_url

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


@router.get(
    "/count",
    response_model=UserCountResponse,
    summary="Get count of authenticated users",
)
def get_user_count(
    db: Session = Depends(get_db),
) -> UserCountResponse:
    """
    Get the current number of authenticated users.
    """
    count = AuthService.count_users(db)
    return UserCountResponse(count=count)


@router.post(
    "/submit-feedback",
    response_model=FeedbackResponse,
    summary="Submit user feedback",
)
async def submit_feedback(
    request: Request,
    data: FeedbackSubmit,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
) -> FeedbackResponse:
    """
    Submit feedback from the authenticated user.

    Saves the feedback text with the user ID and current timestamp.
    Requires authentication.
    """
    feedback = UsersFeedback(
        feedback=data.feedback,
        user_id=user.id,
    )
    db.add(feedback)
    db.commit()

    return FeedbackResponse(
        success=True,
        message="Feedback submitted successfully",
    )


def set_google_state_cookie(response: Response, state: str) -> None:
    """Set the Google OAuth state cookie on the response."""
    response.set_cookie(
        key=GOOGLE_STATE_COOKIE_NAME,
        value=state,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        domain=settings.SESSION_COOKIE_DOMAIN,
        max_age=600,
        path="/",
    )


def clear_google_state_cookie(response: Response) -> None:
    """Clear the Google OAuth state cookie."""
    response.delete_cookie(
        key=GOOGLE_STATE_COOKIE_NAME,
        httponly=True,
        secure=settings.SESSION_COOKIE_SECURE,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        domain=settings.SESSION_COOKIE_DOMAIN,
        path="/",
    )


@router.get(
    "/google/login",
    summary="Initiate Google OAuth login",
)
async def google_login(request: Request):
    """
    Redirect the user to Google's consent screen.

    Sets a state cookie for CSRF protection.
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google OAuth is not configured",
        )

    state = secrets.token_urlsafe(32)

    google_auth_url = (
        "https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={settings.GOOGLE_CLIENT_ID}&"
        f"redirect_uri={settings.GOOGLE_REDIRECT_URI}&"
        "response_type=code&"
        "scope=openid email profile&"
        "access_type=offline&"
        f"state={state}"
    )

    redirect = RedirectResponse(url=google_auth_url)
    set_google_state_cookie(redirect, state)
    return redirect


@router.get(
    "/google/callback",
    summary="Handle Google OAuth callback",
)
async def google_callback(
    request: Request,
    response: Response,
    code: str,
    state: str,
    db: Session = Depends(get_db),
):
    """
    Handle the OAuth callback from Google.

    Exchanges the authorization code for tokens, fetches user info,
    creates/links the user, and creates a session.
    """
    stored_state = request.cookies.get(GOOGLE_STATE_COOKIE_NAME)

    if not stored_state or stored_state != state:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_state_mismatch"
        )

    clear_google_state_cookie(response)

    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_not_configured"
        )

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
    }

    try:
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            tokens = token_response.json()

            access_token = tokens.get("access_token")
            if not access_token:
                return RedirectResponse(
                    url=f"{settings.FRONTEND_URL}/login?error=oauth_token_error"
                )

            userinfo_response = await client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            userinfo_response.raise_for_status()
            google_user = userinfo_response.json()

    except httpx.HTTPError as e:
        logger = logging.getLogger(__name__)
        logger.error(f"Google OAuth HTTP error: {str(e)}")
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_http_error"
        )

    google_sub = google_user.get("id")
    email = google_user.get("email")
    first_name = google_user.get("given_name")
    last_name = google_user.get("family_name")
    profile_picture_url = google_user.get("picture")

    if not google_sub or not email:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_invalid_user"
        )

    user, error = AuthService.get_or_create_google_user(
        db=db,
        google_sub=google_sub,
        email=email,
        first_name=first_name,
        last_name=last_name,
        profile_picture_url=profile_picture_url,
    )

    if not user:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error={error or 'oauth_user_error'}"
        )

    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )

    redirect = RedirectResponse(url=settings.OAUTH_SUCCESS_REDIRECT)
    set_session_cookie(redirect, session.token)
    return redirect
