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
export type MvpLocale = 'en' | 'zh' | string;

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
    title_cn: 'EQAI多维智慧与智力问卷',
    title_en: 'EQAI Multiple Wisdom & Intelligence Questionnaire',
    audience: '通用 / 青少年 / 成人',
    description_cn: '从情绪理解、自我调节、韧性、表达与审美等维度观察多元智慧与综合能力。',
    description_en: 'A multidimensional questionnaire covering emotional understanding, self-regulation, resilience, expression, and aesthetic perception.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'ACAD_DEMO',
    module_code: 'ABILITY',
    module_name_cn: '能力与发展',
    module_name_en: 'Ability and Development',
    title_cn: 'EQAI学业能力量表',
    title_en: 'EQAI Academic Competence Questionnaire',
    audience: '学生',
    description_cn: '关注学习动机、学业自我效能、深度学习策略、元认知监控与资源管理。',
    description_en: 'Assesses learning motivation, academic self-efficacy, deep learning strategies, metacognitive monitoring, and resource management.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'PERSONALITY_DEMO',
    module_code: 'ABILITY',
    module_name_cn: '能力与发展',
    module_name_en: 'Ability and Development',
    title_cn: 'EQAI人格因素测验',
    title_en: 'EQAI Personality Characteristics Survey',
    audience: '通用',
    description_cn: '覆盖乐群性、思辨性、情绪起伏、守规性、敏感性、自律性等人格特征。',
    description_en: 'Explores personality characteristics such as warmth, reasoning, emotional instability, rule-consciousness, sensitivity, and perfectionism.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'EMOTION_REG_DEMO',
    module_code: 'WELLBEING',
    module_name_cn: '身心健康',
    module_name_en: 'Physical and Mental Well-Being',
    title_cn: 'EQAI负面情绪管理量表',
    title_en: 'EQAI Negative Emotion Regulation Survey',
    audience: '青少年 / 成人',
    description_cn: '评估情绪觉察、情绪接纳、冲动控制与情绪调节策略的使用情况。',
    description_en: 'Assesses emotional awareness, acceptance, impulsivity control, and use of emotion regulation strategies.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'ADHD_DEMO',
    module_code: 'WELLBEING',
    module_name_cn: '身心健康',
    module_name_en: 'Physical and Mental Well-Being',
    title_cn: 'EQAI注意力缺陷多动障碍筛查量表',
    title_en: 'EQAI ADHD Screening Questionnaire',
    audience: '儿童 / 青少年',
    description_cn: '围绕注意缺陷、多动、冲动和对立行为进行初步筛查观察。',
    description_en: 'A screening questionnaire covering inattention, hyperactivity, impulsivity, and oppositionality.',
    demo: true,
    active: true,
  },
  {
    scale_code: 'PARENTING_STYLE_DEMO',
    module_code: 'PARENT',
    module_name_cn: '家长参与',
    module_name_en: 'Parent Participation',
    title_cn: 'EQAI家长养育模式问卷',
    title_en: 'EQAI Parenting Style Questionnaire',
    audience: '家长',
    description_cn: '观察权威型、专制型与宽容型养育模式中的支持、引导、结构与边界。',
    description_en: 'Explores parenting patterns across support, guidance, structure, authority, and boundaries.',
    demo: true,
    active: true,
  },
];

