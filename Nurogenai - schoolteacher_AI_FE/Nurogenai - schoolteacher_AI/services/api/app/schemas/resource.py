from app.schemas.base import CamelModel
from app.schemas.report import RecommendedResourceResponse


class RecommendedResourcesResponse(CamelModel):
    exam_id: str
    resources: list[RecommendedResourceResponse]
