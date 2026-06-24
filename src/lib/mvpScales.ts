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

export type MvpUser = {
  id: string;
  email: string;
};

export const mockMvpUser: MvpUser = {
  id: 'local-static-user',
  email: 'local@eqai.static',
};

export const mvpScaleCategories = ['work', 'personal', 'kid', 'pet'] as const;
export type MvpScaleCategory = (typeof mvpScaleCategories)[number];
export type MvpLocale = 'en' | 'zh' | string;

export const mvpCategoryScaleCodes: Record<MvpScaleCategory, string[]> = {
  work: ['MWI', 'ACAD', 'EMOTION_REG'],
  personal: ['MWI', 'EMOTION_REG', 'SSD', 'DASS_SHORT'],
  kid: ['ACAD', 'ADHD', 'DASS_SHORT'],
  pet: [],
};

export const demoScales: MvpScale[] = [
  {
    scale_code: 'MWI',
    module_code: 'ABILITY',
    module_name_cn: '能力与发展',
    module_name_en: 'Ability and Development',
    title_cn: 'EQAI多维智慧与智力问卷',
    title_en: 'EQAI Multiple Wisdom and Intelligence Questionnaire',
    audience: '通用 / 青少年 / 成人',
    description_cn: '从认知判断、协作共情、审美表达、执行力与韧性等方向观察多维智慧与综合能力。',
    description_en: 'Explores multidimensional wisdom across judgment, collaboration, aesthetic expression, execution, and resilience.',
    demo: false,
    active: true,
  },
  {
    scale_code: 'ACAD',
    module_code: 'LEARNING',
    module_name_cn: '学习与学业',
    module_name_en: 'Learning and Academics',
    title_cn: 'EQAI学业能力量表',
    title_en: 'EQAI Academic Competence Scale',
    audience: '学生',
    description_cn: '观察学习动机、协作求助、迁移推理、元认知规划等学业能力表现。',
    description_en: 'Looks at learning motivation, help-seeking, transfer reasoning, and metacognitive planning.',
    demo: false,
    active: true,
  },
  {
    scale_code: 'EMOTION_REG',
    module_code: 'WELLBEING',
    module_name_cn: '情绪健康',
    module_name_en: 'Emotional Health',
    title_cn: 'EQAI负面情绪管理量表',
    title_en: 'EQAI Negative Emotion Management Scale',
    audience: '青少年 / 成人',
    description_cn: '评估情绪觉察、情绪清晰度、冲动暂停、调节信念与接纳。',
    description_en: 'Assesses emotional awareness, clarity, impulse pause, regulation confidence, and acceptance.',
    demo: false,
    active: true,
  },
  {
    scale_code: 'ADHD',
    module_code: 'WELLBEING',
    module_name_cn: '身心状态',
    module_name_en: 'Physical and Mental State',
    title_cn: 'EQAI注意力缺陷多动障碍筛查量表',
    title_en: 'EQAI ADHD Screening Scale',
    audience: '儿童 / 青少年',
    description_cn: '围绕注意维持、任务启动、规则遵守、多动与冲动控制进行筛查观察。',
    description_en: 'Screens inattention, task initiation, rule-following, hyperactivity, and impulse control.',
    demo: false,
    active: true,
  },
  {
    scale_code: 'SSD',
    module_code: 'WELLBEING',
    module_name_cn: '身心状态',
    module_name_en: 'Physical and Mental State',
    title_cn: 'EQAI-躯体症状障碍量表',
    title_en: 'EQAI Somatic Symptom Disorder Scale',
    audience: '青少年 / 成人',
    description_cn: '观察身体感受、身体担忧、检查行为以及身体不适对行动的影响。',
    description_en: 'Looks at body signals, body worry, checking behavior, and functional impact.',
    demo: false,
    active: true,
  },
  {
    scale_code: 'DASS_SHORT',
    module_code: 'WELLBEING',
    module_name_cn: '情绪健康',
    module_name_en: 'Emotional Health',
    title_cn: 'EQAI-DASS量表-短版',
    title_en: 'EQAI-DASS Short Scale',
    audience: '青少年 / 成人',
    description_cn: '以 7 道题快速观察近期压力、低落与焦虑性身体反应。',
    description_en: 'A 7-item short scale for recent stress, low mood, and anxious physical responses.',
    demo: false,
    active: true,
  },
];

