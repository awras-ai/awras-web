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
import random


# Maximum number of messages to keep in context window (excluding system prompt)
MAX_CONTEXT_MESSAGES = 4


# =============================================================================
# CHAINLIT CONFIGURATION
# =============================================================================
@cl.set_starters
async def set_starters():
    # --- Translation Variations (Long but simple) ---
    translation_options = [
        # Engineering
        "ترجم هادي من لونجلي للدارجة: 'Engineering is a very broad field that is not just about building machines or bridges; it is actually about using science and creativity to find smart solutions for complex problems so that we can help people live better and more comfortable lives every single day.'",
        
        # Life
        "ترجم هادي من لونجلي للدارجة: 'Life is like a very long and unpredictable road with many different turns and challenges; even when things get difficult, you should always try to enjoy the small moments of happiness and keep a positive mindset for a brighter future ahead of you.'",
        
        # Student Life
        "ترجم هادي من لونجلي للدارجة: 'Being a university student is one of the most exciting experiences in a person's life because you have the chance to learn new things daily, discover your true passions, and meet many different people who might end up becoming your best friends for the rest of your life.'",
        
        # Choice (Technology & Society)
        "ترجم هادي من لونجلي للدارجة: 'Technology is changing the world at an incredible speed, and while it makes communication much easier than before, we must learn how to use these powerful tools responsibly to make sure we create a balanced and helpful environment for everyone in our community.'"
    ]
    # --- Technical / AI Variations ---
    tech_options = [
        {"label": "What is AI?", "msg": "واش هو الذكاء الاصطناعي، أشرحلي ببساطة.", "icon": "https://cdn-icons-png.flaticon.com/512/2103/2103633.png"},
        {"label": "What is the Cloud?", "msg": "شنو هو الكلاود (Cloud) وعلاش الشركات كامل راهي تخدم بيه دروك؟", "icon": "https://cdn-icons-png.flaticon.com/512/4149/4149661.png"},
        {"label": "How to learn Coding?", "msg": "حبيت نبدا نتعلم البرمجة، واش هي أحسن لغة نبدا بيها للمبتدئين؟", "icon": "https://cdn-icons-png.flaticon.com/512/2463/2463321.png"},
        {"label": "What is Open Source?", "msg": "واش معناها 'أوبن سورس' (Open Source) وعلاش مهم للمطورين؟", "icon": "https://cdn-icons-png.flaticon.com/512/25/25231.png"}
    ]

    # --- Recipe Variations ---
    recipe_options = [
        {"label": "Mhajeb Recipe", "msg": "شهيت المحاجب، كيفاش نطيبهم؟ عطيني الوصفة والخطوات.", "icon": "https://cdn-icons-png.flaticon.com/512/3448/3448099.png"},
        {"label": "Harira Recipe", "msg": "كيفاش ندير حريرة وهرانية بنينة؟ عطيني المقادير وطريقة التحضير.", "icon": "https://cdn-icons-png.flaticon.com/512/3448/3448099.png"},
        {"label": "Chorba Recipe", "msg": "حبيت نطيب شربة فريك عاصمية، واش هي الطريقة الصحيحة باش تجي خاثرة؟", "icon": "https://cdn-icons-png.flaticon.com/512/3448/3448099.png"},
        {"label": "Couscous Recipe", "msg": "عطيني أسرار كسكس بالخضر والمرقة الحمراء، كيفاش نفور الطعام باش يجي طري؟", "icon": "https://cdn-icons-png.flaticon.com/512/3448/3448099.png"}
    ]

    selected_tech = random.choice(tech_options)
    selected_recipe = random.choice(recipe_options)

    return [
        cl.Starter(
            label="Translate to Darija",
            message=random.choice(translation_options),
            icon="https://cdn-icons-png.flaticon.com/512/3898/3898082.png",
        ),
        cl.Starter(
            label=selected_recipe["label"],
            message=selected_recipe["msg"],
            icon=selected_recipe["icon"],
        ),
        cl.Starter(
            label=selected_tech["label"],
            message=selected_tech["msg"],
            icon=selected_tech["icon"],
        ),
        cl.Starter(
            label="Who are you?",
            message="شكون نتا؟ حكيلي شوية على روحك واش تقدر دير.",
            icon="https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
        ),
    ]
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
    # await cl.Message(content=welcome_msg).send()


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
