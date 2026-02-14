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
# @cl.set_starters
# async def set_starters():
#     return [
#         cl.Starter(
#             label="Translate to Darija",
#             # "Translate this from English to Darija: 'Welcome to the team...'"
#             message="ترجم هادي من لونجلي للدارجة: 'Welcome to the team, we are happy to have you.'",
#             icon="/public/learn.svg",
#         ),
#         cl.Starter(
#             label="Who are you?",
#             # "Who are you? Tell me about yourself and what you can do."
#             message="شكون نتا؟ حكيلي شوية على روحك واش تقدر دير.",
#             icon="/public/user.svg",
#         ),
#         cl.Starter(
#             label="Mhajeb Recipe",
#             # "I'm craving Mhajeb, how do I make them? Give me the recipe."
#             message="شهيت المحاجب، كيفاش نطيبهم؟ عطيني الوصفة والخطوات.",
#             icon="/public/idea.svg",
#         ),
#         cl.Starter(
#             label="Tell me a joke",
#             # "Tell me a funny joke to make me laugh a bit."
#             message="حكيلي كاش نكتة شابة باش نضحك شوية.",
#             icon="/public/smiley.svg",
#         ),
#     ]


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
    user = cl.user_session.get("user")
    chatbot = ChatbotService()
    cl.user_session.set("chatbot", chatbot)

    first_name = user.metadata.get("first_name") if user else None
    last_name = user.metadata.get("last_name") if user else None
    full_name = (
        f"{first_name} {last_name}".strip() if first_name and last_name else None
    )
    name = full_name or (user.identifier if user else "khoya/khti")

    # Message: "Welcome [Name]! I am Awras Chat. I'm here to answer your questions in Darija. What do you want to ask today?"
    welcome_msg = f"مرحبا {name}! أنا أوراس شات (Awras Chat). راني هنا باش نعاونك ونجاوبك بالدارجة. واش راك حاب تسقسي ليوم؟"

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
        chatbot = ChatbotService()

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
    chatbot = ChatbotService()
    cl.user_session.set("chatbot", chatbot)

    # Conversation history is automatically loaded by Chainlit
    # from the data layer based on the thread ID


@cl.on_chat_end
async def on_chat_end():
    """Clean up when a chat session ends."""
    if cl.user_session.get("chatbot"):
        cl.user_session.set("chatbot", None)
