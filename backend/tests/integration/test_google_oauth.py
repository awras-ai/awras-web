"""
Integration tests for Google OAuth API endpoints.
"""

import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient
import httpx


def _make_mock_http_client(token_response_data, user_response_data=None):
    """Build a mock httpx.AsyncClient context manager."""
    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 200
    mock_token_resp.json.return_value = token_response_data
    mock_token_resp.raise_for_status = MagicMock()

    mock_inner_client = AsyncMock()
    mock_inner_client.post = AsyncMock(return_value=mock_token_resp)

    if user_response_data is not None:
        mock_user_resp = MagicMock()
        mock_user_resp.status_code = 200
        mock_user_resp.json.return_value = user_response_data
        mock_user_resp.raise_for_status = MagicMock()
        mock_inner_client.get = AsyncMock(return_value=mock_user_resp)

    mock_cm = AsyncMock()
    mock_cm.__aenter__ = AsyncMock(return_value=mock_inner_client)
    mock_cm.__aexit__ = AsyncMock(return_value=None)

    return mock_cm


@pytest.mark.asyncio
async def test_google_login_redirect(client: AsyncClient):
    """Test that Google login redirects to Google's consent screen."""
    response = await client.get("/api/v1/auth/google/login", follow_redirects=False)
    assert response.status_code == 307
    assert "accounts.google.com" in response.headers.get("location", "")


@pytest.mark.asyncio
async def test_google_login_sets_state_cookie(client: AsyncClient):
    """Test that Google login sets state cookie."""
    response = await client.get("/api/v1/auth/google/login", follow_redirects=False)
    assert "google_oauth_state" in response.cookies


@pytest.mark.asyncio
async def test_google_callback_invalid_state(client: AsyncClient):
    """Test callback with invalid/missing state."""
    response = await client.get(
        "/api/v1/auth/google/callback",
        params={
            "code": "test_code",
            "state": "invalid_state",
        },
        follow_redirects=False,
    )
    assert response.status_code == 307
    assert "/login?error=oauth_state_mismatch" in response.headers.get("location", "")


@pytest.mark.asyncio
async def test_google_callback_missing_code(client: AsyncClient):
    """Test callback without authorization code."""
    response = await client.get(
        "/api/v1/auth/google/callback",
        params={"state": "test_state"},
        follow_redirects=False,
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_google_callback_success_new_user(client: AsyncClient):
    """Test successful OAuth callback creating a new user."""

    mock_google_token_response = {
        "access_token": "test_access_token",
        "token_type": "Bearer",
        "expires_in": 3600,
    }

    mock_google_user_response = {
        "id": "google_123456",
        "email": "newgoogleuser@gmail.com",
        "given_name": "Google",
        "family_name": "User",
        "picture": "https://lh3.googleusercontent.com/a/default",
    }

    mock_cm = _make_mock_http_client(
        mock_google_token_response, mock_google_user_response
    )

    with patch("app.api.v1.auth.httpx.AsyncClient", return_value=mock_cm):
        response = await client.get(
            "/api/v1/auth/google/callback",
            params={
                "code": "test_authorization_code",
                "state": "test_state",
            },
            cookies={"google_oauth_state": "test_state"},
            follow_redirects=False,
        )

        assert response.status_code == 307
        assert "/goodbye" in response.headers.get("location", "")
        assert "awras_session_id" in response.cookies


@pytest.mark.asyncio
async def test_google_callback_success_existing_user(client: AsyncClient, db_session):
    """Test OAuth callback when user already exists (linking account)."""
    from app.models.user import User

    existing_user = User(
        email="existing@gmail.com",
        identifier="existing",
        hashed_password="some_hash",
        is_verified=True,
        is_active=True,
    )
    db_session.add(existing_user)
    db_session.commit()

    mock_google_token_response = {
        "access_token": "test_access_token",
        "token_type": "Bearer",
    }

    mock_google_user_response = {
        "id": "google_789",
        "email": "existing@gmail.com",
        "given_name": "Updated",
        "family_name": "Name",
    }

    mock_cm = _make_mock_http_client(
        mock_google_token_response, mock_google_user_response
    )

    with patch("app.api.v1.auth.httpx.AsyncClient", return_value=mock_cm):
        response = await client.get(
            "/api/v1/auth/google/callback",
            params={
                "code": "test_code",
                "state": "test_state",
            },
            cookies={"google_oauth_state": "test_state"},
            follow_redirects=False,
        )

        assert response.status_code == 307


@pytest.mark.asyncio
async def test_google_callback_token_exchange_failure(client: AsyncClient):
    """Test callback when token exchange fails."""

    mock_token_resp = MagicMock()
    mock_token_resp.status_code = 400
    mock_token_resp.raise_for_status.side_effect = httpx.HTTPError(
        "Token exchange failed"
    )

    mock_inner_client = AsyncMock()
    mock_inner_client.post = AsyncMock(return_value=mock_token_resp)

    mock_cm = AsyncMock()
    mock_cm.__aenter__ = AsyncMock(return_value=mock_inner_client)
    mock_cm.__aexit__ = AsyncMock(return_value=None)

    with patch("app.api.v1.auth.httpx.AsyncClient", return_value=mock_cm):
        response = await client.get(
            "/api/v1/auth/google/callback",
            params={
                "code": "invalid_code",
                "state": "test_state",
            },
            cookies={"google_oauth_state": "test_state"},
            follow_redirects=False,
        )

        assert response.status_code == 307
        assert "oauth_http_error" in response.headers.get("location", "")


@pytest.mark.asyncio
async def test_google_login_not_configured(client: AsyncClient):
    """Test Google login when not configured."""
    from app.core.config import get_settings

    settings = get_settings()

    original_client_id = settings.GOOGLE_CLIENT_ID
    original_client_secret = settings.GOOGLE_CLIENT_SECRET

    with (
        patch.object(settings, "GOOGLE_CLIENT_ID", ""),
        patch.object(settings, "GOOGLE_CLIENT_SECRET", ""),
    ):
        response = await client.get("/api/v1/auth/google/login", follow_redirects=False)
        assert response.status_code == 503
        data = response.json()
        assert "not configured" in data["detail"].lower()
