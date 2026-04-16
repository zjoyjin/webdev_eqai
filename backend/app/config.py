"""
config.py — Central configuration using Pydantic Settings.

All values are read from environment variables (or a .env file).
Import `settings` wherever config is needed — never read os.environ directly.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # ── Supabase ──────────────────────────────────────────────────────────
    supabase_url: str
    supabase_service_key: str   # service role key (never expose to frontend)

    # ── OpenAI ────────────────────────────────────────────────────────────
    openai_api_key: str
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536

    # ── Anthropic (LLM) ───────────────────────────────────────────────────
    anthropic_api_key: str
    chat_model: str = "claude-3-5-haiku-20241022"

    # ── RAG parameters ────────────────────────────────────────────────────
    retrieval_top_k: int = 12        # candidates from vector search
    retrieval_top_n: int = 4         # entries passed to LLM after reranking
    similarity_threshold: float = 0.68  # minimum cosine score to accept

    # ── Ingestion ─────────────────────────────────────────────────────────
    ingestion_batch_size: int = 50   # records per embedding API call

    # ── App ───────────────────────────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton — loaded once, reused everywhere."""
    return Settings()


settings = get_settings()
