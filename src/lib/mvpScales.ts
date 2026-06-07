import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';

export type MvpScale = {
  scale_code: string;
  module_code: string;
  module_name_cn: string;
  module_name_en: string | null;
  title_cn: string;
  title_en: string | null;
  audience: string | null;
  description_cn: string | null;
  description_en: string | null;
  demo: boolean;
  active: boolean;
};

export type MvpDimension = {
  scale_code: string;
  dimension_code: string;
  parent_dimension_code: string | null;
  title_cn: string;
  title_en: string | null;
  variant_type: string;
  sort_order: number;
  active: boolean;
};

export type MvpDemoItem = {
  scale_code: string;
  dimension_code: string;
  item_code: string;
  prompt_cn: string;
  prompt_en: string | null;
  sort_order: number;
  active: boolean;
};

export type MvpAttempt = {
  id: string;
  user_id: string;
  scale_code: string;
  status: 'started' | 'completed';
  total_score: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
  assessment_scales?: Pick<MvpScale, 'title_cn' | 'title_en' | 'module_name_cn' | 'module_name_en'> | null;
};

export const mvpScaleCategories = ['work', 'personal', 'kid', 'pet'] as const;
export type MvpScaleCategory = (typeof mvpScaleCategories)[number];

export const mvpCategoryScaleCodes: Record<MvpScaleCategory, string[]> = {
  work: ['MWI_DEMO', 'ACAD_DEMO', 'PERSONALITY_DEMO'],
  personal: ['MWI_DEMO', 'PERSONALITY_DEMO', 'EMOTION_REG_DEMO'],
  kid: ['ACAD_DEMO', 'ADHD_DEMO', 'PARENTING_STYLE_DEMO'],
  pet: [],
};

export const demoScales: MvpScale[] = [
  {
    scale_code: 'MWI_DEMO',
    module_code: 'ABILITY',
    module_name_cn: '能力与发展',
    module_name_en: 'Ability and Development',
    title_cn: 'EQAI 多维智慧与智力问卷',
    title_en: 'EQAI Multiple Wisdom & Intelligence Questionnaire',
    audience: '通用 / 青少年 / 成人',
    description_cn: '用于测试 EQAI MVP 流程的多维能力 demo 量表。',
    description_en: 'A demo scale for testing the EQAI MVP multi-domain ability flow.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'ACAD_DEMO',
    module_code: 'ABILITY',
    module_name_cn: '能力与发展',
    module_name_en: 'Ability and Development',
    title_cn: 'EQAI 学业能力量表',
    title_en: 'EQAI Academic Competence Questionnaire',
    audience: '学生',
    description_cn: '用于测试学习动机、策略和执行流程的 demo 量表。',
    description_en: 'A demo scale for testing learning motivation, strategy, and execution flows.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'PERSONALITY_DEMO',
    module_code: 'ABILITY',
    module_name_cn: '能力与发展',
    module_name_en: 'Ability and Development',
    title_cn: 'EQAI 人格因素测验',
    title_en: 'EQAI Personality Characteristics Survey',
    audience: '通用',
    description_cn: '用于测试人格因素目录和记录流程的 demo 量表。',
    description_en: 'A demo scale for testing personality-catalog and record flows.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'EMOTION_REG_DEMO',
    module_code: 'WELLBEING',
    module_name_cn: '身心健康',
    module_name_en: 'Physical and Mental Well-Being',
    title_cn: 'EQAI 负面情绪管理量表',
    title_en: 'EQAI Negative Emotion Regulation Survey',
    audience: '青少年 / 成人',
    description_cn: '用于测试情绪觉察与调节记录流程的 demo 量表。',
    description_en: 'A demo scale for testing emotion awareness and regulation record flows.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'ADHD_DEMO',
    module_code: 'WELLBEING',
    module_name_cn: '身心健康',
    module_name_en: 'Physical and Mental Well-Being',
    title_cn: 'EQAI 注意力缺陷多动障碍筛查量表',
    title_en: 'EQAI ADHD Screening Questionnaire',
    audience: '儿童 / 青少年',
    description_cn: '用于测试注意力与行为筛查流程的 demo 量表。',
    description_en: 'A demo scale for testing attention and behavior screening flows.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'PARENTING_STYLE_DEMO',
    module_code: 'PARENT',
    module_name_cn: '家长参与',
    module_name_en: 'Parent Participation',
    title_cn: 'EQAI 家长养育模式问卷',
    title_en: 'EQAI Parenting Style Questionnaire',
    audience: '家长',
    description_cn: '用于测试家长参与类量表流程的 demo 量表。',
    description_en: 'A demo scale for testing parent-participation assessment flows.',
    demo: true,
    active: true,
  },
];

