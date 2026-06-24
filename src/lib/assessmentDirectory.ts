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

const localAssessmentData = bundledData as AssessmentData;

export async function getAssessmentCatalog(slug: string): Promise<AssessmentData> {
  void slug;
  return localAssessmentData;
}
export async function getAssessmentGroups(moduleCn?: string): Promise<AssessmentGroupSummary[]> {
  return getLocalGroupSummaries(moduleCn);
}

export async function getAssessmentModules(): Promise<AssessmentModuleSummary[]> {
  return getLocalModuleSummaries();
}

export async function getAssessmentMeasures(groupCode?: string): Promise<AssessmentMeasureSummary[]> {
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
