"""
Chainlit chatbot application integrated with DeepSeek AI.
"""

import chainlit as cl
from app.services.chatbot import ChatbotService
from app.core.config import get_settings

settings = get_settings()


@cl.on_chat_start
async def start_chat():
    """Initialize chatbot service when chat starts."""
    # Check if API key is configured
    if not settings.DEEPSEEK_API_KEY:
        await cl.Message(
            content="⚠️ DeepSeek API key is not configured. Please set DEEPSEEK_API_KEY environment variable."
        ).send()
        return

    # Initialize chatbot service
    chatbot = ChatbotService()
    cl.user_session.set("chatbot", chatbot)

    # Send welcome message
    welcome_msg = "Hello! I'm your AI assistant powered by DeepSeek. How can I help you today?"
    await cl.Message(content=welcome_msg).send()


@cl.on_message
async def handle_message(message: cl.Message):
    """Handle incoming user messages."""
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
    response_text = ""
    async for chunk in chatbot.generate_streaming_response(message.content):
        response_text += chunk
        await msg.stream_token(chunk)

    # Finalize the message
    await msg.update()