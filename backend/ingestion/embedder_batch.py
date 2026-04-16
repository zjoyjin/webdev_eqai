"""
embedder_batch.py — Batch embedding generation using OpenAI API.

Design:
  - Accepts a list of (entry_id, lang, text) tuples
  - Sends them to OpenAI in configurable batches (default 50)
  - Retries with exponential backoff on rate limit / transient errors
  - Returns a list of (entry_id, lang, text, vector) ready for DB insert
"""

import logging
import time
from dataclasses import dataclass
from typing import Optional

from openai import OpenAI, RateLimitError, APIError

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EmbeddingInput:
    entry_id: str   # UUID as string
    lang: str       # 'en' or 'zh'
    text: str       # the text to embed


@dataclass
class EmbeddingResult:
    entry_id: str
    lang: str
    text: str
    vector: list[float]
    model_name: str


def generate_embeddings(
    inputs: list[EmbeddingInput],
    batch_size: int = None,
    max_retries: int = 5,
) -> tuple[list[EmbeddingResult], list[EmbeddingInput]]:
    """
    Generate embeddings for a list of EmbeddingInput items.

    Processes items in batches to respect API rate limits.
    Failed items are returned separately for logging — pipeline never crashes.

    Args:
        inputs:      List of (entry_id, lang, text) to embed.
        batch_size:  Items per API call. Defaults to config value.
        max_retries: Max retries per batch on rate limit / transient errors.

    Returns:
        (successes, failures)
        - successes: list of EmbeddingResult with vectors attached
        - failures:  list of EmbeddingInput that could not be embedded
    """
    batch_size = batch_size or settings.ingestion_batch_size
    client = OpenAI(api_key=settings.openai_api_key)

    successes: list[EmbeddingResult] = []
    failures: list[EmbeddingInput] = []

    # Split into batches
    batches = [inputs[i: i + batch_size] for i in range(0, len(inputs), batch_size)]
    logger.info(
        f"Embedding {len(inputs)} texts in {len(batches)} batches "
        f"(batch_size={batch_size}, model={settings.embedding_model})"
    )

    for batch_idx, batch in enumerate(batches):
        texts = [item.text for item in batch]
        batch_results = _embed_with_retry(
            client=client,
            texts=texts,
            model=settings.embedding_model,
            max_retries=max_retries,
            batch_idx=batch_idx,
        )

        if batch_results is None:
            # Entire batch failed after all retries
            logger.error(f"Batch {batch_idx} permanently failed — {len(batch)} inputs lost")
            failures.extend(batch)
            continue

        # Pair each vector with its input metadata
        for item, vector in zip(batch, batch_results):
            successes.append(EmbeddingResult(
                entry_id=item.entry_id,
                lang=item.lang,
                text=item.text,
                vector=vector,
                model_name=settings.embedding_model,
            ))

        logger.info(f"Batch {batch_idx + 1}/{len(batches)} done — {len(batch)} embedded")

    logger.info(
        f"Embedding complete: {len(successes)} success, {len(failures)} failed"
    )
    return successes, failures


def _embed_with_retry(
    client: OpenAI,
    texts: list[str],
    model: str,
    max_retries: int,
    batch_idx: int,
) -> Optional[list[list[float]]]:
    """
    Call the OpenAI embeddings API with exponential backoff retry.

    Returns list of vectors on success, None if all retries are exhausted.
    """
    delay = 2.0  # initial retry delay in seconds

    for attempt in range(1, max_retries + 1):
        try:
            response = client.embeddings.create(
                input=texts,
                model=model,
            )
            # API returns embeddings in the same order as input
            return [item.embedding for item in response.data]

        except RateLimitError as e:
            wait = delay * (2 ** (attempt - 1))  # exponential backoff
            logger.warning(
                f"Batch {batch_idx}: rate limit hit (attempt {attempt}/{max_retries}). "
                f"Retrying in {wait:.1f}s — {e}"
            )
            time.sleep(wait)

        except APIError as e:
            if attempt < max_retries:
                wait = delay * attempt
                logger.warning(
                    f"Batch {batch_idx}: API error (attempt {attempt}/{max_retries}). "
                    f"Retrying in {wait:.1f}s — {e}"
                )
                time.sleep(wait)
            else:
                logger.error(f"Batch {batch_idx}: API error after {max_retries} attempts — {e}")

        except Exception as e:
            logger.error(f"Batch {batch_idx}: Unexpected error — {e}")
            return None  # don't retry on unexpected errors

    return None  # exhausted retries
