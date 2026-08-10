"""
Pydantic schemas for Translation API.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# =============================================================================
# Dataset Schemas
# =============================================================================


class CreateDatasetRequest(BaseModel):
    """Request schema for creating a new dataset."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Dataset name",
    )
    source_language: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Source language code (e.g., 'en')",
    )
    target_language: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Target language code (e.g., 'ar')",
    )
    description: Optional[str] = Field(
        None,
        description="Optional dataset description",
    )
    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional category (e.g., 'medical', 'legal')",
    )


class DatasetResponse(BaseModel):
    """Response schema for a dataset."""

    id: UUID = Field(..., description="Dataset unique ID")
    name: str = Field(..., description="Dataset name")
    source_language: str = Field(..., description="Source language code")
    target_language: str = Field(..., description="Target language code")
    description: Optional[str] = Field(None, description="Dataset description")
    category: Optional[str] = Field(None, description="Dataset category")
    created_by_sub: Optional[str] = Field(None, description="Creator Keycloak sub")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    """Response schema for listing datasets."""

    datasets: list[DatasetResponse] = Field(..., description="List of datasets")
    total: int = Field(..., description="Total number of datasets")


# =============================================================================
# Dataset Statistics Schemas
# =============================================================================


class DatasetStatsResponse(BaseModel):
    """Response schema for dataset statistics (overall progress)."""

    total_entries: int = Field(..., description="Total number of entries")
    pending_count: int = Field(..., description="Number of pending entries")
    completed_count: int = Field(..., description="Number of completed entries")
    completion_percentage: float = Field(
        ...,
        description="Completion percentage (0-100)",
    )


class UserDatasetStatsResponse(BaseModel):
    """Response schema for user's personal statistics on a dataset."""

    total_entries: int = Field(..., description="Total number of entries in dataset")
    annotated_by_user: int = Field(
        ...,
        description="Number of entries annotated by current user",
    )
    remaining_for_user: int = Field(
        ...,
        description="Number of entries remaining for user to annotate",
    )
    user_completion_percentage: float = Field(
        ...,
        description="User's completion percentage (0-100)",
    )


class DatasetStatsDetailResponse(BaseModel):
    """Response schema with both overall and user-specific statistics."""

    dataset: DatasetResponse = Field(..., description="Dataset information")
    overall_stats: DatasetStatsResponse = Field(
        ...,
        description="Overall dataset statistics",
    )
    user_stats: UserDatasetStatsResponse = Field(
        ...,
        description="Current user's statistics on this dataset",
    )


# =============================================================================
# Entry Schemas
# =============================================================================


class AnnotationResponse(BaseModel):
    """Response schema for an annotation."""

    id: UUID = Field(..., description="Annotation unique ID")
    corrected_translation: str = Field(..., description="Corrected translation")
    notes: Optional[str] = Field(None, description="Optional notes")
    keycloak_sub: Optional[str] = Field(
        None, description="Keycloak subject (user ID) who made the annotation"
    )
    created_at: datetime = Field(..., description="Annotation creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True


class EntryResponse(BaseModel):
    """Response schema for a translation entry."""

    id: UUID = Field(..., description="Entry unique ID")
    source_text: str = Field(..., description="Original source text")
    reference_translation: str = Field(
        ...,
        description="Reference translation (provided)",
    )
    status: str = Field(..., description="Entry status ('pending' or 'completed')")
    dataset_id: UUID = Field(..., description="Dataset ID")
    created_at: datetime = Field(..., description="Entry creation timestamp")
    annotation: Optional[AnnotationResponse] = Field(
        None,
        description="Annotation (if completed and belongs to current user)",
    )

    class Config:
        from_attributes = True


# =============================================================================
# Annotation Schemas
# =============================================================================


class SubmitAnnotationRequest(BaseModel):
    """Request schema for submitting an annotation."""

    corrected_translation: str = Field(
        ...,
        min_length=1,
        max_length=10000,
        description="User's corrected translation",
    )
    notes: Optional[str] = Field(
        None,
        max_length=2000,
        description="Optional notes about the correction",
    )


# =============================================================================
# Upload Schemas
# =============================================================================


class UploadErrorItem(BaseModel):
    """Schema for individual upload error."""

    row: int = Field(..., description="Row number in CSV (1-indexed)")
    reason: str = Field(..., description="Error description")


class UploadResponse(BaseModel):
    """Response schema for CSV upload."""

    success_count: int = Field(
        ..., description="Number of successfully uploaded entries"
    )
    failed_count: int = Field(..., description="Number of failed entries")
    errors: list[UploadErrorItem] = Field(
        default_factory=list,
        description="List of errors (if any)",
    )
    message: str = Field(..., description="Human-readable summary message")
