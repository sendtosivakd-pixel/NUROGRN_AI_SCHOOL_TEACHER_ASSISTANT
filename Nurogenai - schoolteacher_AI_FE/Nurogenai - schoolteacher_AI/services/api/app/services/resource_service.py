from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.enums import ResourceDifficulty, ResourceType
from app.models.resource_catalog import ResourceCatalog

DEFAULT_RESOURCES = [
    {
        "subject": "Mathematics",
        "topic": "Algebra basics",
        "title": "Khan Academy: Intro to Algebra",
        "url": "https://www.khanacademy.org/math/algebra",
        "type": ResourceType.COURSE,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "Mathematics",
        "topic": "Fractions practice",
        "title": "Math Is Fun: Fractions Worksheets",
        "url": "https://www.mathsisfun.com/worksheets/fractions-worksheets.html",
        "type": ResourceType.WORKSHEET,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "Mathematics",
        "topic": "Arithmetic speed drills",
        "title": "Corbettmaths Arithmetic Practice",
        "url": "https://corbettmaths.com/tag/arithmetic/",
        "type": ResourceType.QUIZ,
        "difficulty": ResourceDifficulty.MEDIUM,
    },
    {
        "subject": "Science",
        "topic": "Daily concept revision",
        "title": "Khan Academy: Middle School Science",
        "url": "https://www.khanacademy.org/science/middle-school-earth-and-space-science",
        "type": ResourceType.COURSE,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "Science",
        "topic": "Experiment-based recall",
        "title": "FuseSchool Science Videos",
        "url": "https://www.youtube.com/@fuseschool",
        "type": ResourceType.VIDEO,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "English",
        "topic": "Grammar exercises",
        "title": "British Council Grammar Practice",
        "url": "https://learnenglish.britishcouncil.org/grammar",
        "type": ResourceType.QUIZ,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "English",
        "topic": "Reading comprehension",
        "title": "ReadTheory Comprehension Practice",
        "url": "https://readtheory.org/",
        "type": ResourceType.COURSE,
        "difficulty": ResourceDifficulty.MEDIUM,
    },
    {
        "subject": "Social Science",
        "topic": "Chapter summary notes",
        "title": "BBC Bitesize Humanities Guides",
        "url": "https://www.bbc.co.uk/bitesize",
        "type": ResourceType.NOTES,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "Computer Science",
        "topic": "Programming fundamentals",
        "title": "CS Unplugged Activities",
        "url": "https://www.csunplugged.org/en/",
        "type": ResourceType.NOTES,
        "difficulty": ResourceDifficulty.EASY,
    },
    {
        "subject": "Physics",
        "topic": "Formula revision",
        "title": "Physics Online Formula Revision",
        "url": "https://www.youtube.com/@PhysicsOnline",
        "type": ResourceType.VIDEO,
        "difficulty": ResourceDifficulty.MEDIUM,
    },
    {
        "subject": "Chemistry",
        "topic": "Reaction concepts",
        "title": "Crash Course Chemistry",
        "url": "https://www.youtube.com/playlist?list=PL8dPuuaLjXtPHzzYuWy6fYEaX9mQQ8oGr",
        "type": ResourceType.VIDEO,
        "difficulty": ResourceDifficulty.MEDIUM,
    },
    {
        "subject": "Biology",
        "topic": "Diagram recall",
        "title": "Amoeba Sisters Biology",
        "url": "https://www.youtube.com/@AmoebaSisters",
        "type": ResourceType.VIDEO,
        "difficulty": ResourceDifficulty.EASY,
    },
]


def normalize_subject_name(value: str) -> str:
    aliases = {
        "math": "mathematics",
        "maths": "mathematics",
        "mathematics": "mathematics",
        "english language": "english",
        "social studies": "social science",
        "sst": "social science",
        "cs": "computer science",
    }
    lowered = value.strip().lower()
    return aliases.get(lowered, lowered)


def seed_resource_catalog(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(ResourceCatalog)) > 0:
        return
    for item in DEFAULT_RESOURCES:
        db.add(ResourceCatalog(**item))
    db.commit()


def recommend_resources(db: Session, priorities: list[dict], limit: int = 6) -> list[dict]:
    if not priorities:
        return []

    catalog = db.scalars(select(ResourceCatalog).order_by(ResourceCatalog.subject, ResourceCatalog.topic)).all()
    recommendations: list[dict] = []
    seen_ids: set[str] = set()

    for priority in priorities:
        normalized_priority = normalize_subject_name(priority["subject_name"])
        for resource in catalog:
            if normalize_subject_name(resource.subject) != normalized_priority:
                continue
            if resource.id in seen_ids:
                continue
            recommendations.append(
                {
                    "id": resource.id,
                    "subject": resource.subject,
                    "topic": resource.topic,
                    "title": resource.title,
                    "url": resource.url,
                    "type": resource.type,
                    "difficulty": resource.difficulty,
                    "reason": f"Recommended for {priority['subject_name']} because {priority['reason']}.",
                }
            )
            seen_ids.add(resource.id)
            if len(recommendations) >= limit:
                return recommendations

    for resource in catalog:
        if resource.id in seen_ids:
            continue
        recommendations.append(
            {
                "id": resource.id,
                "subject": resource.subject,
                "topic": resource.topic,
                "title": resource.title,
                "url": resource.url,
                "type": resource.type,
                "difficulty": resource.difficulty,
                "reason": "General reinforcement resource from the vetted catalog.",
            }
        )
        if len(recommendations) >= limit:
            break

    return recommendations
