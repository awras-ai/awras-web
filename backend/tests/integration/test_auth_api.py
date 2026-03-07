"""
Integration tests for authentication API endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, test_user_data: dict):
    """Test successful user registration."""
    response = await client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == test_user_data["email"]
    assert data["user"]["identifier"] == test_user_data["identifier"]


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, test_user_data: dict):
    """Test registration with duplicate email."""
    await client.post("/api/v1/auth/register", json=test_user_data)

    response = await client.post("/api/v1/auth/register", json=test_user_data)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    """Test registration with invalid email."""
    invalid_data = {
        "first_name": "Test",
        "last_name": "User",
        "identifier": "testuser",
        "email": "not-an-email",
        "password": "TestPassword123!",
    }
    response = await client.post("/api/v1/auth/register", json=invalid_data)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, test_user_data: dict):
    """Test successful login."""
    await client.post("/api/v1/auth/register", json=test_user_data)

    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == test_user_data["email"]


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient, test_user_data: dict):
    """Test login with invalid credentials."""
    await client.post("/api/v1/auth/register", json=test_user_data)

    login_data = {
        "email": test_user_data["email"],
        "password": "wrong_password",
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    """Test login with non-existent user."""
    login_data = {
        "email": "nonexistent@example.com",
        "password": "somepassword",
    }
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, test_user_data: dict):
    """Test logout endpoint."""
    register_response = await client.post("/api/v1/auth/register", json=test_user_data)
    cookies = register_response.cookies

    response = await client.post(
        "/api/v1/auth/logout",
        cookies=cookies,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient, test_user_data: dict):
    """Test get current user when authenticated."""
    register_response = await client.post("/api/v1/auth/register", json=test_user_data)
    cookies = register_response.cookies

    response = await client.get("/api/v1/auth/me", cookies=cookies)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user_data["email"]


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    """Test get current user when not authenticated."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_session_cookie_set_after_login(
    client: AsyncClient, test_user_data: dict
):
    """Test that session cookie is set after login."""
    await client.post("/api/v1/auth/register", json=test_user_data)

    login_data = {
        "email": test_user_data["email"],
        "password": test_user_data["password"],
    }
    response = await client.post("/api/v1/auth/login", json=login_data)

    assert "awras_session_id" in response.cookies


@pytest.mark.asyncio
async def test_user_count(client: AsyncClient):
    """Test user count endpoint."""
    response = await client.get("/api/v1/auth/count")
    assert response.status_code == 200
    data = response.json()
    assert "count" in data
