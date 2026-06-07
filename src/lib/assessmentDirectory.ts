import bundledData from '../../dataset/assessment_data.json';

export interface AssessmentMeasure {
  name: string;
  code: string;
  desc_casual: string;
  desc_academic: string;
}

export interface AssessmentGroup {
  code: string;
  title_en: string;
  title_cn: string;
  title_full: string;
  module_cn: string;
  module_code: number;
  measures: AssessmentMeasure[];
}

export interface AssessmentData {
  original: AssessmentGroup[];
  adopted: AssessmentGroup[];
  all_groups: AssessmentGroup[];
}

export interface AssessmentModuleSummary {
  module_cn: string;
  module_code: number;
  group_count: number;
  measure_count: number;
}

export interface AssessmentGroupSummary {
  code: string;
  title_en: string;
  title_cn: string;
  title_full: string;
  module_cn: string;
  module_code: number;
  measure_count: number;
}

export interface AssessmentMeasureSummary extends AssessmentMeasure {
  group_code: string;
  group_title_en: string;
  group_title_cn: string;
  module_cn: string;
  module_code: number;
}

interface SupabaseAssessmentGroupRow {
  code: string;
  title_en: string | null;
  title_cn: string | null;
  title_full: string | null;
  module_cn: string | null;
  module_code: number | null;
  assessment_measures?: Array<{
    code: string;
    name: string | null;
    desc_casual: string | null;
    desc_academic: string | null;
  }>;
}

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const localAssessmentData = bundledData as AssessmentData;

function getSupabaseHeaders() {
  if (!SUPABASE_PUBLISHABLE_KEY) return null;

  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  };
}

async function fetchSupabaseJson<T>(path: string, params: Record<string, string>) {
  const headers = getSupabaseHeaders();
  if (!SUPABASE_URL || !headers) return null;

  const url = new URL(path, SUPABASE_URL);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers,
    next: { revalidate: 300 },
  });

  if (!response.ok) return null;

  return (await response.json()) as T;
}

export async function getAssessmentCatalog(slug: string): Promise<AssessmentData> {
  const rows = await fetchSupabaseJson<Array<{ payload?: unknown }>>(
    '/rest/v1/assessment_catalog',
    {
      select: 'payload',
      slug: `eq.${slug}`,
      active: 'eq.true',
      limit: '1',
    }
  );

  const payload = rows?.[0]?.payload;
  return isAssessmentData(payload) ? payload : localAssessmentData;
}

export async function getAssessmentGroups(moduleCn?: string): Promise<AssessmentGroupSummary[]> {
  const rows = await fetchSupabaseJson<SupabaseAssessmentGroupRow[]>(
    '/rest/v1/assessment_groups',
    {
      select: 'code,title_en,title_cn,title_full,module_cn,module_code,assessment_measures(code)',
      active: 'eq.true',
      order: 'module_code.asc,sort_order.asc,code.asc',
      ...(moduleCn ? { module_cn: `eq.${moduleCn}` } : {}),
    }
  );

  if (rows) return rows.map(mapSupabaseGroupSummary);

  return getLocalGroupSummaries(moduleCn);
}

export async function getAssessmentModules(): Promise<AssessmentModuleSummary[]> {
  const rows = await fetchSupabaseJson<Array<{
    module_cn: string | null;
    module_code: number | null;
    assessment_groups?: Array<{
      code: string;
      assessment_measures?: Array<{ code: string }>;
    }>;
  }>>(
    '/rest/v1/assessment_modules',
    {
      select: 'module_cn,module_code,assessment_groups!inner(code,assessment_measures(code))',
      active: 'eq.true',
      'assessment_groups.active': 'eq.true',
      order: 'module_code.asc',
    }
  );

  if (rows) {
    return rows.map((row) => ({
      module_cn: row.module_cn ?? '',
      module_code: row.module_code ?? 0,
      group_count: row.assessment_groups?.length ?? 0,
      measure_count:
        row.assessment_groups?.reduce(
          (total, group) => total + (group.assessment_measures?.length ?? 0),
          0
        ) ?? 0,
    }));
  }

  return getLocalModuleSummaries();
}

