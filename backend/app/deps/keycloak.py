"""
FastAPI auth dependencies - Keycloak OIDC only.

All user data comes from Keycloak JWT claims. No local user storage.
"""

import logging
from typing import Optional

from fastapi import HTTPException, Request, status
from jwcrypto.jwt import JWTExpired
from keycloak.exceptions import KeycloakInvalidTokenError

from app.services.keycloak import KeycloakAuthService

logger = logging.getLogger(__name__)


class KeycloakUser:
    """
    Represents the authenticated user from Keycloak token claims.

    This is an ephemeral object constructed from the JWT on each request.
    No database lookup - all data comes from the token.
    """

    def __init__(self, claims: dict):
        self.sub = claims["sub"]  # Keycloak user ID (UUID string)
        self.email = claims.get("email", "")
        self.name = claims.get("name", "")
        self.given_name = claims.get("given_name")
        self.family_name = claims.get("family_name")
        self.preferred_username = claims.get("preferred_username", "")
        self.email_verified = claims.get("email_verified", False)

        # Check if user has realm role "admin" or "superuser"
        realm_access = claims.get("realm_access", {})
        roles = realm_access.get("roles", [])
        self.is_superuser = "admin" in roles or "superuser" in roles


def get_current_user(request: Request) -> Optional[KeycloakUser]:
    """
    Extract and validate Keycloak Bearer token from Authorization header.

    Returns None if no token or invalid token.
    Does not raise exceptions - use require_auth for that.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header[len("Bearer ") :]

    try:
        claims = KeycloakAuthService.validate_token(token)
        return KeycloakUser(claims)
    except KeycloakInvalidTokenError:
        logger.warning("Invalid or expired Keycloak token")
        request.state.auth_failure = "invalid_or_expired_token"
        return None
    except JWTExpired:
        logger.warning("Expired Keycloak token")
        request.state.auth_failure = "token_expired"
        return None
    except Exception:
        logger.warning("Unexpected error validating Keycloak token", exc_info=True)
        request.state.auth_failure = "unexpected_error"
        return None


_AUTH_FAILURE_MESSAGES = {
    "invalid_or_expired_token": "Not authenticated: invalid or expired token",
    "token_expired": "Not authenticated: token expired",
    "unexpected_error": "Not authenticated",
}


def _get_auth_failure_detail(request: Request) -> str:
    reason = getattr(request.state, "auth_failure", None)
    return _AUTH_FAILURE_MESSAGES.get(reason, "Not authenticated")


def require_auth(request: Request) -> KeycloakUser:
    """
    Require authentication via Keycloak Bearer token.

    Raises 401 if not authenticated.
    """
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=_get_auth_failure_detail(request),
        )
    return user


def require_superuser(request: Request) -> KeycloakUser:
    """
    Require superuser (admin role in Keycloak).

    Raises 401 if not authenticated, 403 if not an admin.
    """
    user = get_current_user(request)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=_get_auth_failure_detail(request),
        )
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user


# Alias for backwards compatibility
require_admin_auth = require_superuser
