-- =============================================================================
-- EQAI MVP scale records
-- Small MVP surface: demo scale catalog + user scale attempts.
--
-- Run this in Supabase Dashboard -> SQL Editor.
-- Do not paste service role keys or database passwords into SQL.
-- =============================================================================

-- =============================================================================
-- DEMO SCALE CATALOG
-- =============================================================================

CREATE TABLE IF NOT EXISTS assessment_scales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code      TEXT UNIQUE NOT NULL,
  module_code     TEXT NOT NULL,
  module_name_cn  TEXT NOT NULL,
  module_name_en  TEXT,
  title_cn        TEXT NOT NULL,
  title_en        TEXT,
  audience        TEXT,
  description_cn  TEXT,
  description_en  TEXT,
  demo            BOOLEAN NOT NULL DEFAULT true,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessment_scales IS
  'MVP demo scale catalog. Demo rows are not validated formal psychological instruments.';

CREATE TABLE IF NOT EXISTS assessment_dimensions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code            TEXT NOT NULL REFERENCES assessment_scales(scale_code) ON DELETE CASCADE,
  dimension_code        TEXT NOT NULL,
  parent_dimension_code TEXT,
  title_cn              TEXT NOT NULL,
  title_en              TEXT,
  variant_type          TEXT NOT NULL DEFAULT 'simple_short'
    CHECK (variant_type IN ('simple_short', 'simple_long', 'complex_short', 'complex_long')),
  sort_order            INTEGER NOT NULL DEFAULT 0,
  active                BOOLEAN NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(scale_code, dimension_code)
);

COMMENT ON TABLE assessment_dimensions IS
  'MVP demo scale dimensions and subdimensions based on the local scale structure draft.';

CREATE TABLE IF NOT EXISTS assessment_demo_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_code     TEXT NOT NULL REFERENCES assessment_scales(scale_code) ON DELETE CASCADE,
  dimension_code TEXT NOT NULL,
  item_code      TEXT NOT NULL,
  prompt_cn      TEXT NOT NULL,
  prompt_en      TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(scale_code, item_code),
  FOREIGN KEY (scale_code, dimension_code)
    REFERENCES assessment_dimensions(scale_code, dimension_code)
    ON DELETE CASCADE
);

COMMENT ON TABLE assessment_demo_items IS
  'MVP demo Likert-style items used only to test the assessment flow.';

-- =============================================================================
-- USER SCALE RECORDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_scale_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scale_code   TEXT NOT NULL REFERENCES assessment_scales(scale_code),
  status       TEXT NOT NULL CHECK (status IN ('started', 'completed')),
  total_score  INTEGER,
  notes        TEXT,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_scale_attempts IS
  'MVP user-owned record of started or completed demo scales.';

CREATE TABLE IF NOT EXISTS user_scale_responses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES user_scale_attempts(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_code  TEXT NOT NULL,
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(attempt_id, item_code)
);

COMMENT ON TABLE user_scale_responses IS
  'Optional MVP answer detail table. Use only if item-level responses are saved.';

CREATE INDEX IF NOT EXISTS idx_assessment_scales_active_module
  ON assessment_scales (active, module_code, scale_code);
CREATE INDEX IF NOT EXISTS idx_assessment_dimensions_active_scale
  ON assessment_dimensions (active, scale_code, sort_order);
CREATE INDEX IF NOT EXISTS idx_assessment_demo_items_active_scale
  ON assessment_demo_items (active, scale_code, sort_order);
CREATE INDEX IF NOT EXISTS idx_assessment_demo_items_scale_dimension
  ON assessment_demo_items (scale_code, dimension_code);