export const demoDimensions: MvpDimension[] = [
  dimension('MWI_DEMO', 'EMO_SOCIAL', '情绪理解与社交', 'Emotional Understanding and Social Functioning', 10),
  dimension('MWI_DEMO', 'SELF_SOOTHING', '自我愉悦与情绪调节', 'Self-Soothing and Emotional Regulation', 20),
  dimension('ACAD_DEMO', 'INTRINSIC_MOTIVATION', '内在动机与任务价值', 'Intrinsic Motivation and Task Value', 10),
  dimension('ACAD_DEMO', 'TIME_MANAGEMENT', '时间管理', 'Time Management', 20),
  dimension('PERSONALITY_DEMO', 'WARMTH', '乐群性', 'Warmth', 10),
  dimension('PERSONALITY_DEMO', 'SELF_DISCIPLINE', '自律性', 'Perfectionism and Self-Discipline', 20),
  dimension('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', '情绪觉察与理解', 'Emotional Awareness and Understanding', 10),
  dimension('EMOTION_REG_DEMO', 'STRATEGY_USE', '策略运用', 'Emotional Regulation Strategies', 20),
  dimension('ADHD_DEMO', 'INATTENTION', '注意缺陷', 'Inattention', 10),
  dimension('ADHD_DEMO', 'IMPULSIVITY', '冲动', 'Impulsivity', 20),
  dimension('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', '情感支持', 'Warmth and Support', 10),
  dimension('PARENTING_STYLE_DEMO', 'GUIDANCE', '讲道理与引导', 'Reasoning and Guidance', 20),
];

export const demoItems: MvpDemoItem[] = [
  item('MWI_DEMO', 'EMO_SOCIAL', 'MWI_01', '我能觉察自己和他人的情绪变化。', 'I can notice emotional changes in myself and others.', 10),
  item('MWI_DEMO', 'SELF_SOOTHING', 'MWI_02', '当我压力大时，我能找到让自己平静的方法。', 'When I feel stressed, I can find ways to calm myself.', 20),
  item('ACAD_DEMO', 'INTRINSIC_MOTIVATION', 'ACAD_01', '我知道自己为什么要学习当前的内容。', 'I know why I am learning the current material.', 10),
  item('ACAD_DEMO', 'TIME_MANAGEMENT', 'ACAD_02', '我能把学习任务拆成可执行的小步骤。', 'I can break learning tasks into manageable steps.', 20),
  item('PERSONALITY_DEMO', 'WARMTH', 'PERSONALITY_01', '我愿意主动理解他人的感受。', "I am willing to actively understand other people's feelings.", 10),
  item('PERSONALITY_DEMO', 'SELF_DISCIPLINE', 'PERSONALITY_02', '我能按照计划完成重要任务。', 'I can complete important tasks according to plan.', 20),
  item('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', 'EMOTION_01', '我能说清楚自己正在经历哪种情绪。', 'I can describe what emotion I am experiencing.', 10),
  item('EMOTION_REG_DEMO', 'STRATEGY_USE', 'EMOTION_02', '我有一些方法帮助自己从负面情绪中恢复。', 'I have ways to help myself recover from negative emotions.', 20),
  item('ADHD_DEMO', 'INATTENTION', 'ADHD_01', '我很难长时间保持注意力。', 'I find it hard to stay focused for a long time.', 10),
  item('ADHD_DEMO', 'IMPULSIVITY', 'ADHD_02', '我有时会在没有充分思考时就行动。', 'Sometimes I act before thinking things through.', 20),
  item('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', 'PARENT_01', '我会主动理解孩子当下的感受。', 'I actively try to understand what my child is feeling.', 10),
  item('PARENTING_STYLE_DEMO', 'GUIDANCE', 'PARENT_02', '我会用解释和引导帮助孩子理解规则。', 'I use explanation and guidance to help my child understand rules.', 20),
];

