"""Remove local user storage - use Keycloak sub directly.

Removes:
- users table
- sessions table
- chainlit tables (threads, steps, elements, feedback)
- All user_id foreign keys

Replaces user_id/created_by_id with keycloak_sub strings.

Revision ID: remove_local_user_storage
Revises: 1cdc7ff26472
Create Date: 2026-06-30 12:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "remove_local_user_storage"
down_revision: Union[str, Sequence[str], None] = "1cdc7ff26472"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Remove local user storage, replace FKs with keycloak_sub strings."""

    # =================================================================
    # 1. Add new keycloak_sub columns (nullable initially)
    # =================================================================

    # translation_annotations
    op.add_column(
        "translation_annotations",
        sa.Column("keycloak_sub", sa.String(length=255), nullable=True),
    )

    # translation_datasets
    op.add_column(
        "translation_datasets",
        sa.Column("created_by_sub", sa.String(length=255), nullable=True),
    )

    # dictionary_annotations
    op.add_column(
        "dictionary_annotations",
        sa.Column("keycloak_sub", sa.String(length=255), nullable=True),
    )

    # dictionary_datasets
    op.add_column(
        "dictionary_datasets",
        sa.Column("created_by_sub", sa.String(length=255), nullable=True),
    )

    # dictionary_entries
    op.add_column(
        "dictionary_entries",
        sa.Column("submitted_by_sub", sa.String(length=255), nullable=True),
    )

    # voice_annotations
    op.add_column(
        "voice_annotations",
        sa.Column("keycloak_sub", sa.String(length=255), nullable=True),
    )

    # voice_datasets
    op.add_column(
        "voice_datasets",
        sa.Column("created_by_sub", sa.String(length=255), nullable=True),
    )

    # =================================================================
    # 2. Drop foreign key constraints and old user_id columns
    # =================================================================

    # translation_annotations
    op.drop_constraint(
        "translation_annotations_user_id_fkey",
        "translation_annotations",
        type_="foreignkey",
    )
    op.drop_column("translation_annotations", "user_id")
    op.create_index(
        "ix_translation_annotations_keycloak_sub",
        "translation_annotations",
        ["keycloak_sub"],
    )

    # translation_datasets
    op.drop_constraint(
        "translation_datasets_created_by_id_fkey",
        "translation_datasets",
        type_="foreignkey",
    )
    op.drop_column("translation_datasets", "created_by_id")

    # dictionary_annotations
    op.drop_constraint(
        "dictionary_annotations_user_id_fkey",
        "dictionary_annotations",
        type_="foreignkey",
    )
    op.drop_column("dictionary_annotations", "user_id")
    op.create_index(
        "ix_dictionary_annotations_keycloak_sub",
        "dictionary_annotations",
        ["keycloak_sub"],
    )

    # dictionary_datasets
    op.drop_constraint(
        "dictionary_datasets_created_by_id_fkey",
        "dictionary_datasets",
        type_="foreignkey",
    )
    op.drop_column("dictionary_datasets", "created_by_id")

    # dictionary_entries
    op.drop_constraint(
        "dictionary_entries_created_by_id_fkey",
        "dictionary_entries",
        type_="foreignkey",
    )
    op.drop_column("dictionary_entries", "created_by_id")
    op.create_index(
        "ix_dictionary_entries_submitted_by_sub",
        "dictionary_entries",
        ["submitted_by_sub"],
    )

    # voice_annotations
    op.drop_constraint(
        "voice_annotations_user_id_fkey", "voice_annotations", type_="foreignkey"
    )
    op.drop_column("voice_annotations", "user_id")
    op.create_index(
        "ix_voice_annotations_keycloak_sub", "voice_annotations", ["keycloak_sub"]
    )

    # voice_datasets
    op.drop_constraint(
        "voice_datasets_created_by_id_fkey", "voice_datasets", type_="foreignkey"
    )
    op.drop_column("voice_datasets", "created_by_id")

    # =================================================================
    # 3. Drop sessions and chainlit tables
    # =================================================================

    op.drop_table("sessions")
    op.drop_table("feedbacks")
    op.drop_table("elements")
    op.drop_table("steps")
    op.drop_table("threads")

    # =================================================================
    # 4. Drop users table last (after all FKs removed)
    # =================================================================

    op.drop_table("users")


def downgrade() -> None:
    """Restore users table and FKs (data loss)."""
    # This is not reversible - data is lost
    raise NotImplementedError("Downgrade not supported - data migration required")
