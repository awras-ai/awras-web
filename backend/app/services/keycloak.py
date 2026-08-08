"""
Keycloak service.

JWT token validation (OIDC) and Admin API access (user lookup).
Keycloak is the single source of truth for all user identity.
"""

import logging
from functools import lru_cache
from typing import Any

from jwcrypto.jwt import JWTExpired
from keycloak import KeycloakAdmin, KeycloakOpenID
from keycloak.exceptions import KeycloakError, KeycloakInvalidTokenError

from app.core.config import get_settings

logger = logging.getLogger(__name__)

settings = get_settings()


class KeycloakService:
    """Service for Keycloak OIDC token validation and Admin API access."""

    # --- Shared connection helpers ------------------------------------------

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
    @lru_cache(maxsize=1)
    def _get_admin() -> KeycloakAdmin:
        """Get or create a cached KeycloakAdmin connection (client credentials flow)."""
        realm = settings.KEYCLOAK_ISSUER.rstrip("/").rsplit("/", 1)[-1]
        return KeycloakAdmin(
            server_url=settings.KEYCLOAK_ISSUER.rsplit("/realms/", 1)[0],
            realm_name=realm,
            client_id=settings.KEYCLOAK_CLIENT_ID,
            client_secret_key=settings.KEYCLOAK_CLIENT_SECRET,
        )

    # --- Token validation --------------------------------------------------

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
        oid = KeycloakService._get_openid()
        try:
            return oid.decode_token(token, validate=True)
        except JWTExpired:
            raise KeycloakInvalidTokenError("Token expired")

    # --- Admin API: user lookup --------------------------------------------

    @staticmethod
    def _extract_user_info(representation: dict[str, Any]) -> dict[str, Any]:
        """
        Build a normalized user info dict from a Keycloak UserRepresentation.

        The profile picture is expected in the custom 'picture' user attribute
        (attributes are lists of values in Keycloak).
        """
        first_name = representation.get("firstName") or ""
        last_name = representation.get("lastName") or ""
        full_name = f"{first_name} {last_name}".strip()

        attributes = representation.get("attributes") or {}
        picture_values = attributes.get("picture") or []
        picture = picture_values[0] if picture_values else None

        return {
            "name": full_name or representation.get("username") or "Unknown user",
            "email": representation.get("email"),
            "picture": picture,
        }

    @staticmethod
    def get_user_by_sub(sub: str) -> dict[str, Any]:
        """
        Fetch a single user's info by their Keycloak sub.

        If the lookup fails (user deleted, Keycloak unreachable), a fallback
        dict is returned so callers never break on a single bad sub.
        """
        try:
            admin = KeycloakService._get_admin()
            representation = admin.get_user(sub)
            return KeycloakService._extract_user_info(representation)
        except KeycloakError as e:
            logger.warning("Failed to fetch Keycloak user %s: %s", sub, e)
        except Exception:
            logger.warning("Unexpected error fetching Keycloak user %s", sub, exc_info=True)
        return {"name": "Unknown user", "email": None, "picture": None}

    @staticmethod
    def get_users_by_subs(subs: list[str]) -> dict[str, dict[str, Any]]:
        """
        Fetch user info for multiple subs.

        Returns a mapping of sub -> user info dict. Subs that fail lookup
        map to a fallback "Unknown user" entry.
        """
        return {sub: KeycloakService.get_user_by_sub(sub) for sub in subs}


# Backwards alias — keeps existing imports working
KeycloakAuthService = KeycloakService
