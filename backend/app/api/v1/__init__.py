"""
API v1 router aggregation.
"""

from fastapi import APIRouter
from app.api.v1 import auth, email_subscription, translation, dictionary

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(auth.router)
api_router.include_router(email_subscription.router)
api_router.include_router(translation.router)
api_router.include_router(dictionary.router)
