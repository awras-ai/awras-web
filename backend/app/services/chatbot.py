"""
Service layer for chatbot business logic.
"""

import logging
from openai import AsyncOpenAI
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class ChatbotService:
    """Service for handling chatbot operations with DeepSeek model."""

    def __init__(self):
        """Initialize OpenAI client with DeepSeek configuration."""
        if settings.MODEL_CUSTOM_HEADER_KEY and settings.MODEL_CUSTOM_HEADER_VALUE:
            self.client = AsyncOpenAI(
                api_key=settings.MODEL_API_KEY,
                base_url=settings.MODEL_BASE_URL,
                default_headers={
                    settings.MODEL_CUSTOM_HEADER_KEY: settings.MODEL_CUSTOM_HEADER_VALUE
                },
            )
        else:
            self.client = AsyncOpenAI(
                api_key=settings.MODEL_API_KEY,
                base_url=settings.MODEL_BASE_URL,
            )
        self.model = settings.MODEL_NAME

    async def generate_response(self, message: str) -> str:
        """
        Generate a response from the Openai compatible model.

        Args:
            message: User message

        Returns:
            Model response as string
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": message},
                ],
                temperature=settings.MODEL_TEMPERATURE,
                max_tokens=1024,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Sorry, I encountered an error: {str(e)}"

    async def generate_streaming_response(self, message: str):
        """
        Generate a streaming response from the Openai compatible model.

        Args:
            message: User message

        Yields:
            Chunks of the response as they become available
        """
        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": message},
                ],
                temperature=settings.MODEL_TEMPERATURE,
                max_tokens=1024,
                stream=True,
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error generating streaming response: {str(e)}")
            yield f"Sorry, I encountered an error: {str(e)}"
