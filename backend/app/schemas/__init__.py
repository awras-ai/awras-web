"""Schemas module."""

from app.schemas.auth import (
    AuthResponse,
    MessageResponse,
    ResendVerification,
    UserLogin,
    UserRegister,
    UserResponse,
)
from app.schemas.email_subscription import (
    EmailSubscriptionCreate,
    EmailSubscriptionResponse,
    SubscriptionCountResponse,
)
from app.schemas.dictionary import (
    AnnotationResponse,
    CreateDatasetRequest,
    CreateEntryRequest,
    DatasetListResponse,
    DatasetResponse,
    DatasetStatsDetailResponse,
    DatasetStatsResponse,
    EntryResponse,
    SearchEntriesResponse,
    SubmitAnnotationRequest,
    UploadErrorItem,
    UploadResponse,
    UserDatasetStatsResponse,
    UserEntriesResponse,
)

__all__ = [
    # Auth schemas
    "AuthResponse",
    "MessageResponse",
    "ResendVerification",
    "UserLogin",
    "UserRegister",
    "UserResponse",
    # Email subscription schemas
    "EmailSubscriptionCreate",
    "EmailSubscriptionResponse",
    "SubscriptionCountResponse",
    # Dictionary schemas
    "AnnotationResponse",
    "CreateDatasetRequest",
    "CreateEntryRequest",
    "DatasetListResponse",
    "DatasetResponse",
    "DatasetStatsDetailResponse",
    "DatasetStatsResponse",
    "EntryResponse",
    "SearchEntriesResponse",
    "SubmitAnnotationRequest",
    "UploadErrorItem",
    "UploadResponse",
    "UserDatasetStatsResponse",
    "UserEntriesResponse",
]
