"""
Core configuration settings for the application.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "AWRAS API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # Redis (for rate limiting)
    REDIS_URL: str

    # CORS
    CORS_ORIGINS: list[str]

    # DeepSeek AI
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Auth Settings
    SESSION_SECRET_KEY: str = ""  # For additional signing if needed
    SESSION_COOKIE_NAME: str = "session_id"
    SESSION_COOKIE_SECURE: bool = (
        True  # Set to False for local development without HTTPS
    )
    SESSION_COOKIE_HTTPONLY: bool = True
    SESSION_COOKIE_SAMESITE: str = "lax"  # "lax", "strict", or "none"
    SESSION_COOKIE_DOMAIN: Optional[str] = None  # None for localhost
    SESSION_EXPIRE_DAYS: int = 15  # Session expiration in days

    # Email (Resend)
    RESEND_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@example.com"
    EMAIL_VERIFICATION_EXPIRE_HOURS: int = 24

    # Frontend URL (for verification links and redirects)
    FRONTEND_URL: str = "http://localhost:5173"

    # Email Verification
    REQUIRE_EMAIL_VERIFICATION: bool = (
        False  # Set True to require email verification before login
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
