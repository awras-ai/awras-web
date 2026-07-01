"""
API v1 router aggregation.
"""

from fastapi import APIRouter
from app.api.v1 import translation, dictionary, count

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(translation.router)
api_router.include_router(dictionary.router)
api_router.include_router(count.router)
