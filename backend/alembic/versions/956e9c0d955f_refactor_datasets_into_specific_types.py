"""refactor_datasets_into_specific_types

Revision ID: 956e9c0d955f
Revises: 5a5af5a15767
Create Date: 2026-03-19 23:14:41.107582

This migration refactors the generic 'datasets' table into three specific tables:
- translation_datasets (with source_language and target_language)
- voice_datasets (with single language field)
- dictionary_datasets (with single language field)

It also removes the reference_translation field from voice_entries.
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "956e9c0d955f"
down_revision: Union[str, Sequence[str], None] = "5a5af5a15767"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Step 1: Create the three new dataset tables
    op.create_table(
        "translation_datasets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source_language", sa.String(length=50), nullable=False),
        sa.Column("target_language", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "voice_datasets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("language", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "dictionary_datasets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("language", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Step 2: Migrate data from old datasets table to new tables based on entry_type
    op.execute("""
        INSERT INTO translation_datasets (id, name, description, source_language, target_language, category, created_by_id, created_at, updated_at)
        SELECT id, name, description, source_language, target_language, category, created_by_id, created_at, updated_at
        FROM datasets
        WHERE entry_type = 'translation'
    """)

    op.execute("""
        INSERT INTO voice_datasets (id, name, description, language, category, created_by_id, created_at, updated_at)
        SELECT id, name, description, source_language, category, created_by_id, created_at, updated_at
        FROM datasets
        WHERE entry_type = 'voice'
    """)

    op.execute("""
        INSERT INTO dictionary_datasets (id, name, description, language, category, created_by_id, created_at, updated_at)
        SELECT id, name, description, source_language, category, created_by_id, created_at, updated_at
        FROM datasets
        WHERE entry_type = 'dictionary'
    """)

    # Step 3: Drop foreign key constraints on entry tables
    op.drop_constraint(
        "translation_entries_dataset_id_fkey", "translation_entries", type_="foreignkey"
    )
    op.drop_constraint(
        "voice_entries_dataset_id_fkey", "voice_entries", type_="foreignkey"
    )
    op.drop_constraint(
        "dictionary_entries_dataset_id_fkey", "dictionary_entries", type_="foreignkey"
    )

    # Step 4: Add new foreign key constraints pointing to specific dataset tables
    op.create_foreign_key(
        "translation_entries_dataset_id_fkey",
        "translation_entries",
        "translation_datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "voice_entries_dataset_id_fkey",
        "voice_entries",
        "voice_datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "dictionary_entries_dataset_id_fkey",
        "dictionary_entries",
        "dictionary_datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Step 5: Drop the reference_translation column from voice_entries
    op.drop_column("voice_entries", "reference_translation")

    # Step 6: Drop the old datasets table
    op.drop_table("datasets")


def downgrade() -> None:
    """Downgrade schema."""

    # Step 1: Recreate the old datasets table
    op.create_table(
        "datasets",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("source_language", sa.String(length=50), nullable=False),
        sa.Column("target_language", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=True),
        sa.Column("entry_type", sa.String(length=20), nullable=False),
        sa.Column("created_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["created_by_id"], ["users.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Step 2: Add back the reference_translation column to voice_entries
    op.add_column(
        "voice_entries", sa.Column("reference_translation", sa.Text(), nullable=True)
    )

    # Step 3: Drop foreign key constraints on entry tables
    op.drop_constraint(
        "translation_entries_dataset_id_fkey", "translation_entries", type_="foreignkey"
    )
    op.drop_constraint(
        "voice_entries_dataset_id_fkey", "voice_entries", type_="foreignkey"
    )
    op.drop_constraint(
        "dictionary_entries_dataset_id_fkey", "dictionary_entries", type_="foreignkey"
    )

    # Step 4: Migrate data back from specific tables to generic datasets table
    op.execute("""
        INSERT INTO datasets (id, name, description, source_language, target_language, category, entry_type, created_by_id, created_at, updated_at)
        SELECT id, name, description, source_language, target_language, category, 'translation', created_by_id, created_at, updated_at
        FROM translation_datasets
    """)

    op.execute("""
        INSERT INTO datasets (id, name, description, source_language, target_language, category, entry_type, created_by_id, created_at, updated_at)
        SELECT id, name, description, language, language, category, 'voice', created_by_id, created_at, updated_at
        FROM voice_datasets
    """)

    op.execute("""
        INSERT INTO datasets (id, name, description, source_language, target_language, category, entry_type, created_by_id, created_at, updated_at)
        SELECT id, name, description, language, language, category, 'dictionary', created_by_id, created_at, updated_at
        FROM dictionary_datasets
    """)

    # Step 5: Recreate foreign key constraints pointing back to datasets
    op.create_foreign_key(
        "translation_entries_dataset_id_fkey",
        "translation_entries",
        "datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "voice_entries_dataset_id_fkey",
        "voice_entries",
        "datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )

    op.create_foreign_key(
        "dictionary_entries_dataset_id_fkey",
        "dictionary_entries",
        "datasets",
        ["dataset_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # Step 6: Drop the new specific dataset tables
    op.drop_table("translation_datasets")
    op.drop_table("voice_datasets")
    op.drop_table("dictionary_datasets")
