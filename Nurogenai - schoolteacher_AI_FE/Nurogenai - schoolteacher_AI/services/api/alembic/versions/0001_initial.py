"""Initial schema."""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "0001_initial"
down_revision: str | None = None
branch_labels: Sequence[str] | None = None
depends_on: Sequence[str] | None = None


user_role = sa.String(length=20)
auth_provider = sa.String(length=20)
exam_type = sa.String(length=30)
resource_type = sa.String(length=30)
resource_difficulty = sa.String(length=20)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("provider", auth_provider, nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)

    op.create_table(
        "student_profiles",
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("class_grade", sa.String(length=50), nullable=False),
        sa.Column("section", sa.String(length=50), nullable=True),
        sa.Column("school_name", sa.String(length=255), nullable=False),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("target_goal", sa.String(length=255), nullable=True),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )

    op.create_table(
        "student_subjects",
        sa.Column("student_id", sa.String(length=36), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["student_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "name", name="uq_student_subject_name"),
    )
    op.create_index(
        op.f("ix_student_subjects_student_id"),
        "student_subjects",
        ["student_id"],
        unique=False,
    )

    op.create_table(
        "exams",
        sa.Column("student_id", sa.String(length=36), nullable=False),
        sa.Column("exam_name", sa.String(length=255), nullable=False),
        sa.Column("exam_type", exam_type, nullable=False),
        sa.Column("exam_date", sa.Date(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["student_id"], ["student_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_exams_exam_date"), "exams", ["exam_date"], unique=False)
    op.create_index(op.f("ix_exams_student_id"), "exams", ["student_id"], unique=False)

    op.create_table(
        "resource_catalog",
        sa.Column("subject", sa.String(length=120), nullable=False),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("type", resource_type, nullable=False),
        sa.Column("difficulty", resource_difficulty, nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_resource_catalog_subject"),
        "resource_catalog",
        ["subject"],
        unique=False,
    )

    op.create_table(
        "marks",
        sa.Column("exam_id", sa.String(length=36), nullable=False),
        sa.Column("subject_id", sa.String(length=36), nullable=False),
        sa.Column("marks_obtained", sa.Float(), nullable=False),
        sa.Column("max_marks", sa.Float(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["exam_id"], ["exams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["subject_id"], ["student_subjects.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("exam_id", "subject_id", name="uq_exam_subject"),
    )
    op.create_index(op.f("ix_marks_exam_id"), "marks", ["exam_id"], unique=False)
    op.create_index(op.f("ix_marks_subject_id"), "marks", ["subject_id"], unique=False)

    op.create_table(
        "reports",
        sa.Column("student_id", sa.String(length=36), nullable=False),
        sa.Column("exam_id", sa.String(length=36), nullable=False),
        sa.Column("input_hash", sa.String(length=64), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("strengths", sa.JSON(), nullable=False),
        sa.Column("weaknesses", sa.JSON(), nullable=False),
        sa.Column("priorities", sa.JSON(), nullable=False),
        sa.Column("weekly_plan", sa.JSON(), nullable=False),
        sa.Column("target_improvements", sa.JSON(), nullable=False),
        sa.Column("recommended_resources", sa.JSON(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["exam_id"], ["exams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["student_profiles.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "exam_id", "input_hash", name="uq_report_hash"),
    )
    op.create_index(op.f("ix_reports_exam_id"), "reports", ["exam_id"], unique=False)
    op.create_index(op.f("ix_reports_student_id"), "reports", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_reports_student_id"), table_name="reports")
    op.drop_index(op.f("ix_reports_exam_id"), table_name="reports")
    op.drop_table("reports")
    op.drop_index(op.f("ix_marks_subject_id"), table_name="marks")
    op.drop_index(op.f("ix_marks_exam_id"), table_name="marks")
    op.drop_table("marks")
    op.drop_index(op.f("ix_resource_catalog_subject"), table_name="resource_catalog")
    op.drop_table("resource_catalog")
    op.drop_index(op.f("ix_exams_student_id"), table_name="exams")
    op.drop_index(op.f("ix_exams_exam_date"), table_name="exams")
    op.drop_table("exams")
    op.drop_index(op.f("ix_student_subjects_student_id"), table_name="student_subjects")
    op.drop_table("student_subjects")
    op.drop_table("student_profiles")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    pass
