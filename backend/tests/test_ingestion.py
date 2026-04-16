"""
test_ingestion.py — Unit tests for the ingestion pipeline.

Run with:  pytest tests/test_ingestion.py -v
No network calls are made — embeddings and DB are mocked.
"""

import sys
from pathlib import Path
import pytest
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from ingestion.loaders.dataset_loader import _coerce_types, MODULE_EN_MAP
from ingestion.transformers.normalizer import normalize_row, _build_embedding_text_en, _build_embedding_text_zh


# ── Fixtures ─────────────────────────────────────────────────────────────────

def make_sample_row(**overrides) -> pd.Series:
    """Return a minimal valid DataFrame row for a knowledge entry."""
    base = {
        "measure_id_num":     "EQAI_16PF_01_212_V0",
        "measure_id_text":    "16PF_乐群性_children/youth_CN_adopted_V0",
        "module_cn":          "能力与发展",
        "module_en":          "Ability & Development",
        "module_code":        2,
        "measure_name_en":    "Cattell's 16 Personality Factors Test",
        "measure_name_cn":    "卡特尔十六种人格因素测验",
        "measuregroup_title": "EQAI人格因素测验",
        "measuregroup_code":  "16PF",
        "dimension_cn":       "乐群性",
        "dimension_en":       None,
        "dimension_code":     "01",
        "item_definition":    'A1 INTEGER "I know how to comfort others" rated on a five point scale.',
        "population":         "children/youth",
        "population_code":    2,
        "language":           "CN",
        "language_code":      1,
        "source_type":        "adopted",
        "source_reference":   "OpenPsychometrics",
        "version":            "V0",
        "data_available":     True,
        "scheduled":          True,
    }
    base.update(overrides)
    return pd.Series(base)


# ── Loader tests ──────────────────────────────────────────────────────────────

class TestDatasetLoader:

    def test_module_en_map_completeness(self):
        """All expected Chinese module names have English mappings."""
        expected_modules = {"身心健康", "能力与发展", "家长参与"}
        assert expected_modules == set(MODULE_EN_MAP.keys())

    def test_coerce_booleans(self):
        df = pd.DataFrame([{"scheduled": "TRUE", "data_available": "yes"}])
        result = _coerce_types(df)
        assert result["scheduled"].iloc[0] is True
        assert result["data_available"].iloc[0] is True

    def test_coerce_false_booleans(self):
        df = pd.DataFrame([{"scheduled": "FALSE", "data_available": "no"}])
        result = _coerce_types(df)
        assert result["scheduled"].iloc[0] is False

    def test_coerce_integer_columns(self):
        df = pd.DataFrame([{"module_code": "2", "population_code": "3"}])
        result = _coerce_types(df)
        assert result["module_code"].iloc[0] == 2


# ── Normalizer tests ──────────────────────────────────────────────────────────

class TestNormalizer:

    def test_valid_row_produces_record(self):
        row = make_sample_row()
        record = normalize_row(row)
        assert record is not None
        assert record.measure_id_num == "EQAI_16PF_01_212_V0"
        assert record.dimension_cn == "乐群性"

    def test_missing_measure_id_returns_none(self):
        row = make_sample_row(measure_id_num=None)
        record = normalize_row(row)
        assert record is None

    def test_embedding_texts_are_built(self):
        row = make_sample_row()
        record = normalize_row(row)
        assert record.embedding_text_en != ""
        assert record.embedding_text_zh != ""

    def test_embedding_text_en_contains_measure_name(self):
        row = make_sample_row()
        record = normalize_row(row)
        assert "Cattell" in record.embedding_text_en

    def test_embedding_text_zh_contains_chinese(self):
        row = make_sample_row()
        record = normalize_row(row)
        assert "卡特尔" in record.embedding_text_zh or "乐群性" in record.embedding_text_zh

    def test_content_hash_is_stable(self):
        row = make_sample_row()
        r1 = normalize_row(row)
        r2 = normalize_row(row)
        assert r1.content_hash == r2.content_hash

    def test_content_hash_changes_with_content(self):
        row1 = make_sample_row(item_definition="Item A")
        row2 = make_sample_row(item_definition="Item B")
        r1 = normalize_row(row1)
        r2 = normalize_row(row2)
        assert r1.content_hash != r2.content_hash

    def test_guidance_fields_default_none(self):
        row = make_sample_row()
        record = normalize_row(row)
        assert record.recommended_action_en is None
        assert record.interpretation_cn is None
        assert record.risk_level is None

    def test_keywords_default_empty_list(self):
        row = make_sample_row()
        record = normalize_row(row)
        assert record.keywords_en == []
        assert record.keywords_cn == []


# ── Embedding text builder tests ───────────────────────────────────────────────

class TestEmbeddingTextBuilders:

    def test_en_falls_back_to_cn_dimension(self):
        """When dimension_en is None, should include dimension_cn in EN text."""
        row = make_sample_row(dimension_en=None, dimension_cn="乐群性")
        record = normalize_row(row)
        assert "乐群性" in record.embedding_text_en

    def test_en_uses_dimension_en_when_available(self):
        row = make_sample_row(dimension_en="Warmth")
        record = normalize_row(row)
        assert "Warmth" in record.embedding_text_en

    def test_item_definition_truncated_to_800_chars(self):
        long_text = "A" * 2000
        row = make_sample_row(item_definition=long_text)
        record = normalize_row(row)
        # Each embedding text should not exceed the cap
        assert len(record.embedding_text_en) < 1200  # some overhead for other fields

    def test_zh_includes_population_translation(self):
        row = make_sample_row(population="parent")
        record = normalize_row(row)
        assert "家长" in record.embedding_text_zh
