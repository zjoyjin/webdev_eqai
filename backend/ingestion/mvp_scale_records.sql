-- =============================================================================
-- EQAI assessment scale records
-- Public assessment catalog + user scale attempts.
--
-- Run this in Supabase Dashboard -> SQL Editor.
-- Do not paste service role keys or database passwords into SQL.
-- =============================================================================

-- =============================================================================
-- ASSESSMENT SCALE CATALOG
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
  'EQAI assessment scale catalog. Rows are not clinical diagnostic instruments.';

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
  'EQAI assessment dimensions and subdimensions based on the local scale structure.';

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
  'Likert-style assessment items for the current short-form assessment flow.';

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
  'User-owned record of started or completed assessment scales.';

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
  'Optional answer detail table. Use only if item-level responses are saved.';

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
-- SEED DATA
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
    'EQAI多维智慧与智力问卷',
    'EQAI Multiple Wisdom & Intelligence Questionnaire',
    '通用 / 青少年 / 成人',
    '从情绪理解、自我调节、韧性、表达与审美等维度观察多元智慧与综合能力。',
    'A multidimensional questionnaire covering emotional understanding, self-regulation, resilience, expression, and aesthetic perception.',
    true,
    true
  ),
  (
    'ACAD_DEMO',
    'ABILITY',
    '能力与发展',
    'Ability and Development',
    'EQAI学业能力量表',
    'EQAI Academic Competence Questionnaire',
    '学生',
    '关注学习动机、学业自我效能、深度学习策略、元认知监控与资源管理。',
    'Assesses learning motivation, academic self-efficacy, deep learning strategies, metacognitive monitoring, and resource management.',
    true,
    true
  ),
  (
    'PERSONALITY_DEMO',
    'ABILITY',
    '能力与发展',
    'Ability and Development',
    'EQAI人格因素测验',
    'EQAI Personality Characteristics Survey',
    '通用',
    '覆盖乐群性、思辨性、情绪起伏、守规性、敏感性、自律性等人格特征。',
    'Explores personality characteristics such as warmth, reasoning, emotional instability, rule-consciousness, sensitivity, and perfectionism.',
    true,
    true
  ),
  (
    'EMOTION_REG_DEMO',
    'WELLBEING',
    '身心健康',
    'Physical and Mental Well-Being',
    'EQAI负面情绪管理量表',
    'EQAI Negative Emotion Regulation Survey',
    '青少年 / 成人',
    '评估情绪觉察、情绪接纳、冲动控制与情绪调节策略的使用情况。',
    'Assesses emotional awareness, acceptance, impulsivity control, and use of emotion regulation strategies.',
    true,
    true
  ),
  (
    'ADHD_DEMO',
    'WELLBEING',
    '身心健康',
    'Physical and Mental Well-Being',
    'EQAI注意力缺陷多动障碍筛查量表',
    'EQAI ADHD Screening Questionnaire',
    '儿童 / 青少年',
    '围绕注意缺陷、多动、冲动和对立行为进行初步筛查观察。',
    'A screening questionnaire covering inattention, hyperactivity, impulsivity, and oppositionality.',
    true,
    true
  ),
  (
    'PARENTING_STYLE_DEMO',
    'PARENT',
    '家长参与',
    'Parent Participation',
    'EQAI家长养育模式问卷',
    'EQAI Parenting Style Questionnaire',
    '家长',
    '观察权威型、专制型与宽容型养育模式中的支持、引导、结构与边界。',
    'Explores parenting patterns across support, guidance, structure, authority, and boundaries.',
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
  ('MWI_DEMO', 'RESILIENCE', NULL, '逆境应对力与心理韧性', 'Adversity Coping and Psychological Resilience', 'simple_short', 30, true),
  ('MWI_DEMO', 'EXPRESSION', NULL, '言语策略与表达艺术', 'Verbal Strategy and Expressive Communication Skills', 'simple_short', 40, true),
  ('ACAD_DEMO', 'INTRINSIC_MOTIVATION', NULL, '内在动机与任务价值', 'Intrinsic Motivation & Values', 'simple_short', 10, true),
  ('ACAD_DEMO', 'SELF_EFFICACY', NULL, '学业自我效能感', 'Academic Self-Efficacy', 'simple_short', 20, true),
  ('ACAD_DEMO', 'DEEP_LEARNING', NULL, '深度学习策略', 'Deep Learning Strategies', 'simple_short', 30, true),
  ('ACAD_DEMO', 'TIME_MANAGEMENT', NULL, '时间管理', 'Time Management', 'simple_short', 40, true),
  ('PERSONALITY_DEMO', 'WARMTH', NULL, '乐群性', 'Warmth', 'simple_short', 10, true),
  ('PERSONALITY_DEMO', 'REASONING', NULL, '思辨性', 'Reasoning', 'simple_short', 20, true),
  ('PERSONALITY_DEMO', 'EMOTIONAL_STABILITY', NULL, '起伏性', 'Emotional Instability', 'simple_short', 30, true),
  ('PERSONALITY_DEMO', 'SELF_DISCIPLINE', NULL, '自律性', 'Perfectionism', 'simple_short', 40, true),
  ('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', NULL, '情绪觉察与理解', 'Emotional Awareness & Understanding', 'simple_short', 10, true),
  ('EMOTION_REG_DEMO', 'ACCEPTANCE', NULL, '情绪接纳', 'Emotional Acceptance', 'simple_short', 20, true),
  ('EMOTION_REG_DEMO', 'IMPULSE_CONTROL', NULL, '冲动控制', 'Impulsivity Control', 'simple_short', 30, true),
  ('EMOTION_REG_DEMO', 'STRATEGY_USE', NULL, '策略运用', 'Emotional Regulation Strategies', 'simple_short', 40, true),
  ('ADHD_DEMO', 'INATTENTION', NULL, '注意缺陷', 'Inattention', 'simple_short', 10, true),
  ('ADHD_DEMO', 'HYPERACTIVITY', NULL, '多动', 'Hyperactivity', 'simple_short', 20, true),
  ('ADHD_DEMO', 'IMPULSIVITY', NULL, '冲动', 'Impulsivity', 'simple_short', 30, true),
  ('ADHD_DEMO', 'OPPOSITIONALITY', NULL, '对立', 'Oppositionality', 'simple_short', 40, true),
  ('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', NULL, '情感支持', 'Warmth & Support', 'simple_short', 10, true),
  ('PARENTING_STYLE_DEMO', 'GUIDANCE', NULL, '讲道理与引导', 'Reasoning & Guidance', 'simple_short', 20, true),
  ('PARENTING_STYLE_DEMO', 'STRUCTURED_AUTONOMY', NULL, '有结构的自主支持', 'Structured Autonomy Support', 'simple_short', 30, true),
  ('PARENTING_STYLE_DEMO', 'BOUNDARIES', NULL, '心理控制与界限侵入', 'Psychological Control & Boundary Intrusion', 'simple_short', 40, true)
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
  ('MWI_DEMO', 'EMO_SOCIAL', 'MWI_02', '遇到分歧时，我能尽量用平和的方式表达自己的想法。', 'When disagreements happen, I try to express my thoughts calmly.', 20, true),
  ('MWI_DEMO', 'SELF_SOOTHING', 'MWI_03', '当我压力大时，我能找到让自己平静的方法。', 'When I feel stressed, I can find ways to calm myself.', 30, true),
  ('MWI_DEMO', 'SELF_SOOTHING', 'MWI_04', '受到批评后，我通常能逐步恢复情绪。', 'After criticism, I can usually recover emotionally over time.', 40, true),
  ('MWI_DEMO', 'RESILIENCE', 'MWI_05', '遇到困难时，我会先想办法，而不是马上放弃。', 'When I face difficulties, I look for solutions instead of giving up immediately.', 50, true),
  ('MWI_DEMO', 'RESILIENCE', 'MWI_06', '计划受阻时，我能调整方向继续推进。', 'When a plan is blocked, I can adjust direction and keep moving.', 60, true),
  ('MWI_DEMO', 'EXPRESSION', 'MWI_07', '我能根据对象和场合调整自己的表达方式。', 'I can adjust how I communicate based on the person and situation.', 70, true),
  ('MWI_DEMO', 'EXPRESSION', 'MWI_08', '我能把复杂想法讲得清楚、容易理解。', 'I can explain complex ideas clearly and understandably.', 80, true),
  ('ACAD_DEMO', 'INTRINSIC_MOTIVATION', 'ACAD_01', '我知道自己为什么要学习当前的内容。', 'I know why I am learning the current material.', 10, true),
  ('ACAD_DEMO', 'INTRINSIC_MOTIVATION', 'ACAD_02', '我能从学习内容中找到对自己有意义的部分。', 'I can find personally meaningful parts in what I study.', 20, true),
  ('ACAD_DEMO', 'SELF_EFFICACY', 'ACAD_03', '面对有挑战的学习任务时，我相信自己可以逐步掌握。', 'When facing challenging study tasks, I believe I can master them step by step.', 30, true),
  ('ACAD_DEMO', 'SELF_EFFICACY', 'ACAD_04', '即使一开始不懂，我也愿意继续尝试。', 'Even when I do not understand at first, I am willing to keep trying.', 40, true),
  ('ACAD_DEMO', 'DEEP_LEARNING', 'ACAD_05', '学习新知识时，我会主动把它和已有知识联系起来。', 'When learning something new, I connect it with what I already know.', 50, true),
  ('ACAD_DEMO', 'DEEP_LEARNING', 'ACAD_06', '我会用自己的话整理知识点，而不是只背答案。', 'I organize ideas in my own words instead of only memorizing answers.', 60, true),
  ('ACAD_DEMO', 'TIME_MANAGEMENT', 'ACAD_07', '我能把学习任务拆成可执行的小步骤。', 'I can break learning tasks into manageable steps.', 70, true),
  ('ACAD_DEMO', 'TIME_MANAGEMENT', 'ACAD_08', '我会为重要任务预留足够时间，而不是总拖到最后。', 'I reserve enough time for important tasks instead of always leaving them until the end.', 80, true),
  ('PERSONALITY_DEMO', 'WARMTH', 'PERSONALITY_01', '我愿意主动理解他人的感受。', 'I am willing to actively understand other people''s feelings.', 10, true),
  ('PERSONALITY_DEMO', 'WARMTH', 'PERSONALITY_02', '与人相处时，我通常能表现出友善和关心。', 'When interacting with others, I usually show friendliness and care.', 20, true),
  ('PERSONALITY_DEMO', 'REASONING', 'PERSONALITY_03', '做判断前，我会尽量先了解事实和理由。', 'Before making judgments, I try to understand the facts and reasons first.', 30, true),
  ('PERSONALITY_DEMO', 'REASONING', 'PERSONALITY_04', '我喜欢分析事情背后的原因。', 'I like analyzing the reasons behind things.', 40, true),
  ('PERSONALITY_DEMO', 'EMOTIONAL_STABILITY', 'PERSONALITY_05', '遇到突发情况时，我的情绪容易明显波动。', 'When unexpected situations happen, my emotions fluctuate noticeably.', 50, true),
  ('PERSONALITY_DEMO', 'EMOTIONAL_STABILITY', 'PERSONALITY_06', '我有时会因为小事担心很久。', 'Sometimes I worry about small things for a long time.', 60, true),
  ('PERSONALITY_DEMO', 'SELF_DISCIPLINE', 'PERSONALITY_07', '我能按照计划完成重要任务。', 'I can complete important tasks according to plan.', 70, true),
  ('PERSONALITY_DEMO', 'SELF_DISCIPLINE', 'PERSONALITY_08', '我会检查细节，尽量避免明显错误。', 'I check details and try to avoid obvious mistakes.', 80, true),
  ('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', 'EMOTION_01', '我能说清楚自己正在经历哪种情绪。', 'I can describe what emotion I am experiencing.', 10, true),
  ('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', 'EMOTION_02', '身体紧张或不舒服时，我会留意它是否和情绪有关。', 'When my body feels tense or uncomfortable, I notice whether it may be related to emotion.', 20, true),
  ('EMOTION_REG_DEMO', 'ACCEPTANCE', 'EMOTION_03', '出现负面情绪时，我不会马上责怪自己。', 'When negative emotions appear, I do not immediately blame myself.', 30, true),
  ('EMOTION_REG_DEMO', 'ACCEPTANCE', 'EMOTION_04', '我能允许自己有难过、生气或害怕的时候。', 'I can allow myself to feel sad, angry, or afraid at times.', 40, true),
  ('EMOTION_REG_DEMO', 'IMPULSE_CONTROL', 'EMOTION_05', '情绪强烈时，我能先停一下再行动。', 'When emotions are intense, I can pause before acting.', 50, true),
  ('EMOTION_REG_DEMO', 'IMPULSE_CONTROL', 'EMOTION_06', '生气时，我很难控制自己说出伤人的话。', 'When I am angry, it is hard for me to stop myself from saying hurtful things.', 60, true),
  ('EMOTION_REG_DEMO', 'STRATEGY_USE', 'EMOTION_07', '我有一些方法帮助自己从负面情绪中恢复。', 'I have ways to help myself recover from negative emotions.', 70, true),
  ('EMOTION_REG_DEMO', 'STRATEGY_USE', 'EMOTION_08', '情绪不好时，我能选择比逃避更有效的应对方式。', 'When I feel bad, I can choose coping methods that work better than avoidance.', 80, true),
  ('ADHD_DEMO', 'INATTENTION', 'ADHD_01', '我很难长时间保持注意力。', 'I find it hard to stay focused for a long time.', 10, true),
  ('ADHD_DEMO', 'INATTENTION', 'ADHD_02', '做任务时，我容易被声音、消息或周围动静打断。', 'While doing tasks, I am easily interrupted by sounds, messages, or things around me.', 20, true),
  ('ADHD_DEMO', 'HYPERACTIVITY', 'ADHD_03', '需要安静坐着时，我常觉得坐不住。', 'When I need to sit quietly, I often feel restless.', 30, true),
  ('ADHD_DEMO', 'HYPERACTIVITY', 'ADHD_04', '我的身体或思绪经常像停不下来一样。', 'My body or thoughts often feel like they cannot stop.', 40, true),
  ('ADHD_DEMO', 'IMPULSIVITY', 'ADHD_05', '我有时会在没有充分思考时就行动。', 'Sometimes I act before thinking things through.', 50, true),
  ('ADHD_DEMO', 'IMPULSIVITY', 'ADHD_06', '别人说话时，我有时会忍不住插话。', 'When others are speaking, I sometimes interrupt before I mean to.', 60, true),
  ('ADHD_DEMO', 'OPPOSITIONALITY', 'ADHD_07', '被要求遵守规则时，我有时会本能地抗拒。', 'When asked to follow rules, I sometimes instinctively resist.', 70, true),
  ('ADHD_DEMO', 'OPPOSITIONALITY', 'ADHD_08', '和权威人物意见不合时，我很难冷静沟通。', 'When I disagree with authority figures, it is hard for me to communicate calmly.', 80, true),
  ('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', 'PARENT_01', '我会主动理解孩子当下的感受。', 'I actively try to understand what my child is feeling.', 10, true),
  ('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', 'PARENT_02', '孩子情绪激动时，我会先安抚，再讨论问题。', 'When my child is emotionally upset, I comfort them before discussing the problem.', 20, true),
  ('PARENTING_STYLE_DEMO', 'GUIDANCE', 'PARENT_03', '我会用解释和引导帮助孩子理解规则。', 'I use explanation and guidance to help my child understand rules.', 30, true),
  ('PARENTING_STYLE_DEMO', 'GUIDANCE', 'PARENT_04', '管教孩子时，我会说明行为后果，而不仅是要求服从。', 'When disciplining my child, I explain consequences instead of only demanding obedience.', 40, true),
  ('PARENTING_STYLE_DEMO', 'STRUCTURED_AUTONOMY', 'PARENT_05', '在安全范围内，我会给孩子适合年龄的选择权。', 'Within safe limits, I give my child age-appropriate choices.', 50, true),
  ('PARENTING_STYLE_DEMO', 'STRUCTURED_AUTONOMY', 'PARENT_06', '我能在规则清晰的前提下，让孩子尝试自己的方法。', 'With clear rules in place, I let my child try their own methods.', 60, true),
  ('PARENTING_STYLE_DEMO', 'BOUNDARIES', 'PARENT_07', '孩子没有按我期待表现时，我会用冷淡或沉默表达不满。', 'When my child does not meet my expectations, I use coldness or silence to show displeasure.', 70, true),
  ('PARENTING_STYLE_DEMO', 'BOUNDARIES', 'PARENT_08', '我有时会过多介入孩子本可以自己处理的事情。', 'Sometimes I over-involve myself in things my child could handle independently.', 80, true)
ON CONFLICT (scale_code, item_code) DO UPDATE SET
  dimension_code = EXCLUDED.dimension_code,
  prompt_cn = EXCLUDED.prompt_cn,
  prompt_en = EXCLUDED.prompt_en,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();
