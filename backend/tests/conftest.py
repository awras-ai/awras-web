"""
Pytest configuration and fixtures.
"""

import os
import uuid
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from httpx import ASGITransport, AsyncClient
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from unittest.mock import patch

os.environ["CORS_ORIGINS"] = '["http://localhost:3000"]'
os.environ["SESSION_COOKIE_SECURE"] = "false"
os.environ["GOOGLE_CLIENT_ID"] = "test-client-id"
os.environ["GOOGLE_CLIENT_SECRET"] = "test-client-secret"
os.environ["GOOGLE_REDIRECT_URI"] = "http://localhost:8000/api/v1/auth/google/callback"
os.environ["REQUIRE_EMAIL_VERIFICATION"] = "false"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["OAUTH_SUCCESS_REDIRECT"] = "/goodbye"
os.environ["LANGFUSE_PUBLIC_KEY"] = "test-public-key"
os.environ["LANGFUSE_SECRET_KEY"] = "test-secret-key"
os.environ["MODEL_API_KEY"] = "test-model-key"


@pytest.fixture(scope="session")
def postgres_container():
    """Start an isolated PostgreSQL container for tests."""
    from testcontainers.postgres import PostgresContainer

    postgres = PostgresContainer("postgres:15-alpine")
    postgres.start()

    os.environ["DATABASE_URL"] = postgres.get_connection_url()
    print(f"database url : {os.environ['DATABASE_URL']}")

    yield postgres
    postgres.stop()


@pytest.fixture(scope="session")
def redis_container():
    """Start an isolated Redis container for tests."""
    from testcontainers.redis import RedisContainer

    redis = RedisContainer("redis:7-alpine")
    redis.start()

    host = redis.get_container_host_ip()
    port = redis.get_exposed_port(6379)
    os.environ["REDIS_URL"] = f"redis://{host}:{port}"
    print(f"redis url : {os.environ['REDIS_URL']}")

    yield redis
    redis.stop()


@pytest.fixture(autouse=True)
def flush_redis(redis_container):
    """Flush Redis before each test to reset rate limit counters."""
    client = redis_container.get_client()
    client.flushall()
    yield


@pytest.fixture(scope="function")
def db_engine(postgres_container):
    """Create a test database engine."""
    from app.core.config import get_settings
    from app.db.database import Base

    settings = get_settings()

    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
    )

    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


@pytest.fixture(scope="function")
def db_session_factory(db_engine):
    """Create a session factory for tests."""
    return sessionmaker(autocommit=False, autoflush=False, bind=db_engine)


@pytest.fixture(scope="function")
def db_session(db_session_factory) -> Generator[Session, None, None]:
    """Create a database session for a test."""
    session = db_session_factory()
    yield session
    session.rollback()
    session.close()


@pytest.fixture(scope="session")
def test_app_fixture(postgres_container, redis_container):
    """Create the test FastAPI application."""
    from app.core.config import get_settings
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    import app.core.limiter as limiter_module

    settings = get_settings()

    # Replace the module-level limiter with a Redis-backed one pointing at
    # the isolated test container so rate limits don't hit production Redis.
    test_limiter = Limiter(
        key_func=get_remote_address,
        storage_uri=os.environ.get("REDIS_URL"),
    )
    limiter_module.limiter = test_limiter

    # Import router AFTER patching so the decorator references pick up the new limiter
    from app.api.v1 import api_router

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        yield

    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description="AWRAS API Test",
        lifespan=lifespan,
    )

    app.state.limiter = test_limiter

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    return app


@pytest_asyncio.fixture(scope="function")
async def client(
    test_app_fixture, db_session_factory
) -> AsyncGenerator[AsyncClient, None]:
    """Create an async HTTP client for testing the API."""
    from app.db.database import get_db

    async def override_get_db():
        session = db_session_factory()
        try:
            yield session
        finally:
            session.close()

    test_app_fixture.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=test_app_fixture)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    test_app_fixture.dependency_overrides.clear()


@pytest.fixture
def test_user_data() -> dict:
    """Return test user registration data."""
    return {
        "first_name": "Test",
        "last_name": "User",
        "identifier": f"testuser_{uuid.uuid4().hex[:8]}",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "password": "TestPassword123!",
    }
