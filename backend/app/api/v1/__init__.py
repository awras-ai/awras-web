"""
API v1 router aggregation.
"""
from fastapi import APIRouter
from app.api.v1 import email_subscription

api_router = APIRouter()

# Include all v1 routers
api_router.include_router(email_subscription.router)
