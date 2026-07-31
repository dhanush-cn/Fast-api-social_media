"""add foreign-key to posts table

Revision ID: a8e0acff3519
Revises: f9264d6f9f7b
Create Date: 2026-07-31 07:58:35.491329

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8e0acff3519'
down_revision: Union[str, Sequence[str], None] = 'f9264d6f9f7b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('owner_id', sa.Integer(), nullable=False))
    op.create_foreign_key(
        'post_users_fk', 
        source_table="posts", 
        referent_table="users", 
        local_cols=['owner_id'], 
        remote_cols=['id'], 
        ondelete="CASCADE"
    )


def downgrade() -> None:
    op.drop_constraint('post_users_fk', table_name="posts")
    op.drop_column('posts', 'owner_id')