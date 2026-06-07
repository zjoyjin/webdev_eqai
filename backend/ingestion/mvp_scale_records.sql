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
  demo            BOOLEAN NOT NULL DEFAULT false,
  active          BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessment_scales IS
  'EQAI assessment scale catalog. Rows are informational tools and not clinical diagnostic instruments.';

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
  'EQAI assessment dimensions and subdimensions based on the current scale structure.';

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
  'Likert-style assessment items for the current assessment flow.';

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
  score      INTEGER NOT NULL CHECK (score BETWEEN 1 AND 7),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(attempt_id, item_code)
);

ALTER TABLE user_scale_responses
  DROP CONSTRAINT IF EXISTS user_scale_responses_score_check;
ALTER TABLE user_scale_responses
  ADD CONSTRAINT user_scale_responses_score_check CHECK (score BETWEEN 1 AND 7);

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
GRANT SELECT, INSERT, UPDATE ON user_scale_responses TO authenticated;

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
DROP POLICY IF EXISTS "user_scale_responses_update_own" ON user_scale_responses;
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
  FOR INSERT TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1
      FROM user_scale_attempts
      WHERE user_scale_attempts.id = user_scale_responses.attempt_id
        AND user_scale_attempts.user_id = (select auth.uid())
    )
  );
CREATE POLICY "user_scale_responses_update_own" ON user_scale_responses
  FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1
      FROM user_scale_attempts
      WHERE user_scale_attempts.id = user_scale_responses.attempt_id
        AND user_scale_attempts.user_id = (select auth.uid())
    )
  );
CREATE POLICY "user_scale_responses_service_role_all" ON user_scale_responses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- SEED DATA
-- =============================================================================

UPDATE assessment_scales
SET active = false, updated_at = now()
WHERE scale_code = ANY (ARRAY['MWI_DEMO', 'ACAD_DEMO', 'PERSONALITY_DEMO', 'EMOTION_REG_DEMO', 'ADHD_DEMO', 'PARENTING_STYLE_DEMO']);

UPDATE assessment_dimensions
SET active = false, updated_at = now()
WHERE scale_code = ANY (ARRAY['MWI_DEMO', 'ACAD_DEMO', 'PERSONALITY_DEMO', 'EMOTION_REG_DEMO', 'ADHD_DEMO', 'PARENTING_STYLE_DEMO']);

