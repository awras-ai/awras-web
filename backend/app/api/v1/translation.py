"""
Translation API endpoints for dataset management and annotation.
"""

from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.db.database import get_db
from app.deps.keycloak import require_auth, require_admin_auth, KeycloakUser
from app.schemas.translation import (
    AnnotationResponse,
    CreateDatasetRequest,
    DatasetListResponse,
    DatasetResponse,
    DatasetStatsDetailResponse,
    DatasetStatsResponse,
    EntryResponse,
    SubmitAnnotationRequest,
    UploadErrorItem,
    UploadResponse,
    UserDatasetStatsResponse,
)
from app.services.translation import TranslationService

router = APIRouter(prefix="/translation", tags=["Translation"])


# =============================================================================
# Dataset Management (Admin Only)
# =============================================================================


@router.post(
    "/datasets",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new translation dataset",
)
@limiter.limit("10/minute")
async def create_dataset(
    request: Request,
    data: CreateDatasetRequest,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_admin_auth),
) -> DatasetResponse:
    """
    Create a new translation dataset.

    **Requires admin authentication.**

    This endpoint allows administrators to create a new translation dataset
    with source and target language specifications.

    Args:
    - **name**: Dataset name (required)
    - **source_language**: Source language code (e.g., 'en')
    - **target_language**: Target language code (e.g., 'ar')
    - **description**: Optional description
    - **category**: Optional category (e.g., 'medical', 'legal')

    Returns:
    - **dataset**: Created dataset object

    Status codes:
    - 201: Dataset created successfully
    - 401: Not authenticated
    - 403: Not authorized (not admin)
    """
    # Convert Column[UUID] to UUID if needed
    created_by_id = user.sub if isinstance(user.sub, UUID) else user.sub
    dataset = TranslationService.create_dataset(
        db=db,
        name=data.name,
        source_language=data.source_language,
        target_language=data.target_language,
        description=data.description,
        category=data.category,
        created_by_id=created_by_id,
    )
    return dataset


@router.post(
    "/datasets/{dataset_id}/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload CSV file with translation entries",
)
@limiter.limit("5/minute")
async def upload_csv(
    request: Request,
    dataset_id: str,
    file: UploadFile,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_admin_auth),
) -> UploadResponse:
    """
    Upload a CSV file with translation entries.

    **Requires admin authentication.**

    The CSV file must have a header row with the following columns:
    - **source_text**: The original text to be translated
    - **reference_translation**: The provided reference translation

    Example CSV format:
    ```csv
    source_text,reference_translation
    Hello,مرحبا
    Goodbye,وداعا
    ```

    Args:
    - **dataset_id**: UUID of the target dataset
    - **file**: CSV file upload (multipart/form-data)

    Returns:
    - **success_count**: Number of entries successfully uploaded
    - **failed_count**: Number of entries that failed
    - **errors**: List of errors with row numbers
    - **message**: Human-readable summary

    Status codes:
    - 201: Upload completed (check errors for partial failures)
    - 400: Invalid CSV format or missing columns
    - 401: Not authenticated
    - 403: Not authorized (not admin)
    - 404: Dataset not found
    """
    # Validate file type
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file",
        )

    # Read file content
    content = await file.read()

    # Parse CSV
    try:
        entries = TranslationService.parse_csv_file(content)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    # check that dataset exist
    dataset = TranslationService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"there is no dataset with an id {dataset_id}",
        )
    # Upload entries
    result = TranslationService.upload_entries(db, dataset_id, entries)

    return UploadResponse(
        success_count=result["success_count"],
        failed_count=result["failed_count"],
        errors=[UploadErrorItem(**error) for error in result["errors"]],
        message=f"Successfully uploaded {result['success_count']} entries. "
        f"{result['failed_count']} entries failed.",
    )


# =============================================================================
# Dataset Reading (All Authenticated Users)
# =============================================================================


@router.get(
    "/datasets",
    response_model=DatasetListResponse,
    summary="List all translation datasets",
)
@limiter.limit("60/minute")
async def list_datasets(
    request: Request,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum records to return"),
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> DatasetListResponse:
    """
    List all available translation datasets.

    **Requires authentication.**

    Returns a paginated list of all datasets ordered by creation date (newest first).

    Args:
    - **skip**: Number of records to skip (pagination offset)
    - **limit**: Maximum number of records to return (1-100)

    Returns:
    - **datasets**: List of dataset objects
    - **total**: Total number of datasets

    Status codes:
    - 200: Datasets retrieved successfully
    - 401: Not authenticated
    """
    datasets = TranslationService.get_datasets(db, skip=skip, limit=limit)
    return DatasetListResponse(datasets=datasets, total=len(datasets))


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetResponse,
    summary="Get dataset by ID",
)
@limiter.limit("60/minute")
async def get_dataset(
    request: Request,
    dataset_id: str,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> DatasetResponse:
    """
    Get a specific translation dataset by its ID.

    **Requires authentication.**

    Args:
    - **dataset_id**: UUID of the dataset

    Returns:
    - **dataset**: Dataset object

    Status codes:
    - 200: Dataset found
    - 401: Not authenticated
    - 404: Dataset not found
    """
    dataset = TranslationService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )
    return dataset


