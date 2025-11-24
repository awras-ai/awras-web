"""
Main FastAPI application.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.limiter import limiter
from app.db.database import init_db
from app.api.v1 import api_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    print("✓ Application started")
    print("⚠ Run migrations with: uv run alembic upgrade head")
    yield
    # Shutdown: cleanup if needed
    print("✓ Application shutdown")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AWRAS API for managing email subscriptions and waitlist",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Health"])
@limiter.limit("10/second")
async def root(request: Request):
    """Root endpoint - API health check."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "healthy",
    }


@app.get("/health", tags=["Health"])
@limiter.limit("10/second")
async def health_check(request: Request):
    """Health check endpoint."""
    return {"status": "healthy"}
