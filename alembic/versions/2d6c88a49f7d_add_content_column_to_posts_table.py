"""add content column to posts table

Revision ID: 2d6c88a49f7d
Revises: cb7ec144a278
Create Date: 2026-07-31 07:55:55.422661

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2d6c88a49f7d'
down_revision: Union[str, Sequence[str], None] = 'cb7ec144a278'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('content', sa.String(), nullable=False))


def downgrade() -> None:
    op.drop_column('posts', 'content')