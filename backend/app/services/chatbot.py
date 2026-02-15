"""
Service layer for chatbot business logic.
"""

import logging
from typing import Any
from langfuse.openai import AsyncOpenAI
from langfuse import Langfuse
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize Langfuse client
langfuse = Langfuse(
    public_key=settings.LANGFUSE_PUBLIC_KEY,
    secret_key=settings.LANGFUSE_SECRET_KEY,
    host=settings.LANGFUSE_BASE_URL,
)

# Fetch prompt from Langfuse cloud
langfuse_prompt = langfuse.get_prompt("awras-chat-prompt")

# Global system prompt - compiled from Langfuse or fallback
SYSTEM_PROMPT = (
    langfuse_prompt.compile()
    if langfuse_prompt
    else """نتا هو "أوراس شات" (Awras Chat)، مساعد ذكي جزائري مخدوم باش يعاون الناس.

القواعد اللي لازم تمشي عليها:
1. **الهدرة:** جاوب ديما باللهجة الجزائرية (الدارجة) وتكتب بالحروف العربية، إلا إذا طلب منك المستخدم لغة خلاف.
2. **الشخصية:** نتا خدوم، ظريف، ومحترم (كيما "وليد فاميليا"). هدرتك تكون طبيعية ومفهومة، ماشي "روبو".
3. **الثقافة:** نتا تفهم العقلية الجزائرية مليح، تعرف الأمثال الشعبية، الماكلة (كيما الكسكسي، الرشتة، المحاجب)، وتعرف الولايات والعادات والتقاليد تاعنا.
4. **السياق:** إذا كاين كلمة تقنية واعرة، بسطها واشرحها بالدارجة.
5. **اللغات لخرين:** إذا هدر معاك واحد بالفرنسية ولا بلونجلي، فهمو وجاوبو بالدارجة، غير إذا قالك "جاوبني بلونجلي".
6. **المصداقية:** إذا ما فهمتش السؤال ولا جاتك الحاجة مخلطة، ما تخرطش من راسك. قول بصراحة: "سمحلي، ما فهمتش مليح واش راك تقصد. تقدر تزيد توضحلي؟"

مهمتك هي تفيد المستخدم وتعطيه معلومة صحيحة وسهلة."""
)


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

    async def generate_response(
        self, messages: list[Any], user_id: str = "anonymous", thread_id: str = ""
    ) -> str:
        """
        Generate a response from the Openai compatible model.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            user_id: User identifier for Langfuse tracing
            thread_id: Thread/session identifier for Langfuse tracing

        Returns:
            Model response as string
        """
        try:
            # Build kwargs for the API call
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": settings.MODEL_TEMPERATURE,
                "max_tokens": settings.MODEL_MAX_TOKENS,
                "metadata": {
                    "langfuse_user_id": user_id,
                    "langfuse_session_id": thread_id,
                },
            }

            # Add prompt reference if available (links generation to prompt in Langfuse)
            if langfuse_prompt:
                kwargs["langfuse_prompt"] = langfuse_prompt

            response = await self.client.chat.completions.create(**kwargs)
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return (
                "Sorry, I encountered an error, please try creating a new conversation."
            )

    async def generate_streaming_response(
        self, messages: list[Any], user_id: str = "anonymous", thread_id: str = ""
    ):
        """
        Generate a streaming response from the Openai compatible model.

        Args:
            messages: List of message dicts with 'role' and 'content' keys
            user_id: User identifier for Langfuse tracing
            thread_id: Thread/session identifier for Langfuse tracing

        Yields:
            Chunks of the response as they become available
        """
        try:
            # Build kwargs for the API call
            kwargs = {
                "model": self.model,
                "messages": messages,
                "temperature": settings.MODEL_TEMPERATURE,
                "max_tokens": settings.MODEL_MAX_TOKENS,
                "stream": True,
                "metadata": {
                    "langfuse_user_id": user_id,
                    "langfuse_session_id": thread_id,
                },
            }

            # Add prompt reference if available (links generation to prompt in Langfuse)
            if langfuse_prompt:
                kwargs["langfuse_prompt"] = langfuse_prompt

            stream = await self.client.chat.completions.create(**kwargs)
            async for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error generating streaming response: {str(e)}")
            yield "Sorry, I encountered an error, please try creating a new conversation."
