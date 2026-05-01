"""add_textbooks_tables"""

revision = '7590a1885be4'
down_revision = '0001_initial'
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade() -> None:
    op.create_table(
        'textbooks',
        sa.Column('standard', sa.Integer(), nullable=False),
        sa.Column('medium', sa.String(length=100), nullable=False),
        sa.Column('subject', sa.String(length=255), nullable=False),
        sa.Column('term', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('source_file', sa.String(length=1024), nullable=False),
        sa.Column('source_url', sa.String(length=1024), nullable=True),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('source_file')
    )
    op.create_index(op.f('ix_textbooks_medium'), 'textbooks', ['medium'], unique=False)
    op.create_index(op.f('ix_textbooks_standard'), 'textbooks', ['standard'], unique=False)
    op.create_index(op.f('ix_textbooks_subject'), 'textbooks', ['subject'], unique=False)

    op.create_table(
        'textbook_chunks',
        sa.Column('textbook_id', sa.String(length=36), nullable=False),
        sa.Column('chapter_title', sa.String(length=255), nullable=True),
        sa.Column('section_title', sa.String(length=255), nullable=True),
        sa.Column('page_start', sa.Integer(), nullable=True),
        sa.Column('page_end', sa.Integer(), nullable=True),
        sa.Column('chunk_index', sa.Integer(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['textbook_id'], ['textbooks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_textbook_chunks_textbook_id'), 'textbook_chunks', ['textbook_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_textbook_chunks_textbook_id'), table_name='textbook_chunks')
    op.drop_table('textbook_chunks')
    op.drop_index(op.f('ix_textbooks_subject'), table_name='textbooks')
    op.drop_index(op.f('ix_textbooks_standard'), table_name='textbooks')
    op.drop_index(op.f('ix_textbooks_medium'), table_name='textbooks')
    op.drop_table('textbooks')
