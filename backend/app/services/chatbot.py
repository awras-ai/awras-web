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
        self.client = AsyncOpenAI(
            api_key=settings.DEEPSEEK_API_KEY,
            base_url=settings.DEEPSEEK_BASE_URL,
        )
        self.model = "deepseek-chat"  # DeepSeek model name

    async def generate_response(self, message: str) -> str:
        """
        Generate a response from the DeepSeek model.

        Args:
            message: User message

        Returns:
            Model response as string
        """
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """You are 'Awras-Chat', an AI assistant that communicates exclusively in Algerian Darija using Arabic script. Your goal is to be helpful and friendly while maintaining a natural Algerian tone. 
    
    Strict Rules:
    1. NEVER use Modern Standard Arabic (Fusha), English, or French unless specifically quoting something.
    2. Use common Algerian vocabulary (e.g., use 'wash raki' or 'wash rak' instead of 'kayfa haluka').
    3. If the user speaks in another language, you must still respond in Algerian Darija.
    4. Maintain the cultural nuances of Algeria in your helpfulness.""",
                    },
                    {"role": "user", "content": message},
                ],
                temperature=0.7,
                max_tokens=1024,
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return f"Sorry, I encountered an error: {str(e)}"

    async def generate_streaming_response(self, message: str):
        """
        Generate a streaming response from the DeepSeek model.

        Args:
            message: User message

        Yields:
            Chunks of the response as they become available
        """
        try:
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": message},
                ],
                temperature=0.7,
                max_tokens=1024,
                stream=True,
            )
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error generating streaming response: {str(e)}")
            yield f"Sorry, I encountered an error: {str(e)}"
