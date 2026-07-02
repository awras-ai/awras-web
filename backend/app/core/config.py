"""
Core configuration settings for the application.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


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

    # AI MODEL
    MODEL_API_KEY: str = ""
    MODEL_BASE_URL: str = "https://api.deepseek.com"
    MODEL_NAME: str = ""
    MODEL_CUSTOM_HEADER_KEY: str = ""
    MODEL_CUSTOM_HEADER_VALUE: str = ""
    MODEL_TEMPERATURE: float = 0.7
    MODEL_MAX_TOKENS: int = 512

    # API
    API_V1_PREFIX: str = "/api/v1"

    # Keycloak (OIDC)
    KEYCLOAK_ISSUER: str = "http://localhost:8080/realms/awras"
    KEYCLOAK_CLIENT_ID: str = "awras-backend"
    KEYCLOAK_CLIENT_SECRET: str = ""

    # Better Auth (shared secret for future JWE cookie decryption)
    BETTER_AUTH_SECRET: str = ""

    # Cloudflare R2 (for object storage)
    R2_ENDPOINT_URL: str = ""
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "awras"

    class Config:
        env_file = ".env"
        extra = "allow"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
