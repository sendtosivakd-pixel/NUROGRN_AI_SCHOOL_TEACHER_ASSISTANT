"""add textbook chunk embeddings

Revision ID: c7f8e9a1b2c3
Revises: 7590a1885be4
Create Date: 2026-04-09
"""

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector


revision = 'c7f8e9a1b2c3'
down_revision = '7590a1885be4'
branch_labels = None
depends_on = None


EMBEDDING_DIMENSION = 1536


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column('textbook_chunks', sa.Column('embedding', Vector(EMBEDDING_DIMENSION), nullable=True))
    op.add_column('textbook_chunks', sa.Column('embedding_model', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('textbook_chunks', 'embedding_model')
    op.drop_column('textbook_chunks', 'embedding')
