-- =============================================================================
-- EQAI Supabase initialization
-- Safe default: backend/service-role access only.
--
-- Run this in Supabase Dashboard -> SQL Editor.
-- Do not paste service role keys or database passwords into SQL.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
ALTER EXTENSION vector SET SCHEMA extensions;
SET search_path = public, extensions;

-- =============================================================================
-- KNOWLEDGE BASE
-- =============================================================================

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  measure_id_num        TEXT UNIQUE NOT NULL,
  measure_id_text       TEXT,

  module_cn             TEXT,
  module_en             TEXT,
  module_code           INTEGER,

  measure_name_en       TEXT,
  measure_name_cn       TEXT,
  measuregroup_title    TEXT,
  measuregroup_code     TEXT,

  dimension_cn          TEXT,
  dimension_en          TEXT,
  dimension_code        TEXT,

  item_definition       TEXT,

  population            TEXT,
  population_code       INTEGER,
  language              TEXT,
  language_code         INTEGER,

  source_type           TEXT,
  source_reference      TEXT,
  version               TEXT,

  definition_cn         TEXT,
  definition_en         TEXT,
  interpretation_cn     TEXT,
  interpretation_en     TEXT,
  recommended_action_cn TEXT,
  recommended_action_en TEXT,
  keywords_cn           TEXT[],
  keywords_en           TEXT[],
  risk_level            TEXT CHECK (risk_level IS NULL OR risk_level IN ('low', 'medium', 'high', 'critical')),

  data_available        BOOLEAN DEFAULT false,
  scheduled             BOOLEAN DEFAULT false,
  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE knowledge_entries IS
  'One row per psychological measurement dimension. Source of truth for EQAI retrieval.';

CREATE TABLE IF NOT EXISTS entry_embeddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  lang            TEXT NOT NULL CHECK (lang IN ('en', 'zh')),
  embedding_text  TEXT NOT NULL,
  embedding       VECTOR(1536),
  model_name      TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(entry_id, lang)
);

COMMENT ON TABLE entry_embeddings IS
  'Vector embeddings per language per knowledge entry.';

CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON entry_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE INDEX IF NOT EXISTS idx_embeddings_lang
  ON entry_embeddings (lang);