CREATE INDEX IF NOT EXISTS idx_user_scale_attempts_user_id
  ON user_scale_attempts (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_scale_attempts_scale_code
  ON user_scale_attempts (scale_code);
CREATE INDEX IF NOT EXISTS idx_user_scale_responses_attempt_id
  ON user_scale_responses (attempt_id);
CREATE INDEX IF NOT EXISTS idx_user_scale_responses_user_id
  ON user_scale_responses (user_id);

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

DROP TRIGGER IF EXISTS trg_assessment_scales_updated_at ON assessment_scales;
CREATE TRIGGER trg_assessment_scales_updated_at
  BEFORE UPDATE ON assessment_scales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_dimensions_updated_at ON assessment_dimensions;
CREATE TRIGGER trg_assessment_dimensions_updated_at
  BEFORE UPDATE ON assessment_dimensions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_demo_items_updated_at ON assessment_demo_items;
CREATE TRIGGER trg_assessment_demo_items_updated_at
  BEFORE UPDATE ON assessment_demo_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_user_scale_attempts_updated_at ON user_scale_attempts;
CREATE TRIGGER trg_user_scale_attempts_updated_at
  BEFORE UPDATE ON user_scale_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE assessment_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_dimensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_demo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scale_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scale_responses ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON assessment_scales TO anon, authenticated;
GRANT SELECT ON assessment_dimensions TO anon, authenticated;
GRANT SELECT ON assessment_demo_items TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_scale_attempts TO authenticated;
GRANT SELECT, INSERT ON user_scale_responses TO authenticated;

DROP POLICY IF EXISTS "assessment_scales_public_read_active" ON assessment_scales;
DROP POLICY IF EXISTS "assessment_dimensions_public_read_active" ON assessment_dimensions;
DROP POLICY IF EXISTS "assessment_demo_items_public_read_active" ON assessment_demo_items;
DROP POLICY IF EXISTS "assessment_scales_service_role_all" ON assessment_scales;
DROP POLICY IF EXISTS "assessment_dimensions_service_role_all" ON assessment_dimensions;
DROP POLICY IF EXISTS "assessment_demo_items_service_role_all" ON assessment_demo_items;
DROP POLICY IF EXISTS "user_scale_attempts_select_own" ON user_scale_attempts;
DROP POLICY IF EXISTS "user_scale_attempts_insert_own" ON user_scale_attempts;
DROP POLICY IF EXISTS "user_scale_attempts_update_own" ON user_scale_attempts;
DROP POLICY IF EXISTS "user_scale_attempts_service_role_all" ON user_scale_attempts;
DROP POLICY IF EXISTS "user_scale_responses_select_own" ON user_scale_responses;
DROP POLICY IF EXISTS "user_scale_responses_insert_own" ON user_scale_responses;
DROP POLICY IF EXISTS "user_scale_responses_service_role_all" ON user_scale_responses;

CREATE POLICY "assessment_scales_public_read_active" ON assessment_scales
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "assessment_dimensions_public_read_active" ON assessment_dimensions
  FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "assessment_demo_items_public_read_active" ON assessment_demo_items
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "assessment_scales_service_role_all" ON assessment_scales
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "assessment_dimensions_service_role_all" ON assessment_dimensions
  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "assessment_demo_items_service_role_all" ON assessment_demo_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "user_scale_attempts_select_own" ON user_scale_attempts
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "user_scale_attempts_insert_own" ON user_scale_attempts
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "user_scale_attempts_update_own" ON user_scale_attempts
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "user_scale_attempts_service_role_all" ON user_scale_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "user_scale_responses_select_own" ON user_scale_responses
  FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "user_scale_responses_insert_own" ON user_scale_responses
  FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "user_scale_responses_service_role_all" ON user_scale_responses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- DEMO SEED DATA
-- =============================================================================

INSERT INTO assessment_scales (
  scale_code,
  module_code,
  module_name_cn,
  module_name_en,
  title_cn,
  title_en,
  audience,
  description_cn,
  description_en,
  demo,
  active
) VALUES
  (
    'MWI_DEMO',
    'ABILITY',
    '能力与发展',
    'Ability and Development',
    'EQAI 多维智慧与智力问卷',
    'EQAI Multiple Wisdom & Intelligence Questionnaire',
    '通用 / 青少年 / 成人',
    '用于测试 EQAI MVP 流程的多维能力 demo 量表。',
    'A demo scale for testing the EQAI MVP multi-domain ability flow.',
    true,
    true
  ),
  (
    'ACAD_DEMO',
    'ABILITY',
    '能力与发展',
    'Ability and Development',
    'EQAI 学业能力量表',
    'EQAI Academic Competence Questionnaire',
    '学生',
    '用于测试学习动机、策略和执行流程的 demo 量表。',
    'A demo scale for testing learning motivation, strategy, and execution flows.',
    true,
    true
  ),
  (
    'PERSONALITY_DEMO',
    'ABILITY',
    '能力与发展',
    'Ability and Development',
    'EQAI 人格因素测验',
    'EQAI Personality Characteristics Survey',
    '通用',
    '用于测试人格因素目录和记录流程的 demo 量表。',
    'A demo scale for testing personality-catalog and record flows.',
    true,
    true
  ),
  (
    'EMOTION_REG_DEMO',
    'WELLBEING',
    '身心健康',
    'Physical and Mental Well-Being',
    'EQAI 负面情绪管理量表',
    'EQAI Negative Emotion Regulation Survey',
    '青少年 / 成人',
    '用于测试情绪觉察与调节记录流程的 demo 量表。',
    'A demo scale for testing emotion awareness and regulation record flows.',
    true,
    true
  ),
  (
    'ADHD_DEMO',
    'WELLBEING',
    '身心健康',
    'Physical and Mental Well-Being',
    'EQAI 注意力缺陷多动障碍筛查量表',
    'EQAI ADHD Screening Questionnaire',
    '儿童 / 青少年',
    '用于测试注意力与行为筛查流程的 demo 量表。',
    'A demo scale for testing attention and behavior screening flows.',
    true,
    true
  ),
  (
    'PARENTING_STYLE_DEMO',
    'PARENT',
    '家长参与',
    'Parent Participation',
    'EQAI 家长养育模式问卷',
    'EQAI Parenting Style Questionnaire',
    '家长',
    '用于测试家长参与类量表流程的 demo 量表。',
    'A demo scale for testing parent-participation assessment flows.',
    true,
    true
  )
ON CONFLICT (scale_code) DO UPDATE SET
  module_code = EXCLUDED.module_code,
  module_name_cn = EXCLUDED.module_name_cn,
  module_name_en = EXCLUDED.module_name_en,
  title_cn = EXCLUDED.title_cn,
  title_en = EXCLUDED.title_en,
  audience = EXCLUDED.audience,
  description_cn = EXCLUDED.description_cn,
  description_en = EXCLUDED.description_en,
  demo = EXCLUDED.demo,
  active = EXCLUDED.active,
  updated_at = now();

INSERT INTO assessment_dimensions (
  scale_code,
  dimension_code,
  parent_dimension_code,
  title_cn,
  title_en,
  variant_type,
  sort_order,
  active
) VALUES
  ('MWI_DEMO', 'EMO_SOCIAL', NULL, '情绪理解与社交', 'Emotional Understanding and Social Functioning', 'simple_short', 10, true),
  ('MWI_DEMO', 'SELF_SOOTHING', NULL, '自我愉悦与情绪调节', 'Self-Soothing and Emotional Regulation', 'simple_short', 20, true),
  ('ACAD_DEMO', 'INTRINSIC_MOTIVATION', NULL, '内在动机与任务价值', 'Intrinsic Motivation and Task Value', 'simple_short', 10, true),
  ('ACAD_DEMO', 'TIME_MANAGEMENT', NULL, '时间管理', 'Time Management', 'simple_short', 20, true),
  ('PERSONALITY_DEMO', 'WARMTH', NULL, '乐群性', 'Warmth', 'simple_short', 10, true),
  ('PERSONALITY_DEMO', 'SELF_DISCIPLINE', NULL, '自律性', 'Perfectionism and Self-Discipline', 'simple_short', 20, true),
  ('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', NULL, '情绪觉察与理解', 'Emotional Awareness and Understanding', 'simple_short', 10, true),
  ('EMOTION_REG_DEMO', 'STRATEGY_USE', NULL, '策略运用', 'Emotional Regulation Strategies', 'simple_short', 20, true),
  ('ADHD_DEMO', 'INATTENTION', NULL, '注意缺陷', 'Inattention', 'simple_short', 10, true),
  ('ADHD_DEMO', 'IMPULSIVITY', NULL, '冲动', 'Impulsivity', 'simple_short', 20, true),
  ('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', NULL, '情感支持', 'Warmth and Support', 'simple_short', 10, true),
  ('PARENTING_STYLE_DEMO', 'GUIDANCE', NULL, '讲道理与引导', 'Reasoning and Guidance', 'simple_short', 20, true)
ON CONFLICT (scale_code, dimension_code) DO UPDATE SET
  parent_dimension_code = EXCLUDED.parent_dimension_code,
  title_cn = EXCLUDED.title_cn,
  title_en = EXCLUDED.title_en,
  variant_type = EXCLUDED.variant_type,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

INSERT INTO assessment_demo_items (
  scale_code,
  dimension_code,
  item_code,
  prompt_cn,
  prompt_en,
  sort_order,
  active
) VALUES
  ('MWI_DEMO', 'EMO_SOCIAL', 'MWI_01', '我能觉察自己和他人的情绪变化。', 'I can notice emotional changes in myself and others.', 10, true),
  ('MWI_DEMO', 'SELF_SOOTHING', 'MWI_02', '当我压力大时，我能找到让自己平静的方法。', 'When I feel stressed, I can find ways to calm myself.', 20, true),
  ('ACAD_DEMO', 'INTRINSIC_MOTIVATION', 'ACAD_01', '我知道自己为什么要学习当前的内容。', 'I know why I am learning the current material.', 10, true),
  ('ACAD_DEMO', 'TIME_MANAGEMENT', 'ACAD_02', '我能把学习任务拆成可执行的小步骤。', 'I can break learning tasks into manageable steps.', 20, true),
  ('PERSONALITY_DEMO', 'WARMTH', 'PERSONALITY_01', '我愿意主动理解他人的感受。', 'I am willing to actively understand other people''s feelings.', 10, true),
  ('PERSONALITY_DEMO', 'SELF_DISCIPLINE', 'PERSONALITY_02', '我能按照计划完成重要任务。', 'I can complete important tasks according to plan.', 20, true),
  ('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', 'EMOTION_01', '我能说清楚自己正在经历哪种情绪。', 'I can describe what emotion I am experiencing.', 10, true),
  ('EMOTION_REG_DEMO', 'STRATEGY_USE', 'EMOTION_02', '我有一些方法帮助自己从负面情绪中恢复。', 'I have ways to help myself recover from negative emotions.', 20, true),
  ('ADHD_DEMO', 'INATTENTION', 'ADHD_01', '我很难长时间保持注意力。', 'I find it hard to stay focused for a long time.', 10, true),
  ('ADHD_DEMO', 'IMPULSIVITY', 'ADHD_02', '我有时会在没有充分思考时就行动。', 'Sometimes I act before thinking things through.', 20, true),
  ('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', 'PARENT_01', '我会主动理解孩子当下的感受。', 'I actively try to understand what my child is feeling.', 10, true),
  ('PARENTING_STYLE_DEMO', 'GUIDANCE', 'PARENT_02', '我会用解释和引导帮助孩子理解规则。', 'I use explanation and guidance to help my child understand rules.', 20, true)
ON CONFLICT (scale_code, item_code) DO UPDATE SET
  dimension_code = EXCLUDED.dimension_code,
  prompt_cn = EXCLUDED.prompt_cn,
  prompt_en = EXCLUDED.prompt_en,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();
