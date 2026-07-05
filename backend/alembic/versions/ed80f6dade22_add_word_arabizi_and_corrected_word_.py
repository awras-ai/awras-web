"""add_word_arabizi_and_corrected_word_arabizi_fields

Revision ID: ed80f6dade22
Revises: remove_local_user_storage
Create Date: 2026-07-05 00:13:42.362878

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ed80f6dade22'
down_revision: Union[str, Sequence[str], None] = 'remove_local_user_storage'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('dictionary_annotations', sa.Column('corrected_word', sa.Text(), nullable=True))
    op.add_column('dictionary_annotations', sa.Column('corrected_word_arabizi', sa.Text(), nullable=True))
    op.add_column('dictionary_entries', sa.Column('word_arabizi', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('dictionary_entries', 'word_arabizi')
    op.drop_column('dictionary_annotations', 'corrected_word_arabizi')
    op.drop_column('dictionary_annotations', 'corrected_word')