export async function getAssessmentMeasures(groupCode?: string): Promise<AssessmentMeasureSummary[]> {
  const rows = await fetchSupabaseJson<Array<{
    code: string;
    group_code: string;
    name: string | null;
    desc_casual: string | null;
    desc_academic: string | null;
  }>>(
    '/rest/v1/assessment_measures',
    {
      select: 'code,group_code,name,desc_casual,desc_academic',
      active: 'eq.true',
      order: 'group_code.asc,sort_order.asc,code.asc',
      ...(groupCode ? { group_code: `eq.${groupCode}` } : {}),
    }
  );

  if (rows) {
    const groups = await getAssessmentGroups();
    const groupMap = new Map(groups.map((group) => [group.code, group]));

    return rows.map((row) => ({
      code: row.code,
      name: row.name ?? '',
      desc_casual: row.desc_casual ?? '',
      desc_academic: row.desc_academic ?? '',
      group_code: row.group_code,
      group_title_en: groupMap.get(row.group_code)?.title_en ?? '',
      group_title_cn: groupMap.get(row.group_code)?.title_cn ?? '',
      module_cn: groupMap.get(row.group_code)?.module_cn ?? '',
      module_code: groupMap.get(row.group_code)?.module_code ?? 0,
    }));
  }

  return getLocalMeasureSummaries(groupCode);
}

export function getLocalModuleSummaries(data: AssessmentData = localAssessmentData): AssessmentModuleSummary[] {
  const moduleMap = new Map<string, AssessmentModuleSummary>();

  for (const group of data.all_groups) {
    const existing = moduleMap.get(group.module_cn) ?? {
      module_cn: group.module_cn,
      module_code: group.module_code,
      group_count: 0,
      measure_count: 0,
    };

    existing.group_count += 1;
    existing.measure_count += group.measures.length;
    moduleMap.set(group.module_cn, existing);
  }

  return Array.from(moduleMap.values()).sort((a, b) => a.module_code - b.module_code);
}

export function getLocalGroupSummaries(
  moduleCn?: string,
  data: AssessmentData = localAssessmentData
): AssessmentGroupSummary[] {
  return data.all_groups
    .filter((group) => !moduleCn || group.module_cn === moduleCn)
    .map((group) => ({
      code: group.code,
      title_en: group.title_en,
      title_cn: group.title_cn,
      title_full: group.title_full,
      module_cn: group.module_cn,
      module_code: group.module_code,
      measure_count: group.measures.length,
    }))
    .sort((a, b) => a.module_code - b.module_code || a.code.localeCompare(b.code));
}

export function getLocalMeasureSummaries(
  groupCode?: string,
  data: AssessmentData = localAssessmentData
): AssessmentMeasureSummary[] {
  return data.all_groups
    .filter((group) => !groupCode || group.code === groupCode)
    .flatMap((group) =>
      group.measures.map((measure) => ({
        ...measure,
        group_code: group.code,
        group_title_en: group.title_en,
        group_title_cn: group.title_cn,
        module_cn: group.module_cn,
        module_code: group.module_code,
      }))
    )
    .sort(
      (a, b) =>
        a.module_code - b.module_code ||
        a.group_code.localeCompare(b.group_code) ||
        a.code.localeCompare(b.code)
    );
}

function mapSupabaseGroupSummary(row: SupabaseAssessmentGroupRow): AssessmentGroupSummary {
  return {
    code: row.code,
    title_en: row.title_en ?? '',
    title_cn: row.title_cn ?? '',
    title_full: row.title_full ?? '',
    module_cn: row.module_cn ?? '',
    module_code: row.module_code ?? 0,
    measure_count: row.assessment_measures?.length ?? 0,
  };
}

function isAssessmentData(value: unknown): value is AssessmentData {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<AssessmentData>;
  return (
    Array.isArray(candidate.original) &&
    Array.isArray(candidate.adopted) &&
    Array.isArray(candidate.all_groups)
  );
}
