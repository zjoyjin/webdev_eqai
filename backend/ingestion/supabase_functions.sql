-- =============================================================================
-- Supabase SQL Functions for RAG Vector Search
-- Run these in Supabase SQL Editor AFTER running schema.sql
-- =============================================================================

-- =============================================================================
-- match_knowledge_entries
-- Called by the Python backend for semantic search.
-- Returns top-K knowledge entries ranked by cosine similarity.
-- =============================================================================

CREATE OR REPLACE FUNCTION match_knowledge_entries(
  query_embedding   VECTOR(1536),
  match_lang        TEXT,
  match_threshold   FLOAT DEFAULT 0.68,
  match_count       INT   DEFAULT 12
)
RETURNS TABLE (
  id                    UUID,
  measure_id_num        TEXT,
  measure_id_text       TEXT,
  measure_name_en       TEXT,
  measure_name_cn       TEXT,
  measuregroup_title    TEXT,
  measuregroup_code     TEXT,
  dimension_cn          TEXT,
  dimension_en          TEXT,
  dimension_code        TEXT,
  module_cn             TEXT,
  module_en             TEXT,
  item_definition       TEXT,
  definition_en         TEXT,
  definition_cn         TEXT,
  interpretation_en     TEXT,
  interpretation_cn     TEXT,
  recommended_action_en TEXT,
  recommended_action_cn TEXT,
  keywords_en           TEXT[],
  keywords_cn           TEXT[],
  source_reference      TEXT,
  source_type           TEXT,
  population            TEXT,
  risk_level            TEXT,
  similarity            FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT
    ke.id,
    ke.measure_id_num,
    ke.measure_id_text,
    ke.measure_name_en,
    ke.measure_name_cn,
    ke.measuregroup_title,
    ke.measuregroup_code,
    ke.dimension_cn,
    ke.dimension_en,
    ke.dimension_code,
    ke.module_cn,
    ke.module_en,
    ke.item_definition,
    ke.definition_en,
    ke.definition_cn,
    ke.interpretation_en,
    ke.interpretation_cn,
    ke.recommended_action_en,
    ke.recommended_action_cn,
    ke.keywords_en,
    ke.keywords_cn,
    ke.source_reference,
    ke.source_type,
    ke.population,
    ke.risk_level,
    -- cosine similarity: 1 - cosine_distance
    1 - (ee.embedding <=> query_embedding) AS similarity
  FROM entry_embeddings ee
  JOIN knowledge_entries ke ON ke.id = ee.entry_id
  WHERE
    ee.lang = match_lang
    AND ke.active = true
    AND 1 - (ee.embedding <=> query_embedding) > match_threshold
  ORDER BY ee.embedding <=> query_embedding  -- ascending distance = descending similarity
  LIMIT match_count;
$$;

-- Grant execute to service role (backend)
GRANT EXECUTE ON FUNCTION match_knowledge_entries TO service_role;


-- =============================================================================
-- get_ingestion_summary
-- Admin utility: quick view of what's in the knowledge base
-- =============================================================================

CREATE OR REPLACE FUNCTION get_ingestion_summary()
RETURNS TABLE (
  module_cn       TEXT,
  measure_name_en TEXT,
  dimension_count BIGINT,
  has_embeddings  BIGINT
)
LANGUAGE sql STABLE AS $$
  SELECT
    ke.module_cn,
    ke.measure_name_en,
    COUNT(DISTINCT ke.id)                                             AS dimension_count,
    COUNT(DISTINCT ee.entry_id)                                       AS has_embeddings
  FROM knowledge_entries ke
  LEFT JOIN entry_embeddings ee ON ee.entry_id = ke.id
  WHERE ke.active = true
  GROUP BY ke.module_cn, ke.measure_name_en
  ORDER BY ke.module_cn, ke.measure_name_en;
$$;

GRANT EXECUTE ON FUNCTION get_ingestion_summary TO service_role;
