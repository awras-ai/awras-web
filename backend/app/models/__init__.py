"""
Models module.

This module exports all SQLAlchemy models for the application.
Models are organized into:
- user.py: User authentication (User, Session)
- chainlit.py: Chainlit data layer (Thread, Step, Element, Feedback)
- email_subscription.py: Email subscriptions
- dataset.py: Annotation datasets
- translation_entry.py: Translation entries for text datasets
- translation_annotation.py: User corrections for translation entries
- voice_entry.py: Text prompts for voice datasets
- voice_annotation.py: User audio recordings for voice entries
- dictionary_entry.py: Dictionary word/translation pairs
- dictionary_annotation.py: User corrections for dictionary entries
"""

from app.models.email_subscription import EmailSubscription
from app.models.user import User, Session
from app.models.chainlit import Thread, Step, Element, Feedback
from app.models.dataset import Dataset
from app.models.translation_entry import TranslationEntry
from app.models.translation_annotation import TranslationAnnotation
from app.models.voice_entry import VoiceEntry
from app.models.voice_annotation import VoiceAnnotation
from app.models.dictionary_entry import DictionaryEntry
from app.models.dictionary_annotation import DictionaryAnnotation

__all__ = [
    # Auth models
    "User",
    "Session",
    # Chainlit data layer models
    "Thread",
    "Step",
    "Element",
    "Feedback",
    # Other models
    "EmailSubscription",
    # Annotation models
    "Dataset",
    "TranslationEntry",
    "TranslationAnnotation",
    "VoiceEntry",
    "VoiceAnnotation",
    "DictionaryEntry",
    "DictionaryAnnotation",
]
