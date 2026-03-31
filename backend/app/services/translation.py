"""
Translation service for annotation and dataset management.
"""

import csv
import io
import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession
from sqlalchemy.exc import IntegrityError

from app.core.config import get_settings
from app.models import TranslationAnnotation, TranslationEntry, TranslationDataset

logger = logging.getLogger(__name__)
settings = get_settings()


class TranslationService:
    """Service for Translation annotation operations."""

    # =========================================================================
    # DATASET MANAGEMENT
    # =========================================================================

    @staticmethod
    def create_dataset(
        db: DBSession,
        name: str,
        source_language: str,
        target_language: str,
        description: Optional[str] = None,
        category: Optional[str] = None,
        created_by_id: Optional[uuid.UUID] = None,
    ) -> TranslationDataset:
        """
        Create a new translation dataset.

        Args:
            db: Database session
            name: Dataset name
            source_language: Source language code (e.g., "en")
            target_language: Target language code (e.g., "ar")
            description: Optional description
            category: Optional category (e.g., "medical", "legal")
            created_by_id: ID of user creating the dataset

        Returns:
            TranslationDataset object
        """
        dataset = TranslationDataset(
            name=name,
            description=description,
            source_language=source_language,
            target_language=target_language,
            category=category,
            created_by_id=created_by_id,
        )
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        return dataset

    @staticmethod
    def get_dataset(
        db: DBSession, dataset_id: uuid.UUID
    ) -> Optional[TranslationDataset]:
        """
        Get a dataset by ID.

        Args:
            db: Database session
            dataset_id: Dataset UUID

        Returns:
            TranslationDataset or None
        """
        return (
            db.query(TranslationDataset)
            .filter(TranslationDataset.id == dataset_id)
            .first()
        )

    @staticmethod
    def get_datasets(
        db: DBSession, skip: int = 0, limit: int = 50
    ) -> list[TranslationDataset]:
        """
        Get all datasets with pagination.

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            List of TranslationDataset objects
        """
        return (
            db.query(TranslationDataset)
            .order_by(TranslationDataset.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    # =========================================================================
    # CSV UPLOAD
    # =========================================================================

    @staticmethod
    def parse_csv_file(file_content: str | bytes) -> list[dict[str, Any]]:
        """
        Parse CSV file content.

        Expected columns: source_text, reference_translation

        Args:
            file_content: CSV content as string or bytes

        Returns:
            List of dictionaries with source_text and reference_translation

        Raises:
            ValueError: If CSV format is invalid
        """
        if isinstance(file_content, bytes):
            file_content = file_content.decode("utf-8")

        reader = csv.DictReader(io.StringIO(file_content))

        fieldnames = reader.fieldnames or []
        if "source_text" not in fieldnames or "reference_translation" not in fieldnames:
            raise ValueError(
                "CSV must contain 'source_text' and 'reference_translation' columns"
            )

        entries = []
        for row in reader:
            entries.append(
                {
                    "source_text": row["source_text"].strip(),
                    "reference_translation": row["reference_translation"].strip(),
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
            entries_list: List of {source_text, reference_translation} dicts

        Returns:
            Dictionary with success_count, failed_count, and errors list
        """
        dataset = TranslationService.get_dataset(db, dataset_id)
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
                if not entry_data.get("source_text"):
                    errors.append({"row": i + 2, "reason": "Empty source_text"})
                    failed_count += 1
                    continue

                if not entry_data.get("reference_translation"):
                    errors.append(
                        {"row": i + 2, "reason": "Empty reference_translation"}
                    )
                    failed_count += 1
                    continue

                entry = TranslationEntry(
                    dataset_id=dataset_id,
                    source_text=entry_data["source_text"],
                    reference_translation=entry_data["reference_translation"],
                    status="pending",
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
    # ANNOTATION WORKFLOW
    # =========================================================================

    @staticmethod
    def get_entry(db: DBSession, entry_id: uuid.UUID) -> Optional[TranslationEntry]:
        """
        Get a single entry by ID.

        Args:
            db: Database session
            entry_id: Entry UUID

        Returns:
            TranslationEntry or None
        """
        return (
            db.query(TranslationEntry).filter(TranslationEntry.id == entry_id).first()
        )

    @staticmethod
    def get_next_entry(
        db: DBSession, dataset_id: uuid.UUID, user_id: uuid.UUID
    ) -> Optional[TranslationEntry]:
        """
        Get one random pending entry for user to annotate.

        Excludes entries already annotated by this user.

        Args:
            db: Database session
            dataset_id: Dataset UUID
            user_id: User UUID

        Returns:
            TranslationEntry or None (if no pending entries)
        """
        annotated_ids = (
            db.query(TranslationAnnotation.entry_id)
            .filter(TranslationAnnotation.user_id == user_id)
            .subquery()
        )

        entry = (
            db.query(TranslationEntry)
            .filter(
                TranslationEntry.dataset_id == dataset_id,
                TranslationEntry.status == "pending",
                ~TranslationEntry.id.in_(db.query(annotated_ids.c.entry_id)),
            )
            .order_by(func.random())
            .first()
        )

        return entry

    @staticmethod
    def submit_annotation(
        db: DBSession,
        entry_id: uuid.UUID,
        user_id: uuid.UUID,
        corrected_translation: str,
        notes: Optional[str] = None,
    ) -> tuple[Optional[TranslationAnnotation], Optional[str]]:
        """
        Submit annotation for an entry.

        User can either:
        - Validate (copy reference_translation to corrected_translation)
        - Edit (provide corrected version)

        Args:
            db: Database session
            entry_id: Entry UUID
            user_id: User UUID
            corrected_translation: The user's corrected translation
            notes: Optional notes

        Returns:
            Tuple of (TranslationAnnotation, None) on success
            or (None, error_message) on failure
        """
        entry = TranslationService.get_entry(db, entry_id)
        if not entry:
            return None, "Entry not found"

        if entry.status != "pending":
            return None, "Entry already annotated"

        existing = (
            db.query(TranslationAnnotation)
            .filter(
                TranslationAnnotation.entry_id == entry_id,
                TranslationAnnotation.user_id == user_id,
            )
            .first()
        )
        if existing:
            return None, "You have already annotated this entry"

        if not corrected_translation or not corrected_translation.strip():
            return None, "Corrected translation cannot be empty"

        annotation = TranslationAnnotation(
            entry_id=entry_id,
            user_id=user_id,
            corrected_translation=corrected_translation.strip(),
            notes=notes.strip() if notes else None,
        )
        db.add(annotation)

        entry.status = "completed"

        db.commit()
        db.refresh(annotation)

        return annotation, None

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
            db.query(TranslationEntry)
            .filter(TranslationEntry.dataset_id == dataset_id)
            .count()
        )

        completed = (
            db.query(TranslationEntry)
            .filter(
                TranslationEntry.dataset_id == dataset_id,
                TranslationEntry.status == "completed",
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
