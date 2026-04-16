-- =============================================================================
-- EQAI RAG Chatbot — Supabase Schema
-- Run this in Supabase SQL Editor before ingestion
-- =============================================================================

-- Enable pgvector extension (required once per project)
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- KNOWLEDGE ENTRIES
-- Core table — one row per measurement dimension (subscale)
-- =============================================================================

CREATE TABLE IF NOT EXISTS knowledge_entries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ── Stable unique identifier (used for upsert / deduplication) ──────────
  measure_id_num        TEXT UNIQUE NOT NULL,  -- e.g. EQAI_16PF_01_212_V0
  measure_id_text       TEXT,                  -- e.g. 16PF_乐群性_children/youth_CN_adopted_V0

  -- ── Module / Category ───────────────────────────────────────────────────
  module_cn             TEXT,   -- 能力与发展 | 身心健康 | 家长参与
  module_en             TEXT,   -- Ability & Development | Mental Health | Parent Involvement
  module_code           INTEGER,

  -- ── Measure Group (the full questionnaire / test) ────────────────────────
  measure_name_en       TEXT,   -- Cattell's 16 Personality Factors Test
  measure_name_cn       TEXT,   -- 卡特尔十六种人格因素测验
  measuregroup_title    TEXT,   -- EQAI人格因素测验 (internal EQAI name)
  measuregroup_code     TEXT,   -- 16PF (short code)

  -- ── Dimension / Subscale ─────────────────────────────────────────────────
  dimension_cn          TEXT,   -- 乐群性  (from dataset: measure column)
  dimension_en          TEXT,   -- NULL initially — enriched later
  dimension_code        TEXT,   -- 01, 02 ...

  -- ── Item Definitions (rich descriptive text for embedding) ───────────────
  item_definition       TEXT,   -- full item text block from measure_define

  -- ── Population & Language ────────────────────────────────────────────────
  population            TEXT,   -- children/youth | parent | adult
  population_code       INTEGER,
  language              TEXT,   -- CN | EN | bilingual
  language_code         INTEGER,

  -- ── Source / Provenance ──────────────────────────────────────────────────
  source_type           TEXT,   -- adopted | original
  source_reference      TEXT,   -- OpenPsychometrics | Data repository
  version               TEXT,   -- V0

  -- ── Guidance Fields (NULL until manual enrichment) ───────────────────────
  definition_cn         TEXT,
  definition_en         TEXT,
  interpretation_cn     TEXT,
  interpretation_en     TEXT,
  recommended_action_cn TEXT,
  recommended_action_en TEXT,
  keywords_cn           TEXT[],
  keywords_en           TEXT[],
  risk_level            TEXT CHECK (risk_level IN ('low', 'medium', 'high', 'critical', NULL)),

  -- ── Admin ─────────────────────────────────────────────────────────────────
  data_available        BOOLEAN DEFAULT false,
  scheduled             BOOLEAN DEFAULT false,
  active                BOOLEAN DEFAULT true,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE knowledge_entries IS
  'One row per psychological measurement dimension. Bilingual. Source of truth for RAG retrieval.';

-- =============================================================================
-- EMBEDDINGS
-- Separate table so we can re-embed without touching main data
-- Each entry gets two rows: lang=en and lang=zh
-- =============================================================================

CREATE TABLE IF NOT EXISTS entry_embeddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id        UUID NOT NULL REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  lang            TEXT NOT NULL CHECK (lang IN ('en', 'zh')),
  embedding_text  TEXT NOT NULL,    -- the exact string that was embedded (for audit)
  embedding       VECTOR(1536),     -- matches text-embedding-3-small dimensions
  model_name      TEXT NOT NULL,    -- e.g. text-embedding-3-small
  created_at      TIMESTAMPTZ DEFAULT now(),

  UNIQUE(entry_id, lang)            -- one vector per language per entry
);

COMMENT ON TABLE entry_embeddings IS
  'Vector embeddings per language per knowledge entry. Separate table allows re-embedding without data loss.';

-- Index for fast cosine similarity search
-- IVFFlat is efficient for up to ~500k rows. Switch to HNSW for larger sets.
CREATE INDEX IF NOT EXISTS idx_embeddings_vector
  ON entry_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);   -- lists = sqrt(num_rows), tune after full data load

-- Index for language filter (always used alongside vector search)
CREATE INDEX IF NOT EXISTS idx_embeddings_lang
  ON entry_embeddings (lang);

-- =============================================================================
-- CHAT SESSIONS
-- One session = one browser conversation
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lang        TEXT,             -- detected session language: zh | en
  started_at  TIMESTAMPTZ DEFAULT now(),
  metadata    JSONB             -- page context, user agent, etc.
);

-- =============================================================================
-- CHAT MESSAGES
-- One row per user message or assistant response
-- =============================================================================

CREATE TABLE IF NOT EXISTS chat_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  lang             TEXT,
  cited_entry_ids  UUID[],          -- which knowledge_entries were cited
  safety_flagged   BOOLEAN DEFAULT false,
  no_results       BOOLEAN DEFAULT false,  -- true if RAG found nothing
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_session
  ON chat_messages (session_id, created_at);

-- =============================================================================
-- SAFETY EVENTS
-- Logged whenever a crisis / self-harm signal is detected
-- =============================================================================

CREATE TABLE IF NOT EXISTS safety_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        UUID REFERENCES chat_sessions(id),
  message_content   TEXT NOT NULL,
  trigger_type      TEXT CHECK (trigger_type IN ('keyword', 'llm_detected')),
  keywords_matched  TEXT[],
  lang              TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- INGESTION LOG
-- Tracks every pipeline run for auditability
-- =============================================================================

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
-- AUTO-UPDATE updated_at on knowledge_entries
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_knowledge_entries_updated_at
  BEFORE UPDATE ON knowledge_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (recommended for Supabase)
-- Enable after confirming service role key is used for backend writes
-- =============================================================================

ALTER TABLE knowledge_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_embeddings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_log       ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (backend uses service key)
CREATE POLICY "service_role_all" ON knowledge_entries   FOR ALL USING (true);
CREATE POLICY "service_role_all" ON entry_embeddings    FOR ALL USING (true);
CREATE POLICY "service_role_all" ON chat_sessions       FOR ALL USING (true);
CREATE POLICY "service_role_all" ON chat_messages       FOR ALL USING (true);
CREATE POLICY "service_role_all" ON safety_events       FOR ALL USING (true);
CREATE POLICY "service_role_all" ON ingestion_log       FOR ALL USING (true);