export async function getMvpScales() {
  if (!isSupabaseConfigured()) return demoScales;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('assessment_scales')
    .select('*')
    .eq('active', true)
    .order('module_code', { ascending: true })
    .order('scale_code', { ascending: true });

  return error || !data ? demoScales : (data as MvpScale[]);
}

export function normalizeMvpScaleCategory(value: string | null | undefined) {
  return mvpScaleCategories.includes(value as MvpScaleCategory)
    ? (value as MvpScaleCategory)
    : null;
}

export function filterMvpScalesByCategory(scales: MvpScale[], category: MvpScaleCategory | null) {
  if (!category) return scales;

  const scaleCodes = new Set(mvpCategoryScaleCodes[category]);
  return scales.filter((scale) => scaleCodes.has(scale.scale_code));
}

export async function getMvpScale(scaleCode: string) {
  if (!isSupabaseConfigured()) {
    return demoScales.find((scale) => scale.scale_code === scaleCode) ?? null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('assessment_scales')
    .select('*')
    .eq('active', true)
    .eq('scale_code', scaleCode)
    .maybeSingle();

  return error || !data ? demoScales.find((scale) => scale.scale_code === scaleCode) ?? null : (data as MvpScale);
}

export async function getMvpDimensions(scaleCode: string) {
  if (!isSupabaseConfigured()) {
    return demoDimensions.filter((dimension) => dimension.scale_code === scaleCode);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('assessment_dimensions')
    .select('*')
    .eq('active', true)
    .eq('scale_code', scaleCode)
    .order('sort_order', { ascending: true });

  return error || !data ? demoDimensions.filter((dimension) => dimension.scale_code === scaleCode) : (data as MvpDimension[]);
}

export async function getMvpDemoItems(scaleCode: string) {
  if (!isSupabaseConfigured()) {
    return demoItems.filter((demoItem) => demoItem.scale_code === scaleCode);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('assessment_demo_items')
    .select('*')
    .eq('active', true)
    .eq('scale_code', scaleCode)
    .order('sort_order', { ascending: true });

  return error || !data ? demoItems.filter((demoItem) => demoItem.scale_code === scaleCode) : (data as MvpDemoItem[]);
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  return error ? null : data.user;
}

export async function getUserAttempts() {
  const user = await getCurrentUser();
  if (!user) return { user: null, attempts: [] as MvpAttempt[], error: null as string | null };

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('user_scale_attempts')
    .select('*, assessment_scales(title_cn,title_en,module_name_cn,module_name_en)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  return {
    user,
    attempts: error || !data ? [] : (data as MvpAttempt[]),
    error: error ? formatMvpReadError(error.message) : null,
  };
}

function formatMvpReadError(message: string) {
  return /assessment_scales|user_scale_attempts|schema cache|PGRST205/i.test(message)
    ? 'MVP database tables are not ready. Run backend/ingestion/mvp_scale_records.sql in Supabase SQL Editor first.'
    : message;
}

function dimension(
  scaleCode: string,
  dimensionCode: string,
  titleCn: string,
  titleEn: string,
  sortOrder: number
): MvpDimension {
  return {
    scale_code: scaleCode,
    dimension_code: dimensionCode,
    parent_dimension_code: null,
    title_cn: titleCn,
    title_en: titleEn,
    variant_type: 'simple_short',
    sort_order: sortOrder,
    active: true,
  };
}

function item(
  scaleCode: string,
  dimensionCode: string,
  itemCode: string,
  promptCn: string,
  promptEn: string,
  sortOrder: number
): MvpDemoItem {
  return {
    scale_code: scaleCode,
    dimension_code: dimensionCode,
    item_code: itemCode,
    prompt_cn: promptCn,
    prompt_en: promptEn,
    sort_order: sortOrder,
    active: true,
  };
}