export const demoDimensions: MvpDimension[] = [
  dimension('MWI_DEMO', 'EMO_SOCIAL', '情绪理解与社交', 'Emotional Understanding and Social Functioning', 10),
  dimension('MWI_DEMO', 'SELF_SOOTHING', '自我愉悦与情绪调节', 'Self-Soothing and Emotional Regulation', 20),
  dimension('MWI_DEMO', 'RESILIENCE', '逆境应对力与心理韧性', 'Adversity Coping and Psychological Resilience', 30),
  dimension('MWI_DEMO', 'EXPRESSION', '言语策略与表达艺术', 'Verbal Strategy and Expressive Communication Skills', 40),
  dimension('ACAD_DEMO', 'INTRINSIC_MOTIVATION', '内在动机与任务价值', 'Intrinsic Motivation & Values', 10),
  dimension('ACAD_DEMO', 'SELF_EFFICACY', '学业自我效能感', 'Academic Self-Efficacy', 20),
  dimension('ACAD_DEMO', 'DEEP_LEARNING', '深度学习策略', 'Deep Learning Strategies', 30),
  dimension('ACAD_DEMO', 'TIME_MANAGEMENT', '时间管理', 'Time Management', 40),
  dimension('PERSONALITY_DEMO', 'WARMTH', '乐群性', 'Warmth', 10),
  dimension('PERSONALITY_DEMO', 'REASONING', '思辨性', 'Reasoning', 20),
  dimension('PERSONALITY_DEMO', 'EMOTIONAL_STABILITY', '起伏性', 'Emotional Instability', 30),
  dimension('PERSONALITY_DEMO', 'SELF_DISCIPLINE', '自律性', 'Perfectionism', 40),
  dimension('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', '情绪觉察与理解', 'Emotional Awareness & Understanding', 10),
  dimension('EMOTION_REG_DEMO', 'ACCEPTANCE', '情绪接纳', 'Emotional Acceptance', 20),
  dimension('EMOTION_REG_DEMO', 'IMPULSE_CONTROL', '冲动控制', 'Impulsivity Control', 30),
  dimension('EMOTION_REG_DEMO', 'STRATEGY_USE', '策略运用', 'Emotional Regulation Strategies', 40),
  dimension('ADHD_DEMO', 'INATTENTION', '注意缺陷', 'Inattention', 10),
  dimension('ADHD_DEMO', 'HYPERACTIVITY', '多动', 'Hyperactivity', 20),
  dimension('ADHD_DEMO', 'IMPULSIVITY', '冲动', 'Impulsivity', 30),
  dimension('ADHD_DEMO', 'OPPOSITIONALITY', '对立', 'Oppositionality', 40),
  dimension('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', '情感支持', 'Warmth & Support', 10),
  dimension('PARENTING_STYLE_DEMO', 'GUIDANCE', '讲道理与引导', 'Reasoning & Guidance', 20),
  dimension('PARENTING_STYLE_DEMO', 'STRUCTURED_AUTONOMY', '有结构的自主支持', 'Structured Autonomy Support', 30),
  dimension('PARENTING_STYLE_DEMO', 'BOUNDARIES', '心理控制与界限侵入', 'Psychological Control & Boundary Intrusion', 40),
];

export function getLocalizedScaleText(scale: MvpScale, locale: MvpLocale) {
  const isZh = locale === 'zh';
  const title = isZh ? scale.title_cn : scale.title_en ?? scale.title_cn;
  const secondaryTitle = isZh ? null : scale.title_cn;
  const moduleName = isZh ? scale.module_name_cn : scale.module_name_en ?? scale.module_name_cn;
  const description = isZh
    ? scale.description_cn ?? scale.description_en
    : scale.description_en ?? scale.description_cn;

  return {
    title,
    secondaryTitle: secondaryTitle && secondaryTitle !== title ? secondaryTitle : null,
    moduleName,
    description,
  };
}

export function getLocalizedDimensionText(dimension: MvpDimension, locale: MvpLocale) {
  const isZh = locale === 'zh';
  const title = isZh ? dimension.title_cn : dimension.title_en ?? dimension.title_cn;
  const secondaryTitle = isZh ? null : dimension.title_cn;

  return {
    title,
    secondaryTitle: secondaryTitle && secondaryTitle !== title ? secondaryTitle : null,
  };
}

export function getLocalizedItemText(item: MvpDemoItem, locale: MvpLocale) {
  const isZh = locale === 'zh';
  const prompt = isZh ? item.prompt_cn : item.prompt_en ?? item.prompt_cn;
  const secondaryPrompt = isZh ? null : item.prompt_cn;

  return {
    prompt,
    secondaryPrompt: secondaryPrompt && secondaryPrompt !== prompt ? secondaryPrompt : null,
  };
}