-- =============================================================================
-- PUBLIC ASSESSMENT CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS assessment_catalog (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT UNIQUE NOT NULL,
  payload      JSONB NOT NULL,
  source_url   TEXT,
  active       BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessment_catalog IS
  'Published assessment catalog payload served by the public Next API route.';

CREATE TABLE IF NOT EXISTS assessment_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_cn   TEXT UNIQUE NOT NULL,
  module_en   TEXT,
  module_code INTEGER UNIQUE NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessment_modules IS
  'Structured public assessment directory modules.';

CREATE TABLE IF NOT EXISTS assessment_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT UNIQUE NOT NULL,
  title_en    TEXT NOT NULL,
  title_cn    TEXT NOT NULL,
  title_full  TEXT,
  module_cn   TEXT NOT NULL REFERENCES assessment_modules(module_cn),
  module_code INTEGER NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessment_groups IS
  'Structured public assessment groups used by the directory API.';

ALTER TABLE assessment_groups
  DROP CONSTRAINT IF EXISTS assessment_groups_module_code_fkey;

CREATE TABLE IF NOT EXISTS assessment_measures (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_code    TEXT NOT NULL REFERENCES assessment_groups(code) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  desc_casual   TEXT,
  desc_academic TEXT,
  active        BOOLEAN NOT NULL DEFAULT true,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(group_code, code)
);

COMMENT ON TABLE assessment_measures IS
  'Structured public assessment dimensions/measures used by the directory API.';

CREATE INDEX IF NOT EXISTS idx_assessment_modules_active_sort
  ON assessment_modules (active, sort_order, module_code);
CREATE INDEX IF NOT EXISTS idx_assessment_groups_active_module
  ON assessment_groups (active, module_code, sort_order, code);
CREATE INDEX IF NOT EXISTS idx_assessment_measures_active_group
  ON assessment_measures (active, group_code, sort_order, code);

-- =============================================================================
-- CHAT / AUDIT TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang        TEXT,
  started_at  TIMESTAMPTZ DEFAULT now(),
  metadata    JSONB
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  lang             TEXT,
  cited_entry_ids  UUID[],
  safety_flagged   BOOLEAN DEFAULT false,
  no_results       BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session
  ON chat_messages (session_id, created_at);

CREATE TABLE IF NOT EXISTS safety_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID REFERENCES chat_sessions(id),
  message_content   TEXT NOT NULL,
  trigger_type      TEXT CHECK (trigger_type IN ('keyword', 'llm_detected')),
  keywords_matched  TEXT[],
  lang              TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_safety_events_session
  ON safety_events (session_id);

CREATE TABLE IF NOT EXISTS ingestion_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename        TEXT NOT NULL,
  rows_processed  INTEGER,
  rows_inserted   INTEGER,
  rows_updated    INTEGER,
  rows_failed     INTEGER,
  error_details   JSONB,
  ran_at          TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- UPDATED_AT TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

DROP TRIGGER IF EXISTS trg_knowledge_entries_updated_at ON knowledge_entries;
CREATE TRIGGER trg_knowledge_entries_updated_at
  BEFORE UPDATE ON knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_catalog_updated_at ON assessment_catalog;
CREATE TRIGGER trg_assessment_catalog_updated_at
  BEFORE UPDATE ON assessment_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_modules_updated_at ON assessment_modules;
CREATE TRIGGER trg_assessment_modules_updated_at
  BEFORE UPDATE ON assessment_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_groups_updated_at ON assessment_groups;
CREATE TRIGGER trg_assessment_groups_updated_at
  BEFORE UPDATE ON assessment_groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_measures_updated_at ON assessment_measures;
CREATE TRIGGER trg_assessment_measures_updated_at
  BEFORE UPDATE ON assessment_measures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- RAG VECTOR SEARCH RPC
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
LANGUAGE sql STABLE
SET search_path = public, extensions
AS $$
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
    1 - (ee.embedding <=> query_embedding) AS similarity
  FROM entry_embeddings ee
  JOIN knowledge_entries ke ON ke.id = ee.entry_id
  WHERE
    ee.lang = match_lang
    AND ke.active = true
    AND 1 - (ee.embedding <=> query_embedding) > match_threshold
  ORDER BY ee.embedding <=> query_embedding
  LIMIT match_count;
$$;

CREATE OR REPLACE FUNCTION get_ingestion_summary()
RETURNS TABLE (
  module_cn        TEXT,
  measure_name_en  TEXT,
  dimension_count  BIGINT,
  has_embeddings   BIGINT
)
LANGUAGE sql STABLE
SET search_path = public
AS $$
  SELECT
    ke.module_cn,
    ke.measure_name_en,
    COUNT(DISTINCT ke.id)       AS dimension_count,
    COUNT(DISTINCT ee.entry_id) AS has_embeddings
  FROM knowledge_entries ke
  LEFT JOIN entry_embeddings ee ON ee.entry_id = ke.id
  WHERE ke.active = true
  GROUP BY ke.module_cn, ke.measure_name_en
  ORDER BY ke.module_cn, ke.measure_name_en;
$$;

GRANT EXECUTE ON FUNCTION match_knowledge_entries TO service_role;
GRANT EXECUTE ON FUNCTION get_ingestion_summary TO service_role;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE knowledge_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_embeddings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages     ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_log     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "assessment_catalog_public_read_active" ON assessment_catalog;
DROP POLICY IF EXISTS "assessment_catalog_service_role_all" ON assessment_catalog;
DROP POLICY IF EXISTS "assessment_modules_public_read_active" ON assessment_modules;
DROP POLICY IF EXISTS "assessment_modules_service_role_all" ON assessment_modules;
DROP POLICY IF EXISTS "assessment_groups_public_read_active" ON assessment_groups;
DROP POLICY IF EXISTS "assessment_groups_service_role_all" ON assessment_groups;
DROP POLICY IF EXISTS "assessment_measures_public_read_active" ON assessment_measures;
DROP POLICY IF EXISTS "assessment_measures_service_role_all" ON assessment_measures;
DROP POLICY IF EXISTS "service_role_all" ON knowledge_entries;
DROP POLICY IF EXISTS "service_role_all" ON entry_embeddings;
DROP POLICY IF EXISTS "service_role_all" ON chat_sessions;
DROP POLICY IF EXISTS "service_role_all" ON chat_messages;
DROP POLICY IF EXISTS "service_role_all" ON safety_events;
DROP POLICY IF EXISTS "service_role_all" ON ingestion_log;

CREATE POLICY "assessment_catalog_public_read_active" ON assessment_catalog
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "assessment_catalog_service_role_all" ON assessment_catalog
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "assessment_modules_public_read_active" ON assessment_modules
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "assessment_modules_service_role_all" ON assessment_modules
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "assessment_groups_public_read_active" ON assessment_groups
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "assessment_groups_service_role_all" ON assessment_groups
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "assessment_measures_public_read_active" ON assessment_measures
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "assessment_measures_service_role_all" ON assessment_measures
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON knowledge_entries
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON entry_embeddings
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON chat_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON chat_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON safety_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON ingestion_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);
