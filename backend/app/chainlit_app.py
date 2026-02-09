"""
Chainlit chatbot application integrated with DeepSeek AI.

This module provides the main Chainlit application with:
- Authentication via session cookies (handled by header_auth_callback)
- Data persistence through SQLAlchemy data layer
- Streaming chat responses via DeepSeek AI
"""

from typing import Any, Optional
import chainlit as cl

from app.chainlit.data_layer import get_data_layer
from app.chainlit.auth import header_auth_callback
from app.services.chatbot import ChatbotService
from app.core.config import get_settings


# =============================================================================
# CHAINLIT CONFIGURATION
# =============================================================================


@cl.data_layer
def data_layer():
    """
    Configure the Chainlit data layer for persisting chat data.

    Returns:
        SQLAlchemyDataLayer: Configured data layer for users, threads,
        steps, and feedback persistence.
    """
    return get_data_layer()


@cl.header_auth_callback
def auth_callback(headers: dict) -> Optional[cl.User]:
    """
    Authenticate requests using session cookies from headers.

    Args:
        headers: HTTP headers including Cookie header

    Returns:
        Optional[cl.User]: Authenticated user or None if invalid.
        Returning None blocks access to the app.
    """
    return header_auth_callback(headers)


# =============================================================================
# CHAT LIFECYCLE HANDLERS
# =============================================================================


@cl.on_chat_start
async def start_chat():
    """
    Initialize chatbot service when a new chat session starts.

    Note: User is already authenticated by header_auth_callback.
    Chainlit blocks access if auth returns None.
    """
    settings = get_settings()
    user = cl.user_session.get("user")

    # Check if API key is configured
    if not settings.DEEPSEEK_API_KEY:
        await cl.Message(
            content="DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY environment variable."
        ).send()
        return

    # Initialize chatbot service
    chatbot = ChatbotService()
    cl.user_session.set("chatbot", chatbot)

    # Send personalized welcome message
    first_name = user.metadata.get("first_name") if user else None
    name = first_name or (user.identifier if user else "there")
    welcome_msg = f"Hello {name}! I'm your AI assistant powered by DeepSeek. How can I help you today?"
    await cl.Message(content=welcome_msg).send()


@cl.on_message
async def handle_message(message: cl.Message):
    """
    Handle incoming user messages with streaming response.

    Args:
        message: The user's message object
    """
    # Get chatbot service from session
    chatbot = cl.user_session.get("chatbot")
    if not chatbot:
        await cl.Message(
            content="Chatbot service not initialized. Please refresh the page."
        ).send()
        return

    # Create a message object for streaming response
    msg = cl.Message(content="")
    await msg.send()

    # Generate streaming response
    async for chunk in chatbot.generate_streaming_response(message.content):
        await msg.stream_token(chunk)

    # Finalize the message
    await msg.update()


@cl.on_chat_resume
async def on_chat_resume(thread: Any):
    """
    Resume a previous conversation from the database.

    This handler is called when a user clicks on a previous conversation
    in the chat history side panel.

    Args:
        thread: Dictionary containing thread metadata including id
    """
    user = cl.user_session.get("user")
    print(
        f"User {user.identifier if user else 'unknown'} resuming thread: {thread.get('id', 'unknown')}"
    )

    # Re-initialize chatbot service for resumed session
    settings = get_settings()
    if settings.DEEPSEEK_API_KEY:
        chatbot = ChatbotService()
        cl.user_session.set("chatbot", chatbot)

    # Conversation history is automatically loaded by Chainlit
    # from the data layer based on the thread ID


@cl.on_chat_end
async def on_chat_end():
    """Clean up when a chat session ends."""
    if cl.user_session.get("chatbot"):
        cl.user_session.set("chatbot", None)
