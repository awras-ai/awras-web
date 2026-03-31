"""
Authentication API endpoints.

Registration, login, logout, email verification, and Google OAuth.
"""

import logging
import secrets

import httpx
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Request,
    Response,
    status,
    UploadFile,
)
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.database import get_db
from app.deps.auth import (
    OAuthStateCookieManager,
    SessionCookieManager,
    get_client_ip,
    require_auth,
    user_to_response,
)
from app.models.user import User
from app.models.users_feedback import UsersFeedback
from app.schemas.auth import (
    AuthResponse,
    FeedbackResponse,
    FeedbackSubmit,
    MessageResponse,
    ProfileImageResponse,
    ResendVerification,
    UserCountResponse,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.services.auth import AuthService
from app.services.email import EmailService
from app.services.object_storage import storage_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


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
    user, error = AuthService.create_user(db, data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    if settings.REQUIRE_EMAIL_VERIFICATION:
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

    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )
    SessionCookieManager.set(response, session.token)

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
    user, error = AuthService.authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error,
        )

    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )
    SessionCookieManager.set(response, session.token)

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
    token = request.cookies.get(settings.SESSION_COOKIE_NAME)

    if token:
        AuthService.invalidate_session(db, token)

    SessionCookieManager.clear(response)

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
    count = AuthService.invalidate_all_user_sessions(db, user.id)
    SessionCookieManager.clear(response)

    return MessageResponse(
        success=True,
        message=f"Logged out from {count} session(s)",
    )


@router.get(
    "/verify-email",
    response_model=AuthResponse,
    summary="Verify email address",
    deprecated=True,
)
@limiter.limit("10/minute")
async def verify_email(
    request: Request,
    response: Response,
    token: str,
    db: Session = Depends(get_db),
) -> AuthResponse:
    user, error = AuthService.verify_user_email(db, token)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error,
        )

    if error == "Email already verified":
        return AuthResponse(
            success=True,
            message="Email already verified",
            user=user_to_response(user),
        )

    session = AuthService.create_session(
        db=db,
        user_id=user.id,
        user_agent=request.headers.get("User-Agent"),
        ip_address=get_client_ip(request),
    )
    SessionCookieManager.set(response, session.token)

    return AuthResponse(
        success=True,
        message="Email verified successfully",
        user=user_to_response(user),
    )


@router.post(
    "/resend-verification",
    response_model=MessageResponse,
    summary="Resend verification email",
    deprecated=True,
)
@limiter.limit("3/minute")
async def resend_verification(
    request: Request,
    data: ResendVerification,
    db: Session = Depends(get_db),
) -> MessageResponse:
    user = AuthService.get_user_by_email(db, data.email)

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
    "/count",
    response_model=UserCountResponse,
    summary="Get count of authenticated users",
    deprecated=True,
)
def get_user_count(
    db: Session = Depends(get_db),
) -> UserCountResponse:
    count = AuthService.count_users(db)
    return UserCountResponse(count=count)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user",
)
async def get_me(
    user: User = Depends(require_auth),
) -> UserResponse:
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
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image",
        )

    key = storage_service.upload_file(file, folder="profile-pictures")

    if not key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image",
        )

    user.profile_image_path = key
    db.commit()
    db.refresh(user)

    signed_url = storage_service.get_presigned_url(key)

    return ProfileImageResponse(
        success=True,
        message="Profile image uploaded successfully",
        profile_image_url=signed_url,
    )


@router.post(
    "/submit-feedback",
    response_model=FeedbackResponse,
    summary="Submit user feedback",
    deprecated=True,
)
async def submit_feedback(
    request: Request,
    data: FeedbackSubmit,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
) -> FeedbackResponse:
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


@router.get(
    "/google/login",
    summary="Initiate Google OAuth login",
)
async def google_login(request: Request):
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
    OAuthStateCookieManager.set(redirect, state)
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
    stored_state = request.cookies.get("google_oauth_state")

    if not stored_state or stored_state != state:
        return RedirectResponse(
            url=f"{settings.FRONTEND_URL}/login?error=oauth_state_mismatch"
        )

    OAuthStateCookieManager.clear(response)

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
    SessionCookieManager.set(redirect, session.token)
    return redirect
