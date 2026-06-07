import assert from 'node:assert/strict';
import test from 'node:test';
import data from '../dataset/assessment_data.json' with { type: 'json' };

function getModuleSummaries(assessmentData) {
  const moduleMap = new Map();

  for (const group of assessmentData.all_groups) {
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

function getGroupSummaries(assessmentData, moduleCn) {
  return assessmentData.all_groups
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

function getMeasureSummaries(assessmentData, groupCode) {
  return assessmentData.all_groups
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
    );
}

test('assessment catalog keeps the legacy top-level shape', () => {
  assert.deepEqual(Object.keys(data), ['original', 'adopted', 'all_groups']);
  assert.equal(data.original.length, 17);
  assert.equal(data.adopted.length, 3);
  assert.equal(data.all_groups.length, 20);
});

test('module summaries expose grouped directory counts', () => {
  const modules = getModuleSummaries(data);

  assert.deepEqual(
    modules.map((module) => module.module_cn),
    ['身心健康', '能力与发展', '家长参与']
  );
  assert.equal(modules.reduce((total, module) => total + module.group_count, 0), 20);
  assert.equal(modules.reduce((total, module) => total + module.measure_count, 0), 103);
});

test('group summaries can be filtered by module', () => {
  const groups = getGroupSummaries(data, '能力与发展');

  assert.equal(groups.length, 7);
  assert.ok(groups.every((group) => group.module_cn === '能力与发展'));
  assert.ok(groups.every((group) => typeof group.measure_count === 'number'));
});

test('measure summaries can be filtered by group code', () => {
  const measures = getMeasureSummaries(data, 'MWI');

  assert.equal(measures.length, 21);
  assert.ok(measures.every((measure) => measure.group_code === 'MWI'));
  assert.ok(measures.every((measure) => measure.desc_casual.length > 0));
  assert.ok(measures.every((measure) => measure.desc_academic.length > 0));
});
