"""
Dictionary API endpoints for dataset management and annotation.
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
from app.models import DictionaryEntry
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
from app.services.dictionary import DictionaryService

router = APIRouter(prefix="/dictionary", tags=["Dictionary"])


# =============================================================================
# Dataset Management (Admin Only)
# =============================================================================


@router.post(
    "/datasets",
    response_model=DatasetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new dictionary dataset",
)
@limiter.limit("10/minute")
async def create_dataset(
    request: Request,
    data: CreateDatasetRequest,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_admin_auth),
) -> DatasetResponse:
    """
    Create a new dictionary dataset.

    **Requires admin authentication.**

    Args:
    - **name**: Dataset name (required)
    - **language**: Language code (e.g., 'ar', 'en')
    - **description**: Optional description
    - **category**: Optional category (e.g., 'medical', 'technical')

    Returns:
    - **dataset**: Created dataset object

    Status codes:
    - 201: Dataset created successfully
    - 401: Not authenticated
    - 403: Not authorized (not admin)
    """
    created_by_id = user.sub if isinstance(user.sub, UUID) else user.sub
    dataset = DictionaryService.create_dataset(
        db=db,
        name=data.name,
        language=data.language,
        description=data.description,
        category=data.category,
        created_by_id=created_by_id,
    )
    return dataset


@router.post(
    "/datasets/{dataset_id}/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload CSV file with dictionary entries",
)
@limiter.limit("5/minute")
async def upload_csv(
    request: Request,
    dataset_id: UUID,
    file: UploadFile,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_admin_auth),
) -> UploadResponse:
    """
    Upload a CSV file with dictionary entries.

    **Requires admin authentication.**

    The CSV file must have a header row with the following columns:
    - **word**: The word (required)
    - **meaning**: Definition/meaning (required)
    - **examples**: Example usage (optional)
    - **tags**: Comma-separated tags (optional)

    Example CSV format:
    ```csv
    word,meaning,examples,tags
    كتاب,book,A writing instrument.,stationery,noun
    قلم,pen,For writing.,stationery,noun
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
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file",
        )

    content = await file.read()

    try:
        entries = DictionaryService.parse_csv_file(content)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    dataset = DictionaryService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"there is no dataset with an id {dataset_id}",
        )

    result = DictionaryService.upload_entries(db, dataset_id, entries)

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
    summary="List all dictionary datasets",
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
    List all available dictionary datasets.

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
    datasets = DictionaryService.get_datasets(db, skip=skip, limit=limit)
    total = DictionaryService.get_datasets_count(db)
    return DatasetListResponse(datasets=datasets, total=total)


@router.get(
    "/datasets/{dataset_id}",
    response_model=DatasetResponse,
    summary="Get dataset by ID",
)
@limiter.limit("60/minute")
async def get_dataset(
    request: Request,
    dataset_id: UUID,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> DatasetResponse:
    """
    Get a specific dictionary dataset by its ID.

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
    dataset = DictionaryService.get_dataset(db, dataset_id)
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
    dataset_id: UUID,
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
    dataset = DictionaryService.get_dataset(db, dataset_id)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )

    user_id = user.sub if isinstance(user.sub, UUID) else user.sub
    overall_stats = DictionaryService.get_dataset_stats(db, dataset_id)
    user_stats = DictionaryService.get_user_dataset_stats(db, dataset_id, user_id)

    return DatasetStatsDetailResponse(
        dataset=dataset,
        overall_stats=DatasetStatsResponse(**overall_stats),
        user_stats=UserDatasetStatsResponse(
            total_entries=user_stats["total_entries"],
            pending_count=user_stats["pending_count"],
            completed_count=user_stats["completed_count"],
            completion_percentage=user_stats["completion_percentage"],
            annotated_by_user=user_stats["user_annotated_count"],
            submitted_count=user_stats["user_submitted_count"],
            remaining_for_user=user_stats["user_remaining_count"],
            user_completion_percentage=(
                round(
                    user_stats["user_annotated_count"]
                    / user_stats["total_entries"]
                    * 100,
                    2,
                )
                if user_stats["total_entries"] > 0
                else 0
            ),
        ),
    )


# =============================================================================
# Entry Creation (All Authenticated Users)
# =============================================================================


@router.post(
    "/entries",
    response_model=EntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new dictionary entry",
)
@limiter.limit("30/minute")
async def create_entry(
    request: Request,
    data: CreateEntryRequest,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> EntryResponse:
    """
    Create a new dictionary entry.

    **Requires authentication.**

    Regular users will have is_user_submitted=True.
    Admins will have is_user_submitted=False.

    Args:
    - **dataset_id**: UUID of the target dataset
    - **word**: The word (required)
    - **meaning**: Definition/meaning (required)
    - **examples**: Optional example usage
    - **tags**: Optional list of tags

    Returns:
    - **entry**: Created entry object

    Status codes:
    - 201: Entry created successfully
    - 401: Not authenticated
    - 404: Dataset not found
    """
    dataset_uuid = (
        UUID(str(data.dataset_id))
        if isinstance(data.dataset_id, UUID)
        else data.dataset_id
    )
    dataset = DictionaryService.get_dataset(db, dataset_uuid)
    if not dataset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dataset not found",
        )

    user_id = user.sub if isinstance(user.sub, UUID) else user.sub
    is_admin = getattr(user, "is_superuser", False)

    entry = DictionaryService.create_entry(
        db=db,
        dataset_id=dataset_uuid,
        word=data.word,
        meaning=data.meaning,
        examples=data.examples,
        tags=data.tags,
        user_id=user_id,
        is_user_submitted=not is_admin,
    )
    return entry


# =============================================================================
# Search and Browse Entries
# =============================================================================


@router.get(
    "/entries/search",
    response_model=SearchEntriesResponse,
    summary="Search dictionary entries",
)
@limiter.limit("60/minute")
async def search_entries(
    request: Request,
    q: str = Query(..., description="Search query"),
    dataset_id: UUID = None,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=100, description="Maximum records to return"),
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> SearchEntriesResponse:
    """
    Search dictionary entries by word or meaning.

    **Requires authentication.**

    Search is case-insensitive and matches partial text.
    Can be filtered by dataset_id.

    Args:
    - **q**: Search query (no minimum length)
    - **dataset_id**: Optional dataset UUID to filter by
    - **skip**: Number of records to skip (pagination offset)
    - **limit**: Maximum number of records to return (1-100)

    Returns:
    - **entries**: List of matching entries
    - **total**: Total number of matches
    - **query**: Search query used

    Status codes:
    - 200: Search completed
    - 401: Not authenticated
    """
    entries, total = DictionaryService.search_entries(
        db=db,
        query=q,
        dataset_id=dataset_id,
        skip=skip,
        limit=limit,
    )

    return SearchEntriesResponse(
        entries=entries,
        total=total,
        query=q,
    )


@router.get(
    "/entries/user",
    response_model=UserEntriesResponse,
    summary="Get user's submitted and annotated entries",
)
@limiter.limit("60/minute")
async def get_user_entries(
    request: Request,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> UserEntriesResponse:
    """
    Get entries submitted and annotated by the current user.

    **Requires authentication.**

    Returns two lists:
    - **submitted_entries**: Entries created by this user
    - **annotated_entries**: Entries annotated by this user

    Args:
    - (no parameters)

    Returns:
    - **submitted_entries**: List of entries the user submitted
    - **annotated_entries**: List of entries the user annotated

    Status codes:
    - 200: Entries retrieved successfully
    - 401: Not authenticated
    """
    user_id = user.sub if isinstance(user.sub, UUID) else user.sub

    submitted_entries = DictionaryService.get_user_submitted_entries(
        db=db,
        user_id=user_id,
        skip=0,
        limit=100,
    )

    from app.models import DictionaryAnnotation

    annotated_ids = (
        db.query(DictionaryAnnotation.entry_id)
        .filter(DictionaryAnnotation.user_id == user_id)
        .subquery()
    )

    from sqlalchemy import and_

    annotated_entries = (
        db.query(DictionaryEntry)
        .filter(
            and_(
                DictionaryEntry.id.in_(db.query(annotated_ids.c.entry_id)),
            )
        )
        .all()
    )

    return UserEntriesResponse(
        submitted_entries=submitted_entries,
        annotated_entries=annotated_entries,
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
    dataset_id: UUID = None,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> EntryResponse:
    """
    Get a random pending entry for the user to annotate.

    **Requires authentication.**

    Returns a random entry that:
    - Has status 'pending'
    - Has not been annotated by the current user yet
    - Was not submitted by the current user

    If dataset_id is provided, only entries from that dataset are returned.
    If no pending entries are available for the user, returns 404.

    Args:
    - **dataset_id**: Optional UUID of the dataset

    Returns:
    - **entry**: Entry object with word, meaning, examples, tags

    Status codes:
    - 200: Entry retrieved successfully
    - 401: Not authenticated
    - 404: No pending entries available
    """
    user_id = user.sub if isinstance(user.sub, UUID) else user.sub
    entry = DictionaryService.get_next_entry(db, dataset_id, user_id)
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
    entry_id: UUID,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> EntryResponse:
    """
    Get a specific dictionary entry by its ID.

    **Requires authentication.**

    Returns the entry details including the word, meaning, examples, and tags.
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
    entry = DictionaryService.get_entry(db, entry_id)
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
    entry_id: UUID,
    data: SubmitAnnotationRequest,
    db: Session = Depends(get_db),
    user: KeycloakUser = Depends(require_auth),
) -> AnnotationResponse:
    """
    Submit an annotation for a dictionary entry.

    **Requires authentication.**

    User must provide at least one correction field:
    - corrected_meaning
    - corrected_examples
    - corrected_tags

    After submission:
    - Entry status changes to 'completed'
    - Entry cannot be annotated again by the same user
    - User cannot annotate their own submitted entries

    Args:
    - **entry_id**: UUID of the entry to annotate
    - **corrected_meaning**: User's corrected meaning (optional)
    - **corrected_examples**: User's corrected examples (optional)
    - **corrected_tags**: User's corrected tags (optional)
    - **notes**: Optional notes about the correction

    Returns:
    - **annotation**: Created annotation object

    Status codes:
    - 201: Annotation submitted successfully
    - 400: Validation error (e.g., entry already annotated, no corrections provided)
    - 401: Not authenticated
    - 404: Entry not found
    """
    user_id = user.sub if isinstance(user.sub, UUID) else user.sub

    annotation, error = DictionaryService.submit_annotation(
        db=db,
        entry_id=entry_id,
        user_id=user_id,
        corrected_meaning=data.corrected_meaning,
        corrected_examples=data.corrected_examples,
        corrected_tags=data.corrected_tags,
        notes=data.notes,
    )

    if error:
        if "not found" in error.lower():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error)
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

    return annotation
