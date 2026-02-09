"""Chainlit data layer configuration."""

from chainlit.data.sql_alchemy import SQLAlchemyDataLayer
from app.core.config import get_settings

_settings = get_settings()


def get_data_layer() -> SQLAlchemyDataLayer:
    """
    Get the Chainlit SQLAlchemy data layer instance.

    Returns:
        SQLAlchemyDataLayer: Configured data layer for persisting
        users, threads, steps, and feedback.
    """
    return SQLAlchemyDataLayer(
        conninfo=_settings.DATABASE_URL,
        # user_thread_limit=1000,
    )
