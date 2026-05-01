from fastapi import APIRouter

from app.api import (
    analytics,
    auth,
    exams,
    imports,
    reports,
    resources,
    students,
    subjects,
    teacher_tools,
    textbooks,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(students.router)
api_router.include_router(subjects.router)
api_router.include_router(exams.router)
api_router.include_router(imports.router)
api_router.include_router(analytics.router)
api_router.include_router(reports.router)
api_router.include_router(resources.router)
api_router.include_router(textbooks.router)
api_router.include_router(teacher_tools.router)
