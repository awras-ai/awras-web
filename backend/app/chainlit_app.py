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
from app.services.chatbot import ChatbotService, SYSTEM_PROMPT
from app.core.config import get_settings


# Maximum number of messages to keep in context window (excluding system prompt)
MAX_CONTEXT_MESSAGES = 6


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

    # Get thread_id and user_id for Langfuse tracing
    thread_id = cl.context.session.thread_id
    user_id = user.identifier if user else "anonymous"
    cl.user_session.set("thread_id", thread_id)
    cl.user_session.set("user_id", user_id)

    first_name = user.metadata.get("first_name") if user else None
    last_name = user.metadata.get("last_name") if user else None
    full_name = (
        f"{first_name} {last_name}".strip() if first_name and last_name else None
    )
    name = full_name or (user.identifier if user else "khoya/khti")

    # Message: "Welcome [Name]! I am Awras Chat. I'm here to answer your questions in Darija. What do you want to ask today?"
    welcome_msg = f"مرحبا {name}! أنا أوراس شات (Awras Chat). راني هنا باش نعاونك ونجاوبك بالدارجة. واش راك حاب تسقسي ليوم؟"

    # Initialize conversation history with proper role alternation:
    # 1. System prompt (user role)
    # 2. Welcome message (assistant role) - ensures proper user/assistant alternation
    conversation_history = [
        {"role": "user", "content": SYSTEM_PROMPT},
        {"role": "assistant", "content": welcome_msg},
    ]
    cl.user_session.set("conversation_history", conversation_history)

    # Display welcome message to user (UI only, already in conversation history)
    await cl.Message(content=welcome_msg).send()


@cl.on_message
async def handle_message(message: cl.Message):
    """
    Handle incoming user messages with streaming response.

    Args:
        message: The user's message object
    """
    # Get chatbot service and conversation history from session
    chatbot = cl.user_session.get("chatbot")
    if not chatbot:
        chatbot = ChatbotService()

    conversation_history = cl.user_session.get("conversation_history", [])
    if not conversation_history:
        # Initialize with system prompt if not set
        conversation_history = [{"role": "user", "content": SYSTEM_PROMPT}]

    # Add current user message to conversation history
    conversation_history.append({"role": "user", "content": message.content})

    # Determine which messages to send to the model
    # If total messages (including system) < 7 (6 exchanges), send all
    # Otherwise, send system prompt (first message) + last 6 messages
    if len(conversation_history) <= MAX_CONTEXT_MESSAGES + 1:
        messages_to_send = conversation_history.copy()
    else:
        # Always include system prompt (first message) + last 6 messages
        messages_to_send = [conversation_history[0]] + conversation_history[
            -MAX_CONTEXT_MESSAGES:
        ]

    # Create a message object for streaming response
    msg = cl.Message(content="")
    await msg.send()

    # Get user_id and thread_id for Langfuse tracing
    user_id = cl.user_session.get("user_id", "anonymous")
    thread_id = cl.user_session.get("thread_id", "")

    # Collect the full response
    full_response = ""

    # Generate streaming response with tracing
    async for chunk in chatbot.generate_streaming_response(
        messages_to_send, user_id=user_id, thread_id=thread_id
    ):
        await msg.stream_token(chunk)
        full_response += chunk

    # Finalize the message
    await msg.update()

    # Add assistant response to conversation history
    conversation_history.append({"role": "assistant", "content": full_response})

    # Save updated conversation history
    cl.user_session.set("conversation_history", conversation_history)


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

    # Get thread_id and user_id for Langfuse tracing
    thread_id = cl.context.session.thread_id
    user_id = user.identifier if user else "anonymous"
    cl.user_session.set("thread_id", thread_id)
    cl.user_session.set("user_id", user_id)

    # Get user info for welcome message
    first_name = user.metadata.get("first_name") if user else None
    last_name = user.metadata.get("last_name") if user else None
    full_name = (
        f"{first_name} {last_name}".strip() if first_name and last_name else None
    )
    name = full_name or (user.identifier if user else "khoya/khti")

    # Welcome message
    welcome_msg = f"مرحبا {name}! أنا أوراس شات (Awras Chat). راني هنا باش نعاونك ونجاوبك بالدارجة. واش راك حاب تسقسي ليوم؟"

    # Reset conversation history with proper role alternation for resumed conversation
    # 1. System prompt (user role)
    # 2. Welcome message (assistant role) - ensures proper user/assistant alternation
    conversation_history = [
        {"role": "user", "content": SYSTEM_PROMPT},
        {"role": "assistant", "content": welcome_msg},
    ]
    cl.user_session.set("conversation_history", conversation_history)

    # Note: Conversation history is automatically loaded by Chainlit
    # from the data layer based on the thread ID, but we start fresh
    # with the system prompt and welcome message to provide context


@cl.on_chat_end
async def on_chat_end():
    """Clean up when a chat session ends."""
    if cl.user_session.get("chatbot"):
        cl.user_session.set("chatbot", None)