export const demoDimensions: MvpDimension[] = [
  dimension('MWI', 'COGNITIVE_DECISION', '认知判断与决策', 'Cognitive Judgment and Decision-Making', 10),
  dimension('MWI', 'COLLABORATION_EMPATHY', '协作沟通与共情', 'Collaboration, Communication, and Empathy', 20),
  dimension('MWI', 'AESTHETIC_EXPRESSION', '审美与表达', 'Aesthetic and Expressive Ability', 30),
  dimension('MWI', 'EXECUTION_RESILIENCE', '执行力与韧性', 'Execution and Resilience', 40),
  dimension('ACAD', 'LEARNING_MOTIVATION', '学习动机与坚持', 'Learning Motivation and Persistence', 10),
  dimension('ACAD', 'COLLABORATIVE_LEARNING', '协作学习与求助', 'Collaborative Learning and Help-Seeking', 20),
  dimension('ACAD', 'TRANSFER_REASONING', '迁移推理与依据判断', 'Transfer Reasoning and Evidence Checking', 30),
  dimension('ACAD', 'METACOGNITIVE_PLANNING', '元认知与学习规划', 'Metacognition and Learning Planning', 40),
  dimension('EMOTION_REG', 'IMPULSE_PAUSE', '冲动暂停与注意稳定', 'Impulse Pause and Attention Stability', 10),
  dimension('EMOTION_REG', 'EMOTION_AWARENESS', '情绪觉察与身体信号', 'Emotional Awareness and Body Signals', 20),
  dimension('EMOTION_REG', 'EMOTION_CLARITY', '情绪来源与成分辨识', 'Emotion Source and Component Clarity', 30),
  dimension('EMOTION_REG', 'REGULATION_CONFIDENCE', '调节信念与接纳', 'Regulation Confidence and Acceptance', 40),
  dimension('ADHD', 'DELAY_MOTIVATION', '延迟满足与启动动力', 'Delayed Reward and Task Initiation', 10),
  dimension('ADHD', 'INATTENTION', '注意维持与分心', 'Attention Maintenance and Distractibility', 20),
  dimension('ADHD', 'OPPOSITIONALITY', '规则遵守与对立倾向', 'Rule-Following and Oppositionality', 30),
  dimension('ADHD', 'HYPERACTIVITY_IMPULSIVITY', '多动与冲动控制', 'Hyperactivity and Impulse Control', 40),
  dimension('SSD', 'FUNCTION_IMPACT', '身体感受对行动的影响', 'Functional Impact of Body Signals', 10),
  dimension('SSD', 'BODY_AWARENESS', '身体觉察与焦虑', 'Body Awareness and Anxiety', 20),
  dimension('SSD', 'CHECKING_COPING', '检查行为与活动调整', 'Checking Behavior and Activity Adjustment', 30),
  dimension('SSD', 'BODY_WORRY', '异常感受担忧与信息搜寻', 'Body Worry and Information Seeking', 40),
  dimension('DASS_SHORT', 'STRESS', '压力反应', 'Stress Response', 10),
  dimension('DASS_SHORT', 'DEPRESSION', '低落与无意义感', 'Low Mood and Meaninglessness', 20),
  dimension('DASS_SHORT', 'ANXIETY', '焦虑性身体反应', 'Anxious Physical Response', 30),
  dimension('DASS_SHORT', 'RECENT_STATE', '近期状态观察', 'Recent State Observation', 40),
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
  item('MWI', 'COGNITIVE_DECISION', 'MWI_001', '我相信事情最终会向好的方向发展。', null, 10),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_002', '我常看到生活中积极的一面。', null, 20),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_003', '我能用乐观的态度面对问题。', null, 30),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_004', '我常能鼓励他人保持希望。', null, 40),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_005', '我很少注意文字表达的逻辑顺序。', null, 50),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_006', '我在写作中会注意逻辑结构和条理。', null, 60),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_007', '我能快速整理思路并形成文章框架。', null, 70),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_008', '我在写作中会自觉检查论证漏洞。', null, 80),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_009', '我很少检查自己书面表达是否易于理解。', null, 90),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_010', '我不太关注我的书面表达是否清晰连贯。', null, 100),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_011', '我喜欢在写作中使用生动的例子说明观点。', null, 110),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_013', '我能够驾驭不同场合的形象需求。', null, 130),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_014', '我不太在意自己的穿着与外在形象。', null, 140),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_015', '我会根据场合选择合适的妆容或饰品。', null, 150),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_016', '我能识别信息中的偏见与漏洞。', null, 160),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_017', '我敢于在众人中表达不同意见。', null, 170),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_018', '我会对团队的决策结果承担责任。', null, 180),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_019', '我常在问题出现时推迟回应。', null, 190),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_020', '我容易被情绪带动而判断失误。', null, 200),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_021', '我容易受到他人观点的影响。', null, 210),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_022', '当别人犹豫时，我通常能率先决定方向。', null, 220),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_023', '我在决策时信任自己的判断。', null, 230),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_024', '我常因为害怕出错而迟迟不行动。', null, 240),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_025', '我能够为团队做出关键性决策。', null, 250),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_026', '我容易因为担心结果而放弃行动。', null, 260),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_027', '面对未知的挑战，我愿意主动尝试。', null, 270),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_028', '我会主动帮助队友解决问题。', null, 280),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_029', '我容易对同事的能力产生怀疑。', null, 290),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_030', '我能在团队冲突中保持客观。', null, 300),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_031', '我在合作中能清楚表达自己的立场。', null, 310),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_032', '我能妥善解决合作中的误会。', null, 320),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_033', '我常因为沟通不畅感到沮丧。', null, 330),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_034', '我能在不同性格的同事间起到协调作用。', null, 340),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_035', '我容易因为分工不均而失去耐心。', null, 350),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_036', '我不太关心物品或环境是否美观。', null, 360),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_037', '我不太关注空间或物品的色彩搭配。', null, 370),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_038', '我喜欢探索新颖的视觉艺术形式。', null, 380),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_039', '我在挑选物品时会考虑整体美感。', null, 390),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_040', '我通常不会注意画面或色彩是否和谐。', null, 400),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_041', '我会主动学习关于美学和视觉设计的知识。', null, 410),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_042', '我在看电影或戏剧时容易注意画面构图与视觉细节。', null, 420),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_044', '我喜欢逗别人开心。', null, 440),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_045', '面对挫折时，我的幽默感会消失。', null, 450),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_048', '我能体会不同文化或背景下人们的感受。', null, 480),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_049', '我容易因为别人的批评而情绪低落。', null, 490),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_050', '我懂得如何拒绝他人而不破坏关系。', null, 500),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_051', '我能察觉到他人细微的情绪变化。', null, 510),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_052', '我能从他人的语气和表情中判断他们的真实想法。', null, 520),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_053', '我很少花时间反思自己的行为。', null, 530),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_054', '我喜欢从不同角度去理解一个问题。', null, 540),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_055', '我能将过去的经验转化为今后的智慧。', null, 550),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_056', '我能从他人经历中获得深刻启发。', null, 560),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_057', '我能把计划转化为具体行动步骤。', null, 570),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_058', '我常因为组织混乱而延误任务。', null, 580),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_059', '我能有效分派工作以提升效率。', null, 590),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_060', '我能设定可行的时间表。', null, 600),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_061', '我能明确优先事项并有条理地推进。', null, 610),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_062', '我在压力下仍能保持高效。', null, 620),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_063', '我常制定计划但难以执行。', null, 630),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_064', '我能从经验中优化执行流程。', null, 640),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_065', '我在复杂项目中能保持整体把控。', null, 650),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_066', '我不太关心文学作品的美学价值。', null, 660),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_069', '我很少思考文学作品背后的象征意义。', null, 690),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_071', '我觉得理解文学作品中的情感表达不重要。', null, 710),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_072', '我会主动学习和尝试新的生活美学方式。', null, 720),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_073', '我能欣赏并评价生活中细微的美学细节。', null, 730),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_076', '我对生活美感缺乏兴趣和关注。', null, 760),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_077', '我对自己的长期目标很清晰。', null, 770),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_078', '我能有效分配时间以实现目标。', null, 780),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_079', '我经常拖延到最后一刻才开始行动。', null, 790),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_080', '我倾向于主动承担有挑战的目标。', null, 800),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_082', '我容易被小事分散注意力。', null, 820),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_083', '当计划被打乱时，我能迅速调整。', null, 830),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_084', '我会主动分析信息来源的可靠性。', null, 840),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_085', '我能有效区分网络谣言与事实信息。', null, 850),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_093', '我善于通过语言让复杂信息易于理解。', null, 930),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_095', '我喜欢在交流中使用比喻或故事增加趣味性。', null, 950),
  item('MWI', 'AESTHETIC_EXPRESSION', 'MWI_096', '我很少考虑如何用语言让别人理解我的意图。', null, 960),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_100', '我经常忽视身体的小毛病。', null, 1000),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_101', '我有规律地进行锻炼。', null, 1010),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_102', '我会安排时间让自己充分休息。', null, 1020),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_103', '我容易被暂时的失败击垮。', null, 1030),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_104', '我在困难中会想到解决方案，而不是逃避问题。', null, 1040),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_105', '我认为逆境是成长的一部分。', null, 1050),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_106', '当环境变化时，我能较快适应。', null, 1060),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_107', '面对挑战，我常感到一种"越挫越勇"的动力。', null, 1070),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_108', '我容易因小挫折而气馁。', null, 1080),
  item('MWI', 'EXECUTION_RESILIENCE', 'MWI_109', '我善于从困难中总结经验，为下一次做准备。', null, 1090),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_112', '面对陌生任务时，我能自己摸索出方法。', null, 1120),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_113', '我常常提出别人没想到的问题。', null, 1130),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_114', '我容易忘记刚学过的知识。', null, 1140),
  item('MWI', 'COGNITIVE_DECISION', 'MWI_115', '我容易被复杂的信息搞糊涂。', null, 1150),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_117', '我会主动安慰受挫的朋友。', null, 1170),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_119', '我能设身处地地理解他人感受。', null, 1190),
  item('MWI', 'COLLABORATION_EMPATHY', 'MWI_120', '我能在冲突中考虑对方立场。', null, 1200),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_001', '在做作业时，我常常能保持专注，并享受思考过程带来的智力愉悦。', null, 10),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_002', '在钻研具有挑战性的难题时，我常常能感受到一种探索的乐趣。', null, 20),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_003', '我往往觉得学习是一项不得不完成的任务，很少从中体验到自发的快乐。', null, 30),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_004', '我发现自己往往很难长时间沉浸在学习中，经常写一会就想去做别的事情。', null, 40),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_005', '在没有外部压力的情况下，我常常也能保持高度的学习意志感和自主性。', null, 50),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_006', '当遇到很难的题目时，我会静下心来慢慢思考。', null, 60),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_007', '当学习任务让人觉得累时，我仍会坚持完成。', null, 70),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_008', '如果任务需要花费较长时间，我也愿意慢慢做完。', null, 80),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_009', '即使周围有好玩的事情吸引我，我也会先把作业完成。', null, 90),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_010', '如果学习任务让我觉得很累，我容易中途放弃。', null, 100),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_011', '当学习任务比较难时，我常常拖延而不是马上去做。', null, 110),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_012', '即使只差一点就完成，我也可能因为困难而停下来。', null, 120),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_013', '当同学提出不同意见时，我会重新思考自己对知识点的理解。', null, 130),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_014', '如果写一道题的时候卡住了，我会向同学请教解题思路。', null, 140),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_015', '我愿意把自己的困惑说出来，与他人一起思考。', null, 150),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_016', '我认为通过交流和讨论，可以把知识点学得更透彻。', null, 160),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_017', '当自己不确定答案时，我会和同学交流想法。', null, 170),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_018', '我愿意和同学一起复盘作业、考试中的错题。', null, 180),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_019', '我和同学会互相提问、互相检查知识点。', null, 190),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_020', '在学习中，我会主动和同学分享自己的解题思路。', null, 200),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_021', '我能把学过的解题步骤，稍作改变后用在解答新的问题上。', null, 210),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_023', '我能举一反三，从解一种题目的经验，得出解其它类型题目的策略。', null, 230),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_024', '如果题目的背景信息改变了，我通常还能想到合适的解法。', null, 240),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_025', '面对升学或考试等重要节点，我经常能保持一种胜券在握的心理状态。', null, 250),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_026', '在出分前的等待期，我经常陷入一种“这次肯定凉了”的预判中。', null, 260),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_028', '当遇到学习上的小挫折时，我常常能迅速恢复信心，相信这不会影响最终的成功。', null, 280),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_029', '竞争升学机会的时候，我往往第一反应是自己肯定考不上，甚至产生弃考的念头。', null, 290),
  item('ACAD', 'LEARNING_MOTIVATION', 'ACAD_030', '我觉得无论怎么努力学习，最终的结果常常很难达到我的理想预期。', null, 300),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_032', '当我得到一个结果时，我会想一想它是否符合题目条件。', null, 320),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_033', '听到别人讲解时，我会思考其中的理由是否充分。', null, 330),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_034', '做完一道题后，我会判断自己的答案是否有清楚的依据。', null, 340),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_035', '当看到参考答案时，我会对照自己的思路进行比较。', null, 350),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_036', '当老师讲解一道题时，我会想一想这个答案为什么是对的。', null, 360),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_037', '当学习变得具有挑战性时，我仍然相信自己可以应对。', null, 370),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_038', '即使学习内容较难，我也相信自己能够学会。', null, 380),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_039', '当别人觉得某门课很难时，我仍相信自己能学好。', null, 390),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_040', '我会为每天的学习制定清晰的时间表，并尽量去遵守。', null, 400),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_041', '在放假时，我也会提前安排学习时间，而不是“看心情”学习，或者等到快开学才想起来学习。', null, 410),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_042', '错题不知道怎么改正的时候，我愿意向答对题目的人请教。', null, 420),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_044', '如果题目解不出来，我会主动向同学询问。', null, 440),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_046', '即使在某一个知识点上卡住很久，我也不愿意向别人求助。', null, 460),
  item('ACAD', 'COLLABORATIVE_LEARNING', 'ACAD_047', '学习遇到困难时，即使有人可以帮忙，我也不太愿意去问。', null, 470),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_050', '我常把零碎的知识点“缝合”成一个完整的知识图谱。', null, 500),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_051', '我常把新学的知识，和以前学过的内容串联起来。', null, 510),
  item('ACAD', 'TRANSFER_REASONING', 'ACAD_053', '上课时我会努力记住老师说的话，不太注意得到老师为什么这么说。', null, 530),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_055', '我会为了实现某个学习目标，主动构思一套适合自己的资料整理方案。', null, 550),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_056', '我常把零碎的知识“打包”成几个核心板块，以此减轻记忆压力。', null, 560),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_057', '面对复杂的公式或概念，我会尝试画一个简单的逻辑草图来理清思路。', null, 570),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_058', '我能清晰地指出当前学习的内容在整个学科体系中属于哪一部分。', null, 580),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_059', '复习时，我会通过画思维导图或结构图来汇总整章的考点。', null, 590),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_060', '我会在解题过程中检查自己的逻辑是否通顺。', null, 600),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_061', '做题过程中，我会不断反思当前策略是否有效。', null, 610),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_062', '在学习时，我会主动确认是否理解关键概念。', null, 620),
  item('ACAD', 'METACOGNITIVE_PLANNING', 'ACAD_063', '在做题过程中，我会注意自己是否理解每一步。', null, 630),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_001', '哪怕再生气，我也能先停下来深呼吸，而不是立刻发火。', null, 10),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_002', '当我极度生气时，我觉得自己完全控制不住自己的行为。', null, 20),
  item('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_003', '我对自己心情的微小变化也能有所察觉。', null, 30),
  item('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_004', '我能通过身体的感觉（如胃部发紧）知道自己是否在焦虑。', null, 40),
  item('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_005', '别人能通过身体信号（如坐立不安）猜到我的情绪，但我自己却常常意识不到。', null, 50),
  item('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_006', '我常把胸闷、呼吸不畅当作“身体不舒服”，不会想到和心情有关。', null, 60),
  item('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_007', '我常常要过很久，才意识到自己在生气或难过。', null, 70),
  item('EMOTION_REG', 'EMOTION_AWARENESS', 'EMOTION_008', '即使我的行为已经表现出烦躁（比如甩门、大声说话），我自己也可能没意识到我在生气。', null, 80),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_009', '我能很容易地想明白自己情绪变化的来龙去脉。', null, 90),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_010', '我能分辨出自己情绪中的不同成分（例如，又气又委屈）。', null, 100),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_011', '当一种情绪出现时，我通常明白是什么事情引起了它。', null, 110),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_012', '当多种情绪交织时（如既害怕又期待），我很难分清它们各自是由什么引起的。', null, 120),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_013', '我会突然感到心烦意乱，但找不到具体原因。', null, 130),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_014', '我心里有好几种感受的时候，我常常只能用一两个词（如“不好受”）来概括。', null, 140),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_015', '我经常有一种“说不清道不明”的难受或烦躁。', null, 150),
  item('EMOTION_REG', 'EMOTION_CLARITY', 'EMOTION_016', '我很难说清楚一种情绪（比如不开心）里面具体包含了什么。', null, 160),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_017', '在管理和调节情绪方面，我觉得自己是个“失败者”。', null, 170),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_018', '我相信，只要我愿意，总能找到一些让自己平静下来或开心一点的方法。', null, 180),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_019', '我相信，再强烈的负面情绪也总有办法可以应对或缓解。', null, 190),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_020', '一旦我陷入愤怒或沮丧的情绪，就好像掉进了一个爬不出来的坑。', null, 200),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_021', '我一旦开始焦虑，这种不安感就会笼罩我接下来要做的一切事情。', null, 210),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_022', '当我心烦意乱时，往往觉得没有任何办法能让我真正感觉好起来。', null, 220),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_024', '心情烦躁时，明明眼睛看着书本或屏幕，我的注意力早就飘到九霄云外了。', null, 240),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_025', '我有一些自己的小办法，能在情绪波动时帮助自己集中注意力。', null, 250),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_026', '别人和我说话时，如果我正在生气或委屈，我很难认真听对方在说什么。', null, 260),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_030', '我觉得，控制不住自己的情绪（比如当众哭或发怒）是件很丢脸的事。', null, 300),
  item('EMOTION_REG', 'REGULATION_CONFIDENCE', 'EMOTION_031', '我能接纳自己身上出现的所有情绪，不去评判它们。', null, 310),
  item('EMOTION_REG', 'IMPULSE_PAUSE', 'EMOTION_032', '当我被批评或嘲笑后，那些话会在我脑子里重复好多天。', null, 320),
  item('ADHD', 'DELAY_MOTIVATION', 'ADHD_001', '如果努力很久才能看到效果，我会觉得不值。', null, 10),
  item('ADHD', 'DELAY_MOTIVATION', 'ADHD_002', '如果要花几周才能完成目标，我的动力会慢慢消失。', null, 20),
  item('ADHD', 'INATTENTION', 'ADHD_003', '上课时，我的思绪总是到处乱飘。', null, 30),
  item('ADHD', 'INATTENTION', 'ADHD_004', '独自学习时，我的内心能平静下来。', null, 40),
  item('ADHD', 'INATTENTION', 'ADHD_005', '上课时，我能专心听讲不走神。', null, 50),
  item('ADHD', 'INATTENTION', 'ADHD_006', '安静呆着时，我的脑子还是停不下来。', null, 60),
  item('ADHD', 'INATTENTION', 'ADHD_007', '我常会因为突然冒出来的想法打断手头的事。', null, 70),
  item('ADHD', 'INATTENTION', 'ADHD_008', '听老师讲课，几分钟后我就开始发呆。', null, 80),
  item('ADHD', 'INATTENTION', 'ADHD_009', '就算周围很安静，我也很难一直专注做事。', null, 90),
  item('ADHD', 'OPPOSITIONALITY', 'ADHD_012', '我会向同学显示自己“天生反骨”，和老师对着干。', null, 120),
  item('ADHD', 'OPPOSITIONALITY', 'ADHD_013', '我常会找理由不按课堂规范做。', null, 130),
  item('ADHD', 'OPPOSITIONALITY', 'ADHD_014', '当课堂纪律有明确要求时，我一般会遵守。', null, 140),
  item('ADHD', 'OPPOSITIONALITY', 'ADHD_015', '当家长老师纠正我时，我会认真听。', null, 150),
  item('ADHD', 'OPPOSITIONALITY', 'ADHD_017', '即使学校的规章制度合理，我有时也不由自主地不想遵守。', null, 170),
  item('ADHD', 'INATTENTION', 'ADHD_018', '上课时，周围的声音很容易让我分心。', null, 180),
  item('ADHD', 'INATTENTION', 'ADHD_019', '专心做事时，我常觉得注意力被外界环境中的东西拉走。', null, 190),
  item('ADHD', 'DELAY_MOTIVATION', 'ADHD_020', '我总在开始做事情前想太多，导致拖很久也不动手。', null, 200),
  item('ADHD', 'DELAY_MOTIVATION', 'ADHD_021', '写作业时，我经常卡在“开始”这个阶段，拖半天才把书本打开。', null, 210),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_022', '自习写作业时，我总不自觉地动来动去。', null, 220),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_023', '站立或者坐着时，我经常不知不觉做些小动作。', null, 230),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_024', '和同学聊天，我常忍不住抢话。', null, 240),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_025', '面对诱惑，我能多等一会儿再决定。', null, 250),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_026', '游戏充值前，我会冷静评估必要性。', null, 260),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_027', '我常不等别人说完就忍不住插话。', null, 270),
  item('ADHD', 'HYPERACTIVITY_IMPULSIVITY', 'ADHD_028', '面对诱惑，我常控制不住马上行动。', null, 280),
  item('SSD', 'FUNCTION_IMPACT', 'SSD_001', '身体有点小变化一般不会影响我做事情。', null, 10),
  item('SSD', 'FUNCTION_IMPACT', 'SSD_002', '我容易因为身体哪里有点不舒服，就推掉计划好的社交活动。', null, 20),
  item('SSD', 'BODY_AWARENESS', 'SSD_003', '我会注意到身体的不同感觉（比如热、冷、紧绷）。', null, 30),
  item('SSD', 'BODY_AWARENESS', 'SSD_004', '身体有哪里不舒服会让我焦虑。', null, 40),
  item('SSD', 'CHECKING_COPING', 'SSD_005', '当身体有不舒服时，我会反复检查自己的身体情况。', null, 50),
  item('SSD', 'CHECKING_COPING', 'SSD_006', '即使只是身体轻微不适，我也会减少活动/工作量。', null, 60),
  item('SSD', 'BODY_WORRY', 'SSD_007', '如果身体的感觉和反应与平时不一样会让我有点慌。', null, 70),
  item('SSD', 'BODY_WORRY', 'SSD_008', '当身体有不适时，我会去查相关的症状或疾病信息。', null, 80),
  item('DASS_SHORT', 'STRESS', 'DASS_001', '最近，我发现自己很容易心烦意乱。', null, 10),
  item('DASS_SHORT', 'STRESS', 'DASS_002', '最近，我发现自己在某事让我心烦后，很难冷静下来。', null, 20),
  item('DASS_SHORT', 'STRESS', 'DASS_003', '我最近发现自己在为一些琐事而心烦意乱。', null, 30),
  item('DASS_SHORT', 'DEPRESSION', 'DASS_004', '我最近感到活得不值得。', null, 40),
  item('DASS_SHORT', 'DEPRESSION', 'DASS_005', '我最近感到人生毫无意义。', null, 50),
  item('DASS_SHORT', 'ANXIETY', 'DASS_006', '我最近曾感到摇摇欲坠（例如，感觉腿软）。', null, 60),
  item('DASS_SHORT', 'ANXIETY', 'DASS_007', '我最近曾打颤（例如，手在发抖）。', null, 70),
];

export async function getMvpScales() {
  return demoScales.filter((scale) => scale.active);
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
  return demoScales.find((scale) => scale.active && scale.scale_code === scaleCode) ?? null;
}

export async function getMvpDimensions(scaleCode: string) {
  return demoDimensions
    .filter((dimension) => dimension.active && dimension.scale_code === scaleCode)
    .sort((left, right) => left.sort_order - right.sort_order);
}

export async function getMvpDemoItems(scaleCode: string) {
  return demoItems
    .filter((demoItem) => demoItem.active && demoItem.scale_code === scaleCode)
    .sort((left, right) => left.sort_order - right.sort_order);
}

export async function getCurrentUser() {
  return mockMvpUser;
}

export async function getUserAttempts() {
  return {
    user: mockMvpUser,
    attempts: [] as MvpAttempt[],
    error: null as string | null,
  };
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
  promptEn: string | null,
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