@router.get(
    "/datasets/{dataset_id}/stats",
    response_model=DatasetStatsDetailResponse,
    summary="Get dataset statistics (overall and user-specific)",
)
@limiter.limit("30/minute")
async def get_dataset_stats(
    request: Request,
    dataset_id: str,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> DatasetStatsDetailResponse:
    """
    Get comprehensive statistics for a dataset.

    **Requires authentication.**

    Returns both overall dataset statistics and user-specific statistics showing:
    - Total entries vs. completed entries
    - User's personal progress on this dataset

    Args:
    - **dataset_id**: UUID of the dataset

    Returns:
    - **dataset**: Dataset information
    - **overall_stats**: Overall dataset completion statistics
    - **user_stats**: Current user's personal statistics

    Status codes:
    - 200: Statistics retrieved successfully
    - 401: Not authenticated
    - 404: Dataset not found
    """
    dataset = TranslationService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )

    # Get overall stats
    overall_stats = TranslationService.get_dataset_stats(db, dataset_id)

    # Count user's annotations for this dataset
    from app.models import TranslationAnnotation, TranslationEntry

    user_annotated_count = (
        db.query(TranslationAnnotation)
        .join(TranslationEntry, TranslationAnnotation.entry_id == TranslationEntry.id)
        .filter(TranslationEntry.dataset_id == dataset_id)
        .filter(TranslationAnnotation.user_id == user.sub)
        .count()
    )

    remaining = overall_stats["pending_count"]
    user_total = overall_stats["total_entries"]
    user_percentage = (user_annotated_count / user_total * 100) if user_total > 0 else 0

    # Count user's annotations for this dataset
    from app.models import TranslationAnnotation, TranslationEntry

    user_annotated_count = (
        db.query(TranslationAnnotation)
        .join(TranslationEntry, TranslationAnnotation.entry_id == TranslationEntry.id)
        .filter(TranslationEntry.dataset_id == dataset_id)
        .filter(TranslationAnnotation.user_id == user.sub)
        .count()
    )

    remaining = overall_stats["pending_count"]
    user_total = overall_stats["total_entries"]
    user_percentage = (user_annotated_count / user_total * 100) if user_total > 0 else 0

    return DatasetStatsDetailResponse(
        dataset=dataset,
        overall_stats=DatasetStatsResponse(**overall_stats),
        user_stats=UserDatasetStatsResponse(
            total_entries=user_total,
            annotated_by_user=user_annotated_count,
            remaining_for_user=remaining,
            user_completion_percentage=round(user_percentage, 2),
        ),
    )


# =============================================================================
# Annotation Workflow (All Authenticated Users)
# =============================================================================


@router.get(
    "/entries/next",
    response_model=EntryResponse,
    summary="Get next random entry for annotation",
)
@limiter.limit("30/minute")
async def get_next_entry(
    request: Request,
    dataset_id: str,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> EntryResponse:
    """
    Get a random pending entry for the user to annotate.

    **Requires authentication.**

    Returns a random entry from the specified dataset that:
    - Has status 'pending'
    - Has not been annotated by the current user yet

    If no pending entries are available for the user, returns 404.

    Args:
    - **dataset_id**: UUID of the dataset

    Returns:
    - **entry**: Entry object with source_text and reference_translation

    Status codes:
    - 200: Entry retrieved successfully
    - 401: Not authenticated
    - 404: No pending entries available
    """
    entry = TranslationService.get_next_entry(db, dataset_id, user.sub)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No pending entries available for you in this dataset",
        )
    return entry


@router.get(
    "/entries/{entry_id}",
    response_model=EntryResponse,
    summary="Get entry by ID",
)
@limiter.limit("60/minute")
async def get_entry(
    request: Request,
    entry_id: str,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> EntryResponse:
    """
    Get a specific translation entry by its ID.

    **Requires authentication.**

    Returns the entry details including the reference translation.
    If the user has annotated this entry, the annotation will be included.

    Args:
    - **entry_id**: UUID of the entry

    Returns:
    - **entry**: Entry object with optional annotation

    Status codes:
    - 200: Entry found
    - 401: Not authenticated
    - 404: Entry not found
    """
    entry = TranslationService.get_entry(db, entry_id)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entry not found",
        )
    return entry


@router.post(
    "/entries/{entry_id}/annotate",
    response_model=AnnotationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit annotation for an entry",
)
@limiter.limit("20/minute")
async def submit_annotation(
    request: Request,
    entry_id: str,
    data: SubmitAnnotationRequest,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> AnnotationResponse:
    """
    Submit an annotation for a translation entry.

    **Requires authentication.**

    User can either:
    - **Validate**: Submit the same text as reference_translation (agree with reference)
    - **Edit**: Submit a corrected version

    After submission:
    - Entry status changes to 'completed'
    - Entry cannot be annotated again by the same user

    Args:
    - **entry_id**: UUID of the entry to annotate
    - **corrected_translation**: User's corrected translation (required)
    - **notes**: Optional notes about the correction

    Returns:
    - **annotation**: Created annotation object

    Status codes:
    - 201: Annotation submitted successfully
    - 400: Validation error (e.g., entry already annotated, empty translation)
    - 401: Not authenticated
    - 404: Entry not found
    """
    annotation, error = TranslationService.submit_annotation(
        db=db,
        entry_id=entry_id,
        user_id=user.sub,
        corrected_translation=data.corrected_translation,
        notes=data.notes,
    )

    if error:
        # Determine appropriate status code based on error
        if "not found" in error.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return annotation
