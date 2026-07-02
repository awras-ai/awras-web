"""
Dependency injection utilities.

Imports from app.deps.keycloak for authentication.
"""

from app.deps.keycloak import (
    KeycloakUser,
    get_current_user,
    require_auth,
    require_superuser,
    require_admin_auth,
)

__all__ = [
    "KeycloakUser",
    "get_current_user",
    "require_auth",
    "require_superuser",
    "require_admin_auth",
]
