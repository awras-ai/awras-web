"""
Dictionary service for annotation and dataset management.
"""

import csv
import io
import logging
import uuid
from typing import Any, Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session as DBSession

from app.models import DictionaryAnnotation, DictionaryEntry, DictionaryDataset

logger = logging.getLogger(__name__)


class DictionaryService:
    """Service for Dictionary annotation operations."""

    # =========================================================================
    # DATASET MANAGEMENT
    # =========================================================================

    @staticmethod
    def create_dataset(
        db: DBSession,
        name: str,
        language: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        created_by_sub: Optional[uuid.UUID] = None,
    ) -> DictionaryDataset:
        """
        Create a new dictionary dataset.

        Args:
            db: Database session
            name: Dataset name
            language: Language code (e.g., "ar", "en")
            description: Optional description
            category: Optional category (e.g., "medical", "technical", "colloquial")
            created_by_sub: ID of user creating the dataset

        Returns:
            DictionaryDataset object
        """
        dataset = DictionaryDataset(
            name=name,
            description=description,
            language=language,
            category=category,
            created_by_sub=created_by_sub,
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    @staticmethod
    def get_dataset(
        db: DBSession, dataset_id: uuid.UUID
    ) -> Optional[DictionaryDataset]:
        """
        Get a dataset by ID.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            DictionaryDataset or None
        """
        return (
            db.query(DictionaryDataset)
            .filter(DictionaryDataset.id == dataset_id)
            .first()
        )

    @staticmethod
    def get_datasets(
        db: DBSession, skip: int = 0, limit: int = 50
    ) -> list[DictionaryDataset]:
        """
        Get all datasets with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of DictionaryDataset objects
        """
        return (
            db.query(DictionaryDataset)
            .order_by(DictionaryDataset.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_datasets_count(db: DBSession) -> int:
        """
        Get total count of datasets.

        Args:
            db: Database session

        Returns:
            Total number of datasets
        """
        return db.query(DictionaryDataset).count()

    # =========================================================================
    # CSV UPLOAD
    # =========================================================================

    @staticmethod
    def parse_csv_file(file_content: str | bytes) -> list[dict[str, Any]]:
        """
        Parse CSV file content.

        Expected columns: word, meaning, examples (optional), tags (optional)

        Args:
            file_content: CSV content as string or bytes

        Returns:
            List of dictionaries with word, meaning, examples, and tags

        Raises:
            ValueError: If CSV format is invalid
        """
        if isinstance(file_content, bytes):
            file_content = file_content.decode("utf-8")

        reader = csv.DictReader(io.StringIO(file_content))

        fieldnames = reader.fieldnames or []
        if "word" not in fieldnames or "meaning" not in fieldnames:
            raise ValueError("CSV must contain 'word' and 'meaning' columns")

        entries = []
        for row in reader:
            # Parse tags from comma-separated string to list
            tags_raw = (row.get("tags") or "").strip()
            tags_list = (
                [tag.strip() for tag in tags_raw.split(",") if tag.strip()]
                if tags_raw
                else None
            )

            entries.append(
                {
                    "word": (row.get("word") or "").strip(),
                    "meaning": (row.get("meaning") or "").strip(),
                    "examples": (row.get("examples") or "").strip() or None,
                    "tags": tags_list,
                }
            )

        return entries

    @staticmethod
    def upload_entries(
        db: DBSession, dataset_id: uuid.UUID, entries_list: list[dict[str, Any]]
    ) -> dict[str, Any]:
        """
        Bulk upload entries to a dataset.

        Args:
            db: Database session
            dataset_id: Target dataset UUID
            entries_list: List of {word, meaning, examples, tags} dicts

        Returns:
            Dictionary with success_count, failed_count, and errors list
        """
        dataset = DictionaryService.get_dataset(db, dataset_id)
        if not dataset:
            return {
                "success_count": 0,
                "failed_count": len(entries_list),
                "errors": [
                    {"row": i, "reason": "Dataset not found"}
                    for i in range(len(entries_list))
                ],
            }

        success_count = 0
        failed_count = 0
        errors = []

        for i, entry_data in enumerate(entries_list):
            try:
                if not entry_data.get("word"):
                    errors.append({"row": i + 2, "reason": "Empty word"})
                    failed_count += 1
                    continue

                if not entry_data.get("meaning"):
                    errors.append({"row": i + 2, "reason": "Empty meaning"})
                    failed_count += 1
                    continue

                entry = DictionaryEntry(
                    dataset_id=dataset_id,
                    word=entry_data["word"],
                    meaning=entry_data["meaning"],
                    examples=entry_data.get("examples"),
                    tags=entry_data.get("tags"),
                    status="pending",
                    is_user_submitted=False,
                )
                db.add(entry)
                success_count += 1

            except Exception as e:
                errors.append({"row": i + 2, "reason": str(e)})
                failed_count += 1

        db.commit()

        return {
            "success_count": success_count,
            "failed_count": failed_count,
            "errors": errors,
        }

    # =========================================================================
    # ENTRY MANAGEMENT
    # =========================================================================

    @staticmethod
    def create_entry(
        db: DBSession,
        dataset_id: uuid.UUID,
        word: str,
        meaning: str,
        examples: Optional[str] = None,
        tags: Optional[list[str]] = None,
        keycloak_sub: Optional[uuid.UUID] = None,
        is_user_submitted: bool = False,
    ) -> DictionaryEntry:
        """
        Create a new dictionary entry.

        Args:
            db: Database session
            dataset_id: Dataset UUID
            word: The word
            meaning: Definition/meaning
            examples: Optional example usage
            tags: Optional list of tags
            keycloak_sub: User who created the entry (if user-submitted)
            is_user_submitted: Whether this is a user submission

        Returns:
            DictionaryEntry object
        """
        entry = DictionaryEntry(
            dataset_id=dataset_id,
            word=word.strip(),
            meaning=meaning.strip(),
            examples=examples.strip() if examples else None,
            tags=tags,
            is_user_submitted=is_user_submitted,
            created_by_sub=user_id if is_user_submitted else None,
            status="pending",
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        return entry

    @staticmethod
    def get_entry(db: DBSession, entry_id: uuid.UUID) -> Optional[DictionaryEntry]:
        """
        Get a single entry by ID.

        Args:
            db: Database session
            entry_id: Entry UUID

        Returns:
            DictionaryEntry or None
        """
        return db.query(DictionaryEntry).filter(DictionaryEntry.id == entry_id).first()

    @staticmethod
    def search_entries(
        db: DBSession,
        query: str,
        dataset_id: Optional[uuid.UUID] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[list[DictionaryEntry], int]:
        """
        Search entries by word or meaning with text search.

        Args:
            db: Database session
            query: Search query (searches in word and meaning)
            dataset_id: Optional dataset UUID to filter by
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of (list of DictionaryEntry objects, total count)
        """
        # Build base query
        base_query = db.query(DictionaryEntry)

        # Apply dataset filter if provided
        if dataset_id:
            base_query = base_query.filter(DictionaryEntry.dataset_id == dataset_id)

        # Apply text search on word and meaning (case-insensitive)
        if query and query.strip():
            search_pattern = f"%{query.strip()}%"
            base_query = base_query.filter(
                or_(
                    DictionaryEntry.word.ilike(search_pattern),
                    DictionaryEntry.meaning.ilike(search_pattern),
                )
            )

        # Get total count
        total = base_query.count()

        # Get paginated results
        entries = (
            base_query.order_by(DictionaryEntry.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return entries, total

    @staticmethod
    def get_user_submitted_entries(
        db: DBSession, keycloak_sub: str, skip: int = 0, limit: int = 50
    ) -> list[DictionaryEntry]:
        """
        Get entries submitted by a specific user.

        Args:
            db: Database session
            keycloak_sub: Keycloak sub
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of DictionaryEntry objects
        """
        return (
            db.query(DictionaryEntry)
            .filter(
                DictionaryEntry.created_by_sub == user_id,
                DictionaryEntry.is_user_submitted,
            )
            .order_by(DictionaryEntry.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    # =========================================================================
    # ANNOTATION WORKFLOW
    # =========================================================================

    @staticmethod
    def get_next_entry(
        db: DBSession,
        dataset_id: Optional[uuid.UUID],
        keycloak_sub: str,
    ) -> Optional[DictionaryEntry]:
        """
        Get one random pending entry for user to annotate.

        Excludes:
        - Entries already annotated by this user
        - Entries submitted by this user (can't annotate own entries)

        Args:
            db: Database session
            dataset_id: Optional dataset UUID (if None, get from any dataset)
            keycloak_sub: Keycloak sub

        Returns:
            DictionaryEntry or None (if no pending entries)
        """
        # Get IDs of entries already annotated by this user
        annotated_ids = (
            db.query(DictionaryAnnotation.entry_id)
            .filter(DictionaryAnnotation.user_id == user_id)
            .subquery()
        )

        # Build query
        query = db.query(DictionaryEntry).filter(
            DictionaryEntry.status == "pending",
            # Exclude already annotated entries
            ~DictionaryEntry.id.in_(db.query(annotated_ids.c.entry_id)),
            # Exclude user's own submissions
            or_(
                DictionaryEntry.created_by_sub != user_id,
                DictionaryEntry.created_by_sub.is_(None),
            ),
        )

        # Filter by dataset if provided
        if dataset_id:
            query = query.filter(DictionaryEntry.dataset_id == dataset_id)

        # Get random entry
        entry = query.order_by(func.random()).first()

        return entry

    @staticmethod
    def submit_annotation(
        db: DBSession,
        entry_id: uuid.UUID,
        keycloak_sub: str,
        corrected_meaning: Optional[str] = None,
        corrected_examples: Optional[str] = None,
        corrected_tags: Optional[list[str]] = None,
        notes: Optional[str] = None,
    ) -> tuple[Optional[DictionaryAnnotation], Optional[str]]:
        """
        Submit annotation for an entry.

        User must provide at least one correction field.

        Args:
            db: Database session
            entry_id: Entry UUID
            keycloak_sub: Keycloak sub
            corrected_meaning: Corrected meaning/definition
            corrected_examples: Corrected examples
            corrected_tags: Corrected tags list
            notes: Optional notes

        Returns:
            Tuple of (DictionaryAnnotation, None) on success
            or (None, error_message) on failure
        """
        entry = DictionaryService.get_entry(db, entry_id)
        if not entry:
            return None, "Entry not found"

        if entry.status != "pending":
            return None, "Entry already annotated"

        # Check if user already annotated this entry
        existing = (
            db.query(DictionaryAnnotation)
            .filter(
                DictionaryAnnotation.entry_id == entry_id,
                DictionaryAnnotation.user_id == user_id,
            )
            .first()
        )
        if existing:
            return None, "You have already annotated this entry"

        # Prevent users from annotating their own submissions
        if entry.is_user_submitted and entry.created_by_sub == keycloak_sub:
            return None, "You cannot annotate your own entry"

        # Validate at least one correction field is provided
        has_correction = False
        if corrected_meaning and corrected_meaning.strip():
            has_correction = True
        if corrected_examples and corrected_examples.strip():
            has_correction = True
        if corrected_tags and len(corrected_tags) > 0:
            has_correction = True

        if not has_correction:
            return None, "At least one correction field must be provided"

        # Create annotation
        annotation = DictionaryAnnotation(
            entry_id=entry_id,
            user_id=user_id,
            corrected_meaning=corrected_meaning.strip() if corrected_meaning else None,
            corrected_examples=(
                corrected_examples.strip() if corrected_examples else None
            ),
            corrected_tags=corrected_tags,
            notes=notes.strip() if notes else None,
        )
        db.add(annotation)

        # Update entry status
        entry.status = "completed"

        db.commit()
        db.refresh(annotation)

        return annotation, None

    @staticmethod
    def get_annotation(
        db: DBSession, entry_id: uuid.UUID
    ) -> Optional[DictionaryAnnotation]:
        """
        Get annotation for a specific entry.

        Args:
            db: Database session
            entry_id: Entry UUID

        Returns:
            DictionaryAnnotation or None
        """
        return (
            db.query(DictionaryAnnotation)
            .filter(DictionaryAnnotation.entry_id == entry_id)
            .first()
        )

    # =========================================================================
    # STATISTICS
    # =========================================================================

    @staticmethod
    def get_dataset_stats(db: DBSession, dataset_id: uuid.UUID) -> dict[str, Any]:
        """
        Get statistics for a dataset.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            Dictionary with total_entries, pending_count, completed_count, percentage
        """
        total = (
            db.query(DictionaryEntry)
            .filter(DictionaryEntry.dataset_id == dataset_id)
            .count()
        )

        completed = (
            db.query(DictionaryEntry)
            .filter(
                DictionaryEntry.dataset_id == dataset_id,
                DictionaryEntry.status == "completed",
            )
            .count()
        )

        pending = total - completed
        percentage = (completed / total * 100) if total > 0 else 0

        return {
            "total_entries": total,
            "pending_count": pending,
            "completed_count": completed,
            "completion_percentage": round(percentage, 2),
        }

    @staticmethod
    def get_user_dataset_stats(
        db: DBSession, dataset_id: uuid.UUID, keycloak_sub: str
    ) -> dict[str, Any]:
        """
        Get statistics for a dataset including user-specific metrics.

        Args:
            db: Database session
            dataset_id: Dataset UUID
            keycloak_sub: Keycloak sub

        Returns:
            Dictionary with overall stats plus user_annotated_count,
            user_submitted_count, and user_remaining_count
        """
        # Get base dataset stats
        stats = DictionaryService.get_dataset_stats(db, dataset_id)

        # Count entries annotated by this user in this dataset
        user_annotated = (
            db.query(DictionaryAnnotation)
            .join(DictionaryEntry)
            .filter(
                DictionaryEntry.dataset_id == dataset_id,
                DictionaryAnnotation.user_id == user_id,
            )
            .count()
        )

        # Count entries submitted by this user in this dataset
        user_submitted = (
            db.query(DictionaryEntry)
            .filter(
                DictionaryEntry.dataset_id == dataset_id,
                DictionaryEntry.created_by_sub == user_id,
                DictionaryEntry.is_user_submitted,
            )
            .count()
        )

        # Get IDs of entries already annotated by this user
        annotated_ids = (
            db.query(DictionaryAnnotation.entry_id)
            .filter(DictionaryAnnotation.user_id == user_id)
            .subquery()
        )

        # Count pending entries user can still annotate (excluding own submissions)
        user_remaining = (
            db.query(DictionaryEntry)
            .filter(
                DictionaryEntry.dataset_id == dataset_id,
                DictionaryEntry.status == "pending",
                ~DictionaryEntry.id.in_(db.query(annotated_ids.c.entry_id)),
                or_(
                    DictionaryEntry.created_by_sub != user_id,
                    DictionaryEntry.created_by_sub.is_(None),
                ),
            )
            .count()
        )

        # Add user-specific stats
        stats.update(
            {
                "user_annotated_count": user_annotated,
                "user_submitted_count": user_submitted,
                "user_remaining_count": user_remaining,
            }
        )

        return stats
