from __future__ import annotations

from openai import OpenAI

from app.core.config import get_settings

DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small"


class EmbeddingService:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.model = self.settings.openai_embedding_model or DEFAULT_EMBEDDING_MODEL
        self.client = OpenAI(api_key=self.settings.openai_api_key) if self.settings.openai_api_key else None

    @property
    def is_configured(self) -> bool:
        return self.client is not None

    def embed_text(self, text: str) -> list[float] | None:
        if not self.client or not text.strip():
            return None
        response = self.client.embeddings.create(
            model=self.model,
            input=text,
        )
        return response.data[0].embedding
