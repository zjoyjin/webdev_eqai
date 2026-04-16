"""
queries.py — Database read/write operations for the RAG system.

All DB access goes through this module. No raw SQL outside of here.
Uses Supabase Python client (PostgREST) for simple operations.
Uses raw SQL via rpc() for vector search (pgvector).
"""

import logging
from dataclasses import asdict
from typing import Optional

from supabase import Client

from ingestion.transformers.normalizer import KnowledgeRecord
from ingestion.embedder_batch import EmbeddingResult

logger = logging.getLogger(__name__)


# =============================================================================
# INGESTION WRITES
# =============================================================================

def upsert_knowledge_entry(db: Client, record: KnowledgeRecord) -> Optional[str]:
    """
    Insert or update a knowledge entry.

    Uses measure_id_num as the conflict key — safe to run multiple times.

    Returns:
        The UUID of the inserted/updated row, or None on failure.
    """
    payload = {
        "measure_id_num":     record.measure_id_num,
        "measure_id_text":    record.measure_id_text,
        "module_cn":          record.module_cn,
        "module_en":          record.module_en,
        "module_code":        record.module_code,
        "measure_name_en":    record.measure_name_en,
        "measure_name_cn":    record.measure_name_cn,
        "measuregroup_title": record.measuregroup_title,
        "measuregroup_code":  record.measuregroup_code,
        "dimension_cn":       record.dimension_cn,
        "dimension_en":       record.dimension_en,
        "dimension_code":     record.dimension_code,
        "item_definition":    record.item_definition,
        "population":         record.population,
        "population_code":    record.population_code,
        "language":           record.language,
        "language_code":      record.language_code,
        "source_type":        record.source_type,
        "source_reference":   record.source_reference,
        "version":            record.version,
        "data_available":     record.data_available,
        "scheduled":          record.scheduled,
        # Guidance fields — NULL on first ingest, filled later
        "definition_cn":          record.definition_cn,
        "definition_en":          record.definition_en,
        "interpretation_cn":      record.interpretation_cn,
        "interpretation_en":      record.interpretation_en,
        "recommended_action_cn":  record.recommended_action_cn,
        "recommended_action_en":  record.recommended_action_en,
        "keywords_cn":            record.keywords_cn or [],
        "keywords_en":            record.keywords_en or [],
        "risk_level":             record.risk_level,
        "active":                 True,
    }

    try:
        result = (
            db.table("knowledge_entries")
            .upsert(payload, on_conflict="measure_id_num")
            .execute()
        )
        if result.data:
            return result.data[0]["id"]
        return None
    except Exception as e:
        logger.error(f"Upsert failed for {record.measure_id_num}: {e}")
        return None


def upsert_embedding(db: Client, result: EmbeddingResult) -> bool:
    """
    Insert or update an embedding row.

    Conflict key: (entry_id, lang) — replaces vector if model changes.

    Returns:
        True on success, False on failure.
    """
    payload = {
        "entry_id":       result.entry_id,
        "lang":           result.lang,
        "embedding_text": result.text,
        "embedding":      result.vector,
        "model_name":     result.model_name,
    }

    try:
        db.table("entry_embeddings").upsert(
            payload, on_conflict="entry_id,lang"
        ).execute()
        return True
    except Exception as e:
        logger.error(f"Embedding upsert failed for entry {result.entry_id} lang={result.lang}: {e}")
        return False


def log_ingestion_run(
    db: Client,
    filename: str,
    rows_processed: int,
    rows_inserted: int,
    rows_updated: int,
    rows_failed: int,
    error_details: Optional[list] = None,
) -> None:
    """Write an ingestion audit row."""
    try:
        db.table("ingestion_log").insert({
            "filename":       filename,
            "rows_processed": rows_processed,
            "rows_inserted":  rows_inserted,
            "rows_updated":   rows_updated,
            "rows_failed":    rows_failed,
            "error_details":  error_details or [],
        }).execute()
    except Exception as e:
        logger.error(f"Failed to write ingestion log: {e}")


# =============================================================================
# RAG RETRIEVAL READS
# =============================================================================

def vector_search(
    db: Client,
    query_vector: list[float],
    lang: str,
    top_k: int = 12,
    similarity_threshold: float = 0.68,
) -> list[dict]:
    """
    Perform cosine similarity search using pgvector.

    Calls a Supabase RPC function (SQL function defined below).
    Returns top_k entries above the similarity threshold.

    You must create the SQL function `match_knowledge_entries` in Supabase
    before calling this — see the function definition below.

    Args:
        query_vector: Embedded user query (must match embedding dimensions).
        lang:         'en' or 'zh' — filter to same-language embeddings.
        top_k:        Maximum candidates to return.
        similarity_threshold: Minimum cosine similarity score.

    Returns:
        List of dicts with entry fields + similarity score.
    """
    try:
        result = db.rpc(
            "match_knowledge_entries",
            {
                "query_embedding": query_vector,
                "match_lang":      lang,
                "match_threshold": similarity_threshold,
                "match_count":     top_k,
            },
        ).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Vector search failed: {e}")
        return []


def get_entry_by_id(db: Client, entry_id: str) -> Optional[dict]:
    """Fetch a single knowledge entry by UUID."""
    try:
        result = (
            db.table("knowledge_entries")
            .select("*")
            .eq("id", entry_id)
            .single()
            .execute()
        )
        return result.data
    except Exception:
        return None


# =============================================================================
# SQL FUNCTION: match_knowledge_entries
# Run this in Supabase SQL Editor once — referenced by vector_search() above
# =============================================================================
#
# CREATE OR REPLACE FUNCTION match_knowledge_entries(
#   query_embedding  VECTOR(1536),
#   match_lang       TEXT,
#   match_threshold  FLOAT,
#   match_count      INT
# )
# RETURNS TABLE (
#   id                  UUID,
#   measure_id_num      TEXT,
#   measure_name_en     TEXT,
#   measure_name_cn     TEXT,
#   measuregroup_title  TEXT,
#   dimension_cn        TEXT,
#   dimension_en        TEXT,
#   module_cn           TEXT,
#   module_en           TEXT,
#   item_definition     TEXT,
#   definition_en       TEXT,
#   definition_cn       TEXT,
#   interpretation_en   TEXT,
#   interpretation_cn   TEXT,
#   recommended_action_en TEXT,
#   recommended_action_cn TEXT,
#   source_reference    TEXT,
#   population          TEXT,
#   similarity          FLOAT
# )
# LANGUAGE sql STABLE AS $$
#   SELECT
#     ke.id,
#     ke.measure_id_num,
#     ke.measure_name_en,
#     ke.measure_name_cn,
#     ke.measuregroup_title,
#     ke.dimension_cn,
#     ke.dimension_en,
#     ke.module_cn,
#     ke.module_en,
#     ke.item_definition,
#     ke.definition_en,
#     ke.definition_cn,
#     ke.interpretation_en,
#     ke.interpretation_cn,
#     ke.recommended_action_en,
#     ke.recommended_action_cn,
#     ke.source_reference,
#     ke.population,
#     1 - (ee.embedding <=> query_embedding) AS similarity
#   FROM entry_embeddings ee
#   JOIN knowledge_entries ke ON ke.id = ee.entry_id
#   WHERE
#     ee.lang = match_lang
#     AND ke.active = true
#     AND 1 - (ee.embedding <=> query_embedding) > match_threshold
#   ORDER BY ee.embedding <=> query_embedding
#   LIMIT match_count;
# $$;
