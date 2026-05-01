from enum import StrEnum


class UserRole(StrEnum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"
    ADMIN = "admin"


class AuthProvider(StrEnum):
    PASSWORD = "password"
    GOOGLE = "google"


class ExamType(StrEnum):
    UNIT_TEST = "unit_test"
    MONTHLY_TEST = "monthly_test"
    MIDTERM = "midterm"
    QUARTERLY = "quarterly"
    HALF_YEARLY = "half_yearly"
    ANNUAL = "annual"


class PerformanceBand(StrEnum):
    EXCELLENT = "Excellent"
    GOOD = "Good"
    AVERAGE = "Average"
    NEEDS_IMPROVEMENT = "Needs Improvement"


class TrendStatus(StrEnum):
    IMPROVING = "improving"
    DECLINING = "declining"
    STABLE = "stable"
    INSUFFICIENT_DATA = "insufficient_data"


class ResourceType(StrEnum):
    VIDEO = "video"
    WORKSHEET = "worksheet"
    QUIZ = "quiz"
    NOTES = "notes"
    COURSE = "course"


class ResourceDifficulty(StrEnum):
    EASY = "easy"
    MEDIUM = "medium"
    ADVANCED = "advanced"