UPDATE assessment_demo_items
SET active = false, updated_at = now()
WHERE scale_code = ANY (ARRAY['MWI_DEMO', 'ACAD_DEMO', 'PERSONALITY_DEMO', 'EMOTION_REG_DEMO', 'ADHD_DEMO', 'PARENTING_STYLE_DEMO']);

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
    'MWI',
    'ABILITY',
    '能力与发展',
    'Ability and Development',
    'EQAI多维智慧与智力问卷',
    'EQAI Multiple Wisdom and Intelligence Questionnaire',
    '通用 / 青少年 / 成人',
    '从认知判断、协作共情、审美表达、执行力与韧性等方向观察多维智慧与综合能力。',
    'Explores multidimensional wisdom across judgment, collaboration, aesthetic expression, execution, and resilience.',
    false,
    true
  ),
  (
    'ACAD',
    'LEARNING',
    '学习与学业',
    'Learning and Academics',
    'EQAI学业能力量表',
    'EQAI Academic Competence Scale',
    '学生',
    '观察学习动机、协作求助、迁移推理、元认知规划等学业能力表现。',
    'Looks at learning motivation, help-seeking, transfer reasoning, and metacognitive planning.',
    false,
    true
  ),
  (
    'EMOTION_REG',
    'WELLBEING',
    '情绪健康',
    'Emotional Health',
    'EQAI负面情绪管理量表',
    'EQAI Negative Emotion Management Scale',
    '青少年 / 成人',
    '评估情绪觉察、情绪清晰度、冲动暂停、调节信念与接纳。',
    'Assesses emotional awareness, clarity, impulse pause, regulation confidence, and acceptance.',
    false,
    true
  ),
  (
    'ADHD',
    'WELLBEING',
    '身心状态',
    'Physical and Mental State',
    'EQAI注意力缺陷多动障碍筛查量表',
    'EQAI ADHD Screening Scale',
    '儿童 / 青少年',
    '围绕注意维持、任务启动、规则遵守、多动与冲动控制进行筛查观察。',
    'Screens inattention, task initiation, rule-following, hyperactivity, and impulse control.',
    false,
    true
  ),
  (
    'SSD',
    'WELLBEING',
    '身心状态',
    'Physical and Mental State',
    'EQAI-躯体症状障碍量表',
    'EQAI Somatic Symptom Disorder Scale',
    '青少年 / 成人',
    '观察身体感受、身体担忧、检查行为以及身体不适对行动的影响。',
    'Looks at body signals, body worry, checking behavior, and functional impact.',
    false,
    true
  ),
  (
    'DASS_SHORT',
    'WELLBEING',
    '情绪健康',
    'Emotional Health',
    'EQAI-DASS量表-短版',
    'EQAI-DASS Short Scale',
    '青少年 / 成人',
    '以 7 道题快速观察近期压力、低落与焦虑性身体反应。',
    'A 7-item short scale for recent stress, low mood, and anxious physical responses.',
    false,
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
  ('MWI', 'COGNITIVE_DECISION', NULL, '认知判断与决策', 'Cognitive Judgment and Decision-Making', 'simple_short', 10, true),
  ('MWI', 'COLLABORATION_EMPATHY', NULL, '协作沟通与共情', 'Collaboration, Communication, and Empathy', 'simple_short', 20, true),
  ('MWI', 'AESTHETIC_EXPRESSION', NULL, '审美与表达', 'Aesthetic and Expressive Ability', 'simple_short', 30, true),
  ('MWI', 'EXECUTION_RESILIENCE', NULL, '执行力与韧性', 'Execution and Resilience', 'simple_short', 40, true),
  ('ACAD', 'LEARNING_MOTIVATION', NULL, '学习动机与坚持', 'Learning Motivation and Persistence', 'simple_short', 10, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', NULL, '协作学习与求助', 'Collaborative Learning and Help-Seeking', 'simple_short', 20, true),
  ('ACAD', 'TRANSFER_REASONING', NULL, '迁移推理与依据判断', 'Transfer Reasoning and Evidence Checking', 'simple_short', 30, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', NULL, '元认知与学习规划', 'Metacognition and Learning Planning', 'simple_short', 40, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', NULL, '冲动暂停与注意稳定', 'Impulse Pause and Attention Stability', 'simple_short', 10, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', NULL, '情绪觉察与身体信号', 'Emotional Awareness and Body Signals', 'simple_short', 20, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', NULL, '情绪来源与成分辨识', 'Emotion Source and Component Clarity', 'simple_short', 30, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', NULL, '调节信念与接纳', 'Regulation Confidence and Acceptance', 'simple_short', 40, true),
  ('ADHD', 'DELAY_MOTIVATION', NULL, '延迟满足与启动动力', 'Delayed Reward and Task Initiation', 'simple_short', 10, true),
  ('ADHD', 'INATTENTION', NULL, '注意维持与分心', 'Attention Maintenance and Distractibility', 'simple_short', 20, true),
  ('ADHD', 'OPPOSITIONALITY', NULL, '规则遵守与对立倾向', 'Rule-Following and Oppositionality', 'simple_short', 30, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', NULL, '多动与冲动控制', 'Hyperactivity and Impulse Control', 'simple_short', 40, true),
  ('SSD', 'FUNCTION_IMPACT', NULL, '身体感受对行动的影响', 'Functional Impact of Body Signals', 'simple_short', 10, true),
  ('SSD', 'BODY_AWARENESS', NULL, '身体觉察与焦虑', 'Body Awareness and Anxiety', 'simple_short', 20, true),
  ('SSD', 'CHECKING_COPING', NULL, '检查行为与活动调整', 'Checking Behavior and Activity Adjustment', 'simple_short', 30, true),
  ('SSD', 'BODY_WORRY', NULL, '异常感受担忧与信息搜寻', 'Body Worry and Information Seeking', 'simple_short', 40, true),
  ('DASS_SHORT', 'STRESS', NULL, '压力反应', 'Stress Response', 'simple_short', 10, true),
  ('DASS_SHORT', 'DEPRESSION', NULL, '低落与无意义感', 'Low Mood and Meaninglessness', 'simple_short', 20, true),
  ('DASS_SHORT', 'ANXIETY', NULL, '焦虑性身体反应', 'Anxious Physical Response', 'simple_short', 30, true),
  ('DASS_SHORT', 'RECENT_STATE', NULL, '近期状态观察', 'Recent State Observation', 'simple_short', 40, true)
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
  ('MWI', 'COGNITIVE_DECISION', 'MWI_001', '我相信事情最终会向好的方向发展。', NULL, 10, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_002', '我常看到生活中积极的一面。', NULL, 20, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_003', '我能用乐观的态度面对问题。', NULL, 30, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_004', '我常能鼓励他人保持希望。', NULL, 40, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_005', '我很少注意文字表达的逻辑顺序。', NULL, 50, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_006', '我在写作中会注意逻辑结构和条理。', NULL, 60, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_007', '我能快速整理思路并形成文章框架。', NULL, 70, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_008', '我在写作中会自觉检查论证漏洞。', NULL, 80, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_009', '我很少检查自己书面表达是否易于理解。', NULL, 90, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_010', '我不太关注我的书面表达是否清晰连贯。', NULL, 100, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_011', '我喜欢在写作中使用生动的例子说明观点。', NULL, 110, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_013', '我能够驾驭不同场合的形象需求。', NULL, 130, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_014', '我不太在意自己的穿着与外在形象。', NULL, 140, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_015', '我会根据场合选择合适的妆容或饰品。', NULL, 150, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_016', '我能识别信息中的偏见与漏洞。', NULL, 160, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_017', '我敢于在众人中表达不同意见。', NULL, 170, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_018', '我会对团队的决策结果承担责任。', NULL, 180, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_019', '我常在问题出现时推迟回应。', NULL, 190, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_020', '我容易被情绪带动而判断失误。', NULL, 200, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_021', '我容易受到他人观点的影响。', NULL, 210, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_022', '当别人犹豫时，我通常能率先决定方向。', NULL, 220, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_023', '我在决策时信任自己的判断。', NULL, 230, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_024', '我常因为害怕出错而迟迟不行动。', NULL, 240, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_025', '我能够为团队做出关键性决策。', NULL, 250, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_026', '我容易因为担心结果而放弃行动。', NULL, 260, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_027', '面对未知的挑战，我愿意主动尝试。', NULL, 270, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_028', '我会主动帮助队友解决问题。', NULL, 280, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_029', '我容易对同事的能力产生怀疑。', NULL, 290, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_030', '我能在团队冲突中保持客观。', NULL, 300, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_031', '我在合作中能清楚表达自己的立场。', NULL, 310, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_032', '我能妥善解决合作中的误会。', NULL, 320, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_033', '我常因为沟通不畅感到沮丧。', NULL, 330, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_034', '我能在不同性格的同事间起到协调作用。', NULL, 340, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_035', '我容易因为分工不均而失去耐心。', NULL, 350, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_036', '我不太关心物品或环境是否美观。', NULL, 360, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_037', '我不太关注空间或物品的色彩搭配。', NULL, 370, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_038', '我喜欢探索新颖的视觉艺术形式。', NULL, 380, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_039', '我在挑选物品时会考虑整体美感。', NULL, 390, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_040', '我通常不会注意画面或色彩是否和谐。', NULL, 400, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_041', '我会主动学习关于美学和视觉设计的知识。', NULL, 410, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_042', '我在看电影或戏剧时容易注意画面构图与视觉细节。', NULL, 420, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_044', '我喜欢逗别人开心。', NULL, 440, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_045', '面对挫折时，我的幽默感会消失。', NULL, 450, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_048', '我能体会不同文化或背景下人们的感受。', NULL, 480, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_049', '我容易因为别人的批评而情绪低落。', NULL, 490, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_050', '我懂得如何拒绝他人而不破坏关系。', NULL, 500, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_051', '我能察觉到他人细微的情绪变化。', NULL, 510, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_052', '我能从他人的语气和表情中判断他们的真实想法。', NULL, 520, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_053', '我很少花时间反思自己的行为。', NULL, 530, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_054', '我喜欢从不同角度去理解一个问题。', NULL, 540, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_055', '我能将过去的经验转化为今后的智慧。', NULL, 550, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_056', '我能从他人经历中获得深刻启发。', NULL, 560, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_057', '我能把计划转化为具体行动步骤。', NULL, 570, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_058', '我常因为组织混乱而延误任务。', NULL, 580, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_059', '我能有效分派工作以提升效率。', NULL, 590, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_060', '我能设定可行的时间表。', NULL, 600, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_061', '我能明确优先事项并有条理地推进。', NULL, 610, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_062', '我在压力下仍能保持高效。', NULL, 620, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_063', '我常制定计划但难以执行。', NULL, 630, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_064', '我能从经验中优化执行流程。', NULL, 640, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_065', '我在复杂项目中能保持整体把控。', NULL, 650, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_066', '我不太关心文学作品的美学价值。', NULL, 660, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_069', '我很少思考文学作品背后的象征意义。', NULL, 690, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_071', '我觉得理解文学作品中的情感表达不重要。', NULL, 710, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_072', '我会主动学习和尝试新的生活美学方式。', NULL, 720, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_073', '我能欣赏并评价生活中细微的美学细节。', NULL, 730, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_076', '我对生活美感缺乏兴趣和关注。', NULL, 760, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_077', '我对自己的长期目标很清晰。', NULL, 770, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_078', '我能有效分配时间以实现目标。', NULL, 780, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_079', '我经常拖延到最后一刻才开始行动。', NULL, 790, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_080', '我倾向于主动承担有挑战的目标。', NULL, 800, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_082', '我容易被小事分散注意力。', NULL, 820, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_083', '当计划被打乱时，我能迅速调整。', NULL, 830, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_084', '我会主动分析信息来源的可靠性。', NULL, 840, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_085', '我能有效区分网络谣言与事实信息。', NULL, 850, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_093', '我善于通过语言让复杂信息易于理解。', NULL, 930, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_095', '我喜欢在交流中使用比喻或故事增加趣味性。', NULL, 950, true),
  ('MWI', 'AESTHETIC_EXPRESSION', 'MWI_096', '我很少考虑如何用语言让别人理解我的意图。', NULL, 960, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_100', '我经常忽视身体的小毛病。', NULL, 1000, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_101', '我有规律地进行锻炼。', NULL, 1010, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_102', '我会安排时间让自己充分休息。', NULL, 1020, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_103', '我容易被暂时的失败击垮。', NULL, 1030, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_104', '我在困难中会想到解决方案，而不是逃避问题。', NULL, 1040, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_105', '我认为逆境是成长的一部分。', NULL, 1050, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_106', '当环境变化时，我能较快适应。', NULL, 1060, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_107', '面对挑战，我常感到一种"越挫越勇"的动力。', NULL, 1070, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_108', '我容易因小挫折而气馁。', NULL, 1080, true),
  ('MWI', 'EXECUTION_RESILIENCE', 'MWI_109', '我善于从困难中总结经验，为下一次做准备。', NULL, 1090, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_112', '面对陌生任务时，我能自己摸索出方法。', NULL, 1120, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_113', '我常常提出别人没想到的问题。', NULL, 1130, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_114', '我容易忘记刚学过的知识。', NULL, 1140, true),
  ('MWI', 'COGNITIVE_DECISION', 'MWI_115', '我容易被复杂的信息搞糊涂。', NULL, 1150, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_117', '我会主动安慰受挫的朋友。', NULL, 1170, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_119', '我能设身处地地理解他人感受。', NULL, 1190, true),
  ('MWI', 'COLLABORATION_EMPATHY', 'MWI_120', '我能在冲突中考虑对方立场。', NULL, 1200, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_001', '在做作业时，我常常能保持专注，并享受思考过程带来的智力愉悦。', NULL, 10, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_002', '在钻研具有挑战性的难题时，我常常能感受到一种探索的乐趣。', NULL, 20, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_003', '我往往觉得学习是一项不得不完成的任务，很少从中体验到自发的快乐。', NULL, 30, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_004', '我发现自己往往很难长时间沉浸在学习中，经常写一会就想去做别的事情。', NULL, 40, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_005', '在没有外部压力的情况下，我常常也能保持高度的学习意志感和自主性。', NULL, 50, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_006', '当遇到很难的题目时，我会静下心来慢慢思考。', NULL, 60, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_007', '当学习任务让人觉得累时，我仍会坚持完成。', NULL, 70, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_008', '如果任务需要花费较长时间，我也愿意慢慢做完。', NULL, 80, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_009', '即使周围有好玩的事情吸引我，我也会先把作业完成。', NULL, 90, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_010', '如果学习任务让我觉得很累，我容易中途放弃。', NULL, 100, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_011', '当学习任务比较难时，我常常拖延而不是马上去做。', NULL, 110, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_012', '即使只差一点就完成，我也可能因为困难而停下来。', NULL, 120, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_013', '当同学提出不同意见时，我会重新思考自己对知识点的理解。', NULL, 130, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_014', '如果写一道题的时候卡住了，我会向同学请教解题思路。', NULL, 140, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_015', '我愿意把自己的困惑说出来，与他人一起思考。', NULL, 150, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_016', '我认为通过交流和讨论，可以把知识点学得更透彻。', NULL, 160, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_017', '当自己不确定答案时，我会和同学交流想法。', NULL, 170, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_018', '我愿意和同学一起复盘作业、考试中的错题。', NULL, 180, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_019', '我和同学会互相提问、互相检查知识点。', NULL, 190, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_020', '在学习中，我会主动和同学分享自己的解题思路。', NULL, 200, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_021', '我能把学过的解题步骤，稍作改变后用在解答新的问题上。', NULL, 210, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_023', '我能举一反三，从解一种题目的经验，得出解其它类型题目的策略。', NULL, 230, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_024', '如果题目的背景信息改变了，我通常还能想到合适的解法。', NULL, 240, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_025', '面对升学或考试等重要节点，我经常能保持一种胜券在握的心理状态。', NULL, 250, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_026', '在出分前的等待期，我经常陷入一种“这次肯定凉了”的预判中。', NULL, 260, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_028', '当遇到学习上的小挫折时，我常常能迅速恢复信心，相信这不会影响最终的成功。', NULL, 280, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_029', '竞争升学机会的时候，我往往第一反应是自己肯定考不上，甚至产生弃考的念头。', NULL, 290, true),
  ('ACAD', 'LEARNING_MOTIVATION', 'ACAD_030', '我觉得无论怎么努力学习，最终的结果常常很难达到我的理想预期。', NULL, 300, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_032', '当我得到一个结果时，我会想一想它是否符合题目条件。', NULL, 320, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_033', '听到别人讲解时，我会思考其中的理由是否充分。', NULL, 330, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_034', '做完一道题后，我会判断自己的答案是否有清楚的依据。', NULL, 340, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_035', '当看到参考答案时，我会对照自己的思路进行比较。', NULL, 350, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_036', '当老师讲解一道题时，我会想一想这个答案为什么是对的。', NULL, 360, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_037', '当学习变得具有挑战性时，我仍然相信自己可以应对。', NULL, 370, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_038', '即使学习内容较难，我也相信自己能够学会。', NULL, 380, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_039', '当别人觉得某门课很难时，我仍相信自己能学好。', NULL, 390, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_040', '我会为每天的学习制定清晰的时间表，并尽量去遵守。', NULL, 400, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_041', '在放假时，我也会提前安排学习时间，而不是“看心情”学习，或者等到快开学才想起来学习。', NULL, 410, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_042', '错题不知道怎么改正的时候，我愿意向答对题目的人请教。', NULL, 420, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_044', '如果题目解不出来，我会主动向同学询问。', NULL, 440, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_046', '即使在某一个知识点上卡住很久，我也不愿意向别人求助。', NULL, 460, true),
  ('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_047', '学习遇到困难时，即使有人可以帮忙，我也不太愿意去问。', NULL, 470, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_050', '我常把零碎的知识点“缝合”成一个完整的知识图谱。', NULL, 500, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_051', '我常把新学的知识，和以前学过的内容串联起来。', NULL, 510, true),
  ('ACAD', 'TRANSFER_REASONING', 'ACAD_053', '上课时我会努力记住老师说的话，不太注意得到老师为什么这么说。', NULL, 530, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_055', '我会为了实现某个学习目标，主动构思一套适合自己的资料整理方案。', NULL, 550, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_056', '我常把零碎的知识“打包”成几个核心板块，以此减轻记忆压力。', NULL, 560, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_057', '面对复杂的公式或概念，我会尝试画一个简单的逻辑草图来理清思路。', NULL, 570, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_058', '我能清晰地指出当前学习的内容在整个学科体系中属于哪一部分。', NULL, 580, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_059', '复习时，我会通过画思维导图或结构图来汇总整章的考点。', NULL, 590, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_060', '我会在解题过程中检查自己的逻辑是否通顺。', NULL, 600, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_061', '做题过程中，我会不断反思当前策略是否有效。', NULL, 610, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_062', '在学习时，我会主动确认是否理解关键概念。', NULL, 620, true),
  ('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_063', '在做题过程中，我会注意自己是否理解每一步。', NULL, 630, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_001', '哪怕再生气，我也能先停下来深呼吸，而不是立刻发火。', NULL, 10, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_002', '当我极度生气时，我觉得自己完全控制不住自己的行为。', NULL, 20, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_003', '我对自己心情的微小变化也能有所察觉。', NULL, 30, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_004', '我能通过身体的感觉（如胃部发紧）知道自己是否在焦虑。', NULL, 40, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_005', '别人能通过身体信号（如坐立不安）猜到我的情绪，但我自己却常常意识不到。', NULL, 50, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_006', '我常把胸闷、呼吸不畅当作“身体不舒服”，不会想到和心情有关。', NULL, 60, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_007', '我常常要过很久，才意识到自己在生气或难过。', NULL, 70, true),
  ('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_008', '即使我的行为已经表现出烦躁（比如甩门、大声说话），我自己也可能没意识到我在生气。', NULL, 80, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_009', '我能很容易地想明白自己情绪变化的来龙去脉。', NULL, 90, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_010', '我能分辨出自己情绪中的不同成分（例如，又气又委屈）。', NULL, 100, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_011', '当一种情绪出现时，我通常明白是什么事情引起了它。', NULL, 110, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_012', '当多种情绪交织时（如既害怕又期待），我很难分清它们各自是由什么引起的。', NULL, 120, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_013', '我会突然感到心烦意乱，但找不到具体原因。', NULL, 130, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_014', '我心里有好几种感受的时候，我常常只能用一两个词（如“不好受”）来概括。', NULL, 140, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_015', '我经常有一种“说不清道不明”的难受或烦躁。', NULL, 150, true),
  ('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_016', '我很难说清楚一种情绪（比如不开心）里面具体包含了什么。', NULL, 160, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_017', '在管理和调节情绪方面，我觉得自己是个“失败者”。', NULL, 170, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_018', '我相信，只要我愿意，总能找到一些让自己平静下来或开心一点的方法。', NULL, 180, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_019', '我相信，再强烈的负面情绪也总有办法可以应对或缓解。', NULL, 190, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_020', '一旦我陷入愤怒或沮丧的情绪，就好像掉进了一个爬不出来的坑。', NULL, 200, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_021', '我一旦开始焦虑，这种不安感就会笼罩我接下来要做的一切事情。', NULL, 210, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_022', '当我心烦意乱时，往往觉得没有任何办法能让我真正感觉好起来。', NULL, 220, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_024', '心情烦躁时，明明眼睛看着书本或屏幕，我的注意力早就飘到九霄云外了。', NULL, 240, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_025', '我有一些自己的小办法，能在情绪波动时帮助自己集中注意力。', NULL, 250, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_026', '别人和我说话时，如果我正在生气或委屈，我很难认真听对方在说什么。', NULL, 260, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_030', '我觉得，控制不住自己的情绪（比如当众哭或发怒）是件很丢脸的事。', NULL, 300, true),
  ('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_031', '我能接纳自己身上出现的所有情绪，不去评判它们。', NULL, 310, true),
  ('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_032', '当我被批评或嘲笑后，那些话会在我脑子里重复好多天。', NULL, 320, true),
  ('ADHD', 'DELAY_MOTIVATION', 'ADHD_001', '如果努力很久才能看到效果，我会觉得不值。', NULL, 10, true),
  ('ADHD', 'DELAY_MOTIVATION', 'ADHD_002', '如果要花几周才能完成目标，我的动力会慢慢消失。', NULL, 20, true),
  ('ADHD', 'INATTENTION', 'ADHD_003', '上课时，我的思绪总是到处乱飘。', NULL, 30, true),
  ('ADHD', 'INATTENTION', 'ADHD_004', '独自学习时，我的内心能平静下来。', NULL, 40, true),
  ('ADHD', 'INATTENTION', 'ADHD_005', '上课时，我能专心听讲不走神。', NULL, 50, true),
  ('ADHD', 'INATTENTION', 'ADHD_006', '安静呆着时，我的脑子还是停不下来。', NULL, 60, true),
  ('ADHD', 'INATTENTION', 'ADHD_007', '我常会因为突然冒出来的想法打断手头的事。', NULL, 70, true),
  ('ADHD', 'INATTENTION', 'ADHD_008', '听老师讲课，几分钟后我就开始发呆。', NULL, 80, true),
  ('ADHD', 'INATTENTION', 'ADHD_009', '就算周围很安静，我也很难一直专注做事。', NULL, 90, true),
  ('ADHD', 'OPPOSITIONALITY', 'ADHD_012', '我会向同学显示自己“天生反骨”，和老师对着干。', NULL, 120, true),
  ('ADHD', 'OPPOSITIONALITY', 'ADHD_013', '我常会找理由不按课堂规范做。', NULL, 130, true),
  ('ADHD', 'OPPOSITIONALITY', 'ADHD_014', '当课堂纪律有明确要求时，我一般会遵守。', NULL, 140, true),
  ('ADHD', 'OPPOSITIONALITY', 'ADHD_015', '当家长老师纠正我时，我会认真听。', NULL, 150, true),
  ('ADHD', 'OPPOSITIONALITY', 'ADHD_017', '即使学校的规章制度合理，我有时也不由自主地不想遵守。', NULL, 170, true),
  ('ADHD', 'INATTENTION', 'ADHD_018', '上课时，周围的声音很容易让我分心。', NULL, 180, true),
  ('ADHD', 'INATTENTION', 'ADHD_019', '专心做事时，我常觉得注意力被外界环境中的东西拉走。', NULL, 190, true),
  ('ADHD', 'DELAY_MOTIVATION', 'ADHD_020', '我总在开始做事情前想太多，导致拖很久也不动手。', NULL, 200, true),
  ('ADHD', 'DELAY_MOTIVATION', 'ADHD_021', '写作业时，我经常卡在“开始”这个阶段，拖半天才把书本打开。', NULL, 210, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_022', '自习写作业时，我总不自觉地动来动去。', NULL, 220, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_023', '站立或者坐着时，我经常不知不觉做些小动作。', NULL, 230, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_024', '和同学聊天，我常忍不住抢话。', NULL, 240, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_025', '面对诱惑，我能多等一会儿再决定。', NULL, 250, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_026', '游戏充值前，我会冷静评估必要性。', NULL, 260, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_027', '我常不等别人说完就忍不住插话。', NULL, 270, true),
  ('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_028', '面对诱惑，我常控制不住马上行动。', NULL, 280, true),
  ('SSD', 'FUNCTION_IMPACT', 'SSD_001', '身体有点小变化一般不会影响我做事情。', NULL, 10, true),
  ('SSD', 'FUNCTION_IMPACT', 'SSD_002', '我容易因为身体哪里有点不舒服，就推掉计划好的社交活动。', NULL, 20, true),
  ('SSD', 'BODY_AWARENESS', 'SSD_003', '我会注意到身体的不同感觉（比如热、冷、紧绷）。', NULL, 30, true),
  ('SSD', 'BODY_AWARENESS', 'SSD_004', '身体有哪里不舒服会让我焦虑。', NULL, 40, true),
  ('SSD', 'CHECKING_COPING', 'SSD_005', '当身体有不舒服时，我会反复检查自己的身体情况。', NULL, 50, true),
  ('SSD', 'CHECKING_COPING', 'SSD_006', '即使只是身体轻微不适，我也会减少活动/工作量。', NULL, 60, true),
  ('SSD', 'BODY_WORRY', 'SSD_007', '如果身体的感觉和反应与平时不一样会让我有点慌。', NULL, 70, true),
  ('SSD', 'BODY_WORRY', 'SSD_008', '当身体有不适时，我会去查相关的症状或疾病信息。', NULL, 80, true),
  ('DASS_SHORT', 'STRESS', 'DASS_001', '最近，我发现自己很容易心烦意乱。', NULL, 10, true),
  ('DASS_SHORT', 'STRESS', 'DASS_002', '最近，我发现自己在某事让我心烦后，很难冷静下来。', NULL, 20, true),
  ('DASS_SHORT', 'STRESS', 'DASS_003', '我最近发现自己在为一些琐事而心烦意乱。', NULL, 30, true),
  ('DASS_SHORT', 'DEPRESSION', 'DASS_004', '我最近感到活得不值得。', NULL, 40, true),
  ('DASS_SHORT', 'DEPRESSION', 'DASS_005', '我最近感到人生毫无意义。', NULL, 50, true),
  ('DASS_SHORT', 'ANXIETY', 'DASS_006', '我最近曾感到摇摇欲坠（例如，感觉腿软）。', NULL, 60, true),
  ('DASS_SHORT', 'ANXIETY', 'DASS_007', '我最近曾打颤（例如，手在发抖）。', NULL, 70, true)
ON CONFLICT (scale_code, item_code) DO UPDATE SET
  dimension_code = EXCLUDED.dimension_code,
  prompt_cn = EXCLUDED.prompt_cn,
  prompt_en = EXCLUDED.prompt_en,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();
