"""
Keycloak JWT validation service.

Validates Keycloak access tokens using python-keycloak library.
No local user storage - Keycloak is the single source of truth.
"""

from functools import lru_cache

from jwcrypto.jwt import JWTExpired
from keycloak import KeycloakOpenID
from keycloak.exceptions import KeycloakInvalidTokenError

from app.core.config import get_settings

settings = get_settings()


class KeycloakAuthService:
    """Service for Keycloak OIDC token validation."""

    @staticmethod
    @lru_cache(maxsize=1)
    def _get_openid() -> KeycloakOpenID:
        """Get or create a cached KeycloakOpenID connection."""
        realm = settings.KEYCLOAK_ISSUER.rstrip("/").rsplit("/", 1)[-1]
        return KeycloakOpenID(
            server_url=settings.KEYCLOAK_ISSUER.rsplit("/realms/", 1)[0],
            client_id=settings.KEYCLOAK_CLIENT_ID,
            client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
            realm_name=realm,
        )

    @staticmethod
    def validate_token(token: str) -> dict:
        """
        Validate a Keycloak access token and return its decoded claims.

        Args:
            token: The Keycloak JWT access token

        Returns:
            dict: Decoded token claims (sub, email, name, etc.)

        Raises:
            KeycloakInvalidTokenError: If the token is invalid or expired
            KeycloakError: If validation fails for other reasons
        """
        oid = KeycloakAuthService._get_openid()
        try:
            return oid.decode_token(token, validate=True)
        except JWTExpired:
            raise KeycloakInvalidTokenError("Token expired")
