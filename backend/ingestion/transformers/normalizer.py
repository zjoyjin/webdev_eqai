"""
normalizer.py — Transform a raw DataFrame row into a validated KnowledgeRecord.

Responsibilities:
  - Map DataFrame columns to the KnowledgeRecord model
  - Build the embedding text strings (EN + ZH) for pgvector
  - Validate that required fields are present before DB insert
  - Produce a content hash for change detection on re-ingestion
"""

import hashlib
import logging
import unicodedata
from dataclasses import dataclass, field
from typing import Optional

import pandas as pd

logger = logging.getLogger(__name__)


@dataclass
class KnowledgeRecord:
    """
    Clean, validated representation of one measurement dimension row.
    Maps 1:1 to a knowledge_entries DB row.
    """

    # ── Required identifiers ─────────────────────────────────────────────
    measure_id_num:     str
    measure_id_text:    Optional[str]

    # ── Module / category ────────────────────────────────────────────────
    module_cn:          Optional[str]
    module_en:          Optional[str]
    module_code:        Optional[int]

    # ── Measure group ────────────────────────────────────────────────────
    measure_name_en:    Optional[str]
    measure_name_cn:    Optional[str]
    measuregroup_title: Optional[str]
    measuregroup_code:  Optional[str]

    # ── Dimension ────────────────────────────────────────────────────────
    dimension_cn:       Optional[str]
    dimension_en:       Optional[str]   # NULL initially
    dimension_code:     Optional[str]

    # ── Item content ─────────────────────────────────────────────────────
    item_definition:    Optional[str]

    # ── Population / language / source ───────────────────────────────────
    population:         Optional[str]
    population_code:    Optional[int]
    language:           Optional[str]
    language_code:      Optional[int]
    source_type:        Optional[str]
    source_reference:   Optional[str]
    version:            Optional[str]

    # ── Status ───────────────────────────────────────────────────────────
    data_available:     bool = False
    scheduled:          bool = False

    # ── Guidance (NULL until enriched) ───────────────────────────────────
    definition_cn:          Optional[str] = None
    definition_en:          Optional[str] = None
    interpretation_cn:      Optional[str] = None
    interpretation_en:      Optional[str] = None
    recommended_action_cn:  Optional[str] = None
    recommended_action_en:  Optional[str] = None
    keywords_cn:            list = field(default_factory=list)
    keywords_en:            list = field(default_factory=list)
    risk_level:             Optional[str] = None

    # ── Computed at build time ────────────────────────────────────────────
    embedding_text_en:  str = ""
    embedding_text_zh:  str = ""
    content_hash:       str = ""


def normalize_row(row: pd.Series) -> Optional[KnowledgeRecord]:
    """
    Convert a single DataFrame row into a KnowledgeRecord.

    Returns None if the row is invalid (missing required fields),
    so the pipeline can skip and count failures without crashing.
    """
    measure_id_num = _get(row, "measure_id_num")
    if not measure_id_num:
        logger.warning("Row skipped: missing measure_id_num")
        return None

    # Build record
    record = KnowledgeRecord(
        measure_id_num     = measure_id_num,
        measure_id_text    = _get(row, "measure_id_text"),
        module_cn          = _get(row, "module_cn"),
        module_en          = _get(row, "module_en"),
        module_code        = _get_int(row, "module_code"),
        measure_name_en    = _get(row, "measure_name_en"),
        measure_name_cn    = _get(row, "measure_name_cn"),
        measuregroup_title = _get(row, "measuregroup_title"),
        measuregroup_code  = _get(row, "measuregroup_code"),
        dimension_cn       = _get(row, "dimension_cn"),
        dimension_en       = _get(row, "dimension_en"),
        dimension_code     = _get(row, "dimension_code"),
        item_definition    = _get(row, "item_definition"),
        population         = _get(row, "population"),
        population_code    = _get_int(row, "population_code"),
        language           = _get(row, "language"),
        language_code      = _get_int(row, "language_code"),
        source_type        = _get(row, "source_type"),
        source_reference   = _get(row, "source_reference"),
        version            = _get(row, "version"),
        data_available     = bool(_get(row, "data_available")),
        scheduled          = bool(_get(row, "scheduled")),
    )

    # Build embedding texts
    record.embedding_text_en = _build_embedding_text_en(record)
    record.embedding_text_zh = _build_embedding_text_zh(record)

    # Content hash — used to detect changes on re-ingestion
    record.content_hash = _hash(record.embedding_text_en + record.embedding_text_zh)

    return record


