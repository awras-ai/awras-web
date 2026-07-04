"""
Pydantic schemas for Dictionary API.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# =============================================================================
# Dataset Schemas
# =============================================================================


class CreateDatasetRequest(BaseModel):
    """Request schema for creating a new dictionary dataset."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Dataset name",
    )
    language: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Language code (e.g., 'ar', 'en')",
    )
    description: Optional[str] = Field(
        None,
        description="Optional dataset description",
    )
    category: Optional[str] = Field(
        None,
        max_length=100,
        description="Optional category (e.g., 'medical', 'technical')",
    )


class DatasetResponse(BaseModel):
    """Response schema for a dictionary dataset."""

    id: UUID = Field(..., description="Dataset unique ID")
    name: str = Field(..., description="Dataset name")
    description: Optional[str] = Field(None, description="Dataset description")
    language: str = Field(..., description="Language code")
    category: Optional[str] = Field(None, description="Dataset category")
    created_by_id: Optional[UUID] = Field(None, description="Creator user ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True


class DatasetListResponse(BaseModel):
    """Response schema for listing datasets."""

    datasets: list[DatasetResponse] = Field(..., description="List of datasets")
    total: int = Field(..., description="Total number of datasets")


# =============================================================================
# Entry Schemas
# =============================================================================


class AnnotationResponse(BaseModel):
    """Response schema for an annotation."""

    id: UUID = Field(..., description="Annotation unique ID")
    corrected_meaning: Optional[str] = Field(
        None, description="Corrected meaning/definition"
    )
    corrected_examples: Optional[str] = Field(None, description="Corrected examples")
    corrected_tags: Optional[list[str]] = Field(None, description="Corrected tags")
    notes: Optional[str] = Field(None, description="Optional notes")
    user_id: UUID = Field(..., description="User who made the annotation")
    created_at: datetime = Field(..., description="Annotation creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")

    class Config:
        from_attributes = True


class EntryResponse(BaseModel):
    """Response schema for a dictionary entry."""

    id: UUID = Field(..., description="Entry unique ID")
    dataset_id: UUID = Field(..., description="Dataset ID")
    word: str = Field(..., description="The word")
    meaning: str = Field(..., description="Definition/meaning")
    examples: Optional[str] = Field(None, description="Example usage")
    tags: Optional[list[str]] = Field(None, description="Tags")
    is_user_submitted: bool = Field(
        ..., description="Whether this was submitted by a user"
    )
    created_by_id: Optional[UUID] = Field(None, description="Creator user ID")
    status: str = Field(..., description="Entry status ('pending' or 'completed')")
    created_at: datetime = Field(..., description="Entry creation timestamp")
    annotation: Optional[AnnotationResponse] = Field(
        None, description="Annotation (if completed and belongs to current user)"
    )

    class Config:
        from_attributes = True


class CreateEntryRequest(BaseModel):
    """Request schema for creating a new dictionary entry."""

    dataset_id: UUID = Field(..., description="Dataset ID to add entry to")
    word: str = Field(..., min_length=1, description="The word")
    meaning: str = Field(..., min_length=1, description="Definition/meaning")
    examples: Optional[str] = Field(None, description="Optional example usage")
    tags: Optional[list[str]] = Field(None, description="Optional list of tags")


class SearchEntriesResponse(BaseModel):
    """Response schema for search results."""

    entries: list[EntryResponse] = Field(..., description="List of matching entries")
    total: int = Field(..., description="Total number of matches")
    query: str = Field(..., description="Search query used")


class UserEntriesResponse(BaseModel):
    """Response schema for user's submitted and annotated entries."""

    submitted_entries: list[EntryResponse] = Field(
        ..., description="Entries submitted by the user"
    )
    annotated_entries: list[EntryResponse] = Field(
        ..., description="Entries annotated by the user"
    )


# =============================================================================
# Annotation Schemas
# =============================================================================


class SubmitAnnotationRequest(BaseModel):
    """Request schema for submitting an annotation."""

    confirmed: bool = Field(
        False,
        description="Set to true to confirm the entry as-is (no corrections needed)",
    )
    corrected_meaning: Optional[str] = Field(
        None, max_length=10000, description="Corrected meaning/definition"
    )
    corrected_examples: Optional[str] = Field(
        None, max_length=5000, description="Corrected examples"
    )
    corrected_tags: Optional[list[str]] = Field(None, description="Corrected tags list")
    notes: Optional[str] = Field(
        None, max_length=2000, description="Optional notes about the correction"
    )


# =============================================================================
# Statistics Schemas
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
    pending_count: int = Field(..., description="Number of pending entries")
    completed_count: int = Field(..., description="Number of completed entries")
    completion_percentage: float = Field(
        ...,
        description="Completion percentage (0-100)",
    )
    annotated_by_user: int = Field(
        ...,
        description="Number of entries annotated by current user",
    )
    submitted_count: int = Field(
        ...,
        description="Number of entries submitted by current user",
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
