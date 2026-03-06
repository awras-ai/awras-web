"""add_google_oauth_fields

Revision ID: add_google_oauth_fields
Revises: a1b2c3d4e5f6
Create Date: 2026-03-04 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "add_google_oauth_fields"
down_revision: Union[str, Sequence[str], None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Make hashed_password nullable for OAuth users
    op.alter_column("users", "hashed_password", nullable=True)

    # Add OAuth columns
    op.add_column(
        "users",
        sa.Column("oauth_provider", sa.String(length=50), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("oauth_sub", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("oauth_profile_picture_url", sa.String(length=1000), nullable=True),
    )

    # Add index on oauth_sub for lookups
    op.create_index(op.f("ix_users_oauth_sub"), "users", ["oauth_sub"], unique=False)

    # Add unique constraint on (oauth_provider, oauth_sub)
    op.create_unique_constraint(
        "uq_users_oauth_provider_sub",
        "users",
        ["oauth_provider", "oauth_sub"],
    )


def downgrade() -> None:
    """Downgrade schema."""
    # Drop unique constraint
    op.drop_constraint("uq_users_oauth_provider_sub", "users", type_="unique")

    # Drop index
    op.drop_index(op.f("ix_users_oauth_sub"), table_name="users")

    # Drop OAuth columns
    op.drop_column("users", "oauth_profile_picture_url")
    op.drop_column("users", "oauth_sub")
    op.drop_column("users", "oauth_provider")

    # Make hashed_password not nullable again
    op.alter_column("users", "hashed_password", nullable=False)