export const demoItems: MvpDemoItem[] = [
  item('MWI_DEMO', 'EMO_SOCIAL', 'MWI_01', '我能觉察自己和他人的情绪变化。', 'I can notice emotional changes in myself and others.', 10),
  item('MWI_DEMO', 'EMO_SOCIAL', 'MWI_02', '遇到分歧时，我能尽量用平和的方式表达自己的想法。', 'When disagreements happen, I try to express my thoughts calmly.', 20),
  item('MWI_DEMO', 'SELF_SOOTHING', 'MWI_03', '当我压力大时，我能找到让自己平静的方法。', 'When I feel stressed, I can find ways to calm myself.', 30),
  item('MWI_DEMO', 'SELF_SOOTHING', 'MWI_04', '受到批评后，我通常能逐步恢复情绪。', 'After criticism, I can usually recover emotionally over time.', 40),
  item('MWI_DEMO', 'RESILIENCE', 'MWI_05', '遇到困难时，我会先想办法，而不是马上放弃。', 'When I face difficulties, I look for solutions instead of giving up immediately.', 50),
  item('MWI_DEMO', 'RESILIENCE', 'MWI_06', '计划受阻时，我能调整方向继续推进。', 'When a plan is blocked, I can adjust direction and keep moving.', 60),
  item('MWI_DEMO', 'EXPRESSION', 'MWI_07', '我能根据对象和场合调整自己的表达方式。', 'I can adjust how I communicate based on the person and situation.', 70),
  item('MWI_DEMO', 'EXPRESSION', 'MWI_08', '我能把复杂想法讲得清楚、容易理解。', 'I can explain complex ideas clearly and understandably.', 80),
  item('ACAD_DEMO', 'INTRINSIC_MOTIVATION', 'ACAD_01', '我知道自己为什么要学习当前的内容。', 'I know why I am learning the current material.', 10),
  item('ACAD_DEMO', 'INTRINSIC_MOTIVATION', 'ACAD_02', '我能从学习内容中找到对自己有意义的部分。', 'I can find personally meaningful parts in what I study.', 20),
  item('ACAD_DEMO', 'SELF_EFFICACY', 'ACAD_03', '面对有挑战的学习任务时，我相信自己可以逐步掌握。', 'When facing challenging study tasks, I believe I can master them step by step.', 30),
  item('ACAD_DEMO', 'SELF_EFFICACY', 'ACAD_04', '即使一开始不懂，我也愿意继续尝试。', 'Even when I do not understand at first, I am willing to keep trying.', 40),
  item('ACAD_DEMO', 'DEEP_LEARNING', 'ACAD_05', '学习新知识时，我会主动把它和已有知识联系起来。', 'When learning something new, I connect it with what I already know.', 50),
  item('ACAD_DEMO', 'DEEP_LEARNING', 'ACAD_06', '我会用自己的话整理知识点，而不是只背答案。', 'I organize ideas in my own words instead of only memorizing answers.', 60),
  item('ACAD_DEMO', 'TIME_MANAGEMENT', 'ACAD_07', '我能把学习任务拆成可执行的小步骤。', 'I can break learning tasks into manageable steps.', 70),
  item('ACAD_DEMO', 'TIME_MANAGEMENT', 'ACAD_08', '我会为重要任务预留足够时间，而不是总拖到最后。', 'I reserve enough time for important tasks instead of always leaving them until the end.', 80),
  item('PERSONALITY_DEMO', 'WARMTH', 'PERSONALITY_01', '我愿意主动理解他人的感受。', "I am willing to actively understand other people's feelings.", 10),
  item('PERSONALITY_DEMO', 'WARMTH', 'PERSONALITY_02', '与人相处时，我通常能表现出友善和关心。', 'When interacting with others, I usually show friendliness and care.', 20),
  item('PERSONALITY_DEMO', 'REASONING', 'PERSONALITY_03', '做判断前，我会尽量先了解事实和理由。', 'Before making judgments, I try to understand the facts and reasons first.', 30),
  item('PERSONALITY_DEMO', 'REASONING', 'PERSONALITY_04', '我喜欢分析事情背后的原因。', 'I like analyzing the reasons behind things.', 40),
  item('PERSONALITY_DEMO', 'EMOTIONAL_STABILITY', 'PERSONALITY_05', '遇到突发情况时，我的情绪容易明显波动。', 'When unexpected situations happen, my emotions fluctuate noticeably.', 50),
  item('PERSONALITY_DEMO', 'EMOTIONAL_STABILITY', 'PERSONALITY_06', '我有时会因为小事担心很久。', 'Sometimes I worry about small things for a long time.', 60),
  item('PERSONALITY_DEMO', 'SELF_DISCIPLINE', 'PERSONALITY_07', '我能按照计划完成重要任务。', 'I can complete important tasks according to plan.', 70),
  item('PERSONALITY_DEMO', 'SELF_DISCIPLINE', 'PERSONALITY_08', '我会检查细节，尽量避免明显错误。', 'I check details and try to avoid obvious mistakes.', 80),
  item('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', 'EMOTION_01', '我能说清楚自己正在经历哪种情绪。', 'I can describe what emotion I am experiencing.', 10),
  item('EMOTION_REG_DEMO', 'EMOTION_AWARENESS', 'EMOTION_02', '身体紧张或不舒服时，我会留意它是否和情绪有关。', 'When my body feels tense or uncomfortable, I notice whether it may be related to emotion.', 20),
  item('EMOTION_REG_DEMO', 'ACCEPTANCE', 'EMOTION_03', '出现负面情绪时，我不会马上责怪自己。', 'When negative emotions appear, I do not immediately blame myself.', 30),
  item('EMOTION_REG_DEMO', 'ACCEPTANCE', 'EMOTION_04', '我能允许自己有难过、生气或害怕的时候。', 'I can allow myself to feel sad, angry, or afraid at times.', 40),
  item('EMOTION_REG_DEMO', 'IMPULSE_CONTROL', 'EMOTION_05', '情绪强烈时，我能先停一下再行动。', 'When emotions are intense, I can pause before acting.', 50),
  item('EMOTION_REG_DEMO', 'IMPULSE_CONTROL', 'EMOTION_06', '生气时，我很难控制自己说出伤人的话。', 'When I am angry, it is hard for me to stop myself from saying hurtful things.', 60),
  item('EMOTION_REG_DEMO', 'STRATEGY_USE', 'EMOTION_07', '我有一些方法帮助自己从负面情绪中恢复。', 'I have ways to help myself recover from negative emotions.', 70),
  item('EMOTION_REG_DEMO', 'STRATEGY_USE', 'EMOTION_08', '情绪不好时，我能选择比逃避更有效的应对方式。', 'When I feel bad, I can choose coping methods that work better than avoidance.', 80),
  item('ADHD_DEMO', 'INATTENTION', 'ADHD_01', '我很难长时间保持注意力。', 'I find it hard to stay focused for a long time.', 10),
  item('ADHD_DEMO', 'INATTENTION', 'ADHD_02', '做任务时，我容易被声音、消息或周围动静打断。', 'While doing tasks, I am easily interrupted by sounds, messages, or things around me.', 20),
  item('ADHD_DEMO', 'HYPERACTIVITY', 'ADHD_03', '需要安静坐着时，我常觉得坐不住。', 'When I need to sit quietly, I often feel restless.', 30),
  item('ADHD_DEMO', 'HYPERACTIVITY', 'ADHD_04', '我的身体或思绪经常像停不下来一样。', 'My body or thoughts often feel like they cannot stop.', 40),
  item('ADHD_DEMO', 'IMPULSIVITY', 'ADHD_05', '我有时会在没有充分思考时就行动。', 'Sometimes I act before thinking things through.', 50),
  item('ADHD_DEMO', 'IMPULSIVITY', 'ADHD_06', '别人说话时，我有时会忍不住插话。', 'When others are speaking, I sometimes interrupt before I mean to.', 60),
  item('ADHD_DEMO', 'OPPOSITIONALITY', 'ADHD_07', '被要求遵守规则时，我有时会本能地抗拒。', 'When asked to follow rules, I sometimes instinctively resist.', 70),
  item('ADHD_DEMO', 'OPPOSITIONALITY', 'ADHD_08', '和权威人物意见不合时，我很难冷静沟通。', 'When I disagree with authority figures, it is hard for me to communicate calmly.', 80),
  item('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', 'PARENT_01', '我会主动理解孩子当下的感受。', 'I actively try to understand what my child is feeling.', 10),
  item('PARENTING_STYLE_DEMO', 'WARM_SUPPORT', 'PARENT_02', '孩子情绪激动时，我会先安抚，再讨论问题。', 'When my child is emotionally upset, I comfort them before discussing the problem.', 20),
  item('PARENTING_STYLE_DEMO', 'GUIDANCE', 'PARENT_03', '我会用解释和引导帮助孩子理解规则。', 'I use explanation and guidance to help my child understand rules.', 30),
  item('PARENTING_STYLE_DEMO', 'GUIDANCE', 'PARENT_04', '管教孩子时，我会说明行为后果，而不仅是要求服从。', 'When disciplining my child, I explain consequences instead of only demanding obedience.', 40),
  item('PARENTING_STYLE_DEMO', 'STRUCTURED_AUTONOMY', 'PARENT_05', '在安全范围内，我会给孩子适合年龄的选择权。', 'Within safe limits, I give my child age-appropriate choices.', 50),
  item('PARENTING_STYLE_DEMO', 'STRUCTURED_AUTONOMY', 'PARENT_06', '我能在规则清晰的前提下，让孩子尝试自己的方法。', 'With clear rules in place, I let my child try their own methods.', 60),
  item('PARENTING_STYLE_DEMO', 'BOUNDARIES', 'PARENT_07', '孩子没有按我期待表现时，我会用冷淡或沉默表达不满。', 'When my child does not meet my expectations, I use coldness or silence to show displeasure.', 70),
  item('PARENTING_STYLE_DEMO', 'BOUNDARIES', 'PARENT_08', '我有时会过多介入孩子本可以自己处理的事情。', 'Sometimes I over-involve myself in things my child could handle independently.', 80),
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
