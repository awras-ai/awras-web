"""
Rate limiter configuration using Redis storage.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.config import get_settings

settings = get_settings()

# Initialize Redis-backed rate limiter
limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)