def normalize_dataframe(df: pd.DataFrame) -> tuple[list[KnowledgeRecord], list[dict]]:
    """
    Normalize all rows in a DataFrame.

    Returns:
        (valid_records, failures)
        - valid_records: list of KnowledgeRecord ready for ingestion
        - failures: list of dicts with row index and error info
    """
    valid: list[KnowledgeRecord] = []
    failures: list[dict] = []

    for idx, row in df.iterrows():
        try:
            record = normalize_row(row)
            if record is not None:
                valid.append(record)
        except Exception as e:
            logger.error(f"Row {idx} normalization failed: {e}")
            failures.append({"row_index": idx, "error": str(e), "row": row.to_dict()})

    logger.info(f"Normalized: {len(valid)} valid, {len(failures)} failed")
    return valid, failures


# ── Embedding text builders ───────────────────────────────────────────────────

def _build_embedding_text_en(r: KnowledgeRecord) -> str:
    """
    Construct the English string to be embedded.

    Strategy: combine the most semantically meaningful fields so the vector
    captures what this dimension is, what questionnaire it belongs to,
    and what the items measure.

    Item definition is truncated to 800 chars to keep token cost reasonable.
    """
    parts = []

    if r.measure_name_en:
        parts.append(r.measure_name_en)

    if r.dimension_en:
        parts.append(f"Dimension: {r.dimension_en}")
    elif r.dimension_cn:
        # Fall back to Chinese dimension name until English is enriched
        parts.append(f"Dimension: {r.dimension_cn}")

    if r.module_en:
        parts.append(f"Module: {r.module_en}")

    if r.population:
        parts.append(f"Population: {r.population}")

    if r.item_definition:
        # First 800 chars captures the most diagnostic items
        parts.append(_clean_text(r.item_definition[:800]))

    return " | ".join(filter(None, parts))


def _build_embedding_text_zh(r: KnowledgeRecord) -> str:
    """
    Construct the Chinese string to be embedded.

    Uses all available Chinese fields. Item definitions are currently in
    English in this dataset version, so they are appended in English.
    """
    parts = []

    if r.measure_name_cn:
        parts.append(r.measure_name_cn)

    if r.measuregroup_title:
        parts.append(r.measuregroup_title)

    if r.dimension_cn:
        parts.append(f"维度：{r.dimension_cn}")

    if r.module_cn:
        parts.append(f"模块：{r.module_cn}")

    if r.population:
        pop_zh = {"children/youth": "儿童/青少年", "parent": "家长", "adult": "成人"}
        parts.append(f"适用对象：{pop_zh.get(r.population, r.population)}")

    if r.item_definition:
        parts.append(_clean_text(r.item_definition[:800]))

    return " | ".join(filter(None, parts))


# ── Private helpers ───────────────────────────────────────────────────────────

def _get(row: pd.Series, col: str) -> Optional[str]:
    """Safely get a string value from a row, returning None if missing."""
    val = row.get(col)
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    return str(val).strip() or None


def _get_int(row: pd.Series, col: str) -> Optional[int]:
    """Safely get an integer value from a row."""
    val = row.get(col)
    if val is None or (isinstance(val, float) and pd.isna(val)):
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def _clean_text(text: str) -> str:
    """Normalize unicode and collapse whitespace."""
    text = unicodedata.normalize("NFC", text)
    return " ".join(text.split())


def _hash(content: str) -> str:
    """MD5 hash of content string for change detection."""
    return hashlib.md5(content.encode("utf-8")).hexdigest()
