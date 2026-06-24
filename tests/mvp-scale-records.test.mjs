import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const nextConfig = readFileSync(new URL('../next.config.mjs', import.meta.url), 'utf8');
const mvpScales = readFileSync(new URL('../src/lib/mvpScales.ts', import.meta.url), 'utf8');
const detailPage = readFileSync(new URL('../src/app/[locale]/assessments/[scaleCode]/page.tsx', import.meta.url), 'utf8');
const takePage = readFileSync(new URL('../src/app/[locale]/assessments/[scaleCode]/take/page.tsx', import.meta.url), 'utf8');
const resultPage = readFileSync(new URL('../src/app/[locale]/assessments/[scaleCode]/result/page.tsx', import.meta.url), 'utf8');
const recordsPage = readFileSync(new URL('../src/app/[locale]/me/assessments/page.tsx', import.meta.url), 'utf8');
const catalogPage = readFileSync(new URL('../src/app/[locale]/assessments/page.tsx', import.meta.url), 'utf8');
const staticRecords = readFileSync(new URL('../src/lib/staticRecords.ts', import.meta.url), 'utf8');
const takeComponent = readFileSync(new URL('../src/components/StaticScaleTake.tsx', import.meta.url), 'utf8');
const resultComponent = readFileSync(new URL('../src/components/StaticScaleResult.tsx', import.meta.url), 'utf8');
const recordsComponent = readFileSync(new URL('../src/components/StaticRecordsList.tsx', import.meta.url), 'utf8');
const catalogComponent = readFileSync(new URL('../src/components/StaticAssessmentCatalog.tsx', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../src/components/Navigation.tsx', import.meta.url), 'utf8');
const localeLayout = readFileSync(new URL('../src/app/[locale]/layout.tsx', import.meta.url), 'utf8');
const rootPageExists = existsSync(new URL('../src/app/page.tsx', import.meta.url));

const scaleCodes = ['MWI', 'ACAD', 'EMOTION_REG', 'ADHD', 'SSD', 'DASS_SHORT'];
const itemCounts = {
  MWI: 95,
  ACAD: 54,
  EMOTION_REG: 28,
  ADHD: 25,
  SSD: 8,
  DASS_SHORT: 7,
};

test('static export is the default deployment mode', () => {
  assert.match(nextConfig, /output:\s*'export'/);
  assert.match(nextConfig, /trailingSlash:\s*true/);
  assert.match(nextConfig, /unoptimized:\s*true/);
  assert.equal(rootPageExists, true);
  assert.match(localeLayout, /setRequestLocale\(locale\)/);
});

test('MVP scale data defaults to bundled static records', () => {
  assert.doesNotMatch(mvpScales, /createSupabaseServerClient/);
  assert.doesNotMatch(mvpScales, /isSupabaseConfigured/);
  assert.match(mvpScales, /mockMvpUser/);

  for (const scaleCode of scaleCodes) {
    const localDimensions = [...mvpScales.matchAll(new RegExp(`dimension\\('${scaleCode}'`, 'g'))];
    const localItems = [...mvpScales.matchAll(new RegExp(`item\\('${scaleCode}'`, 'g'))];
    assert.equal(localDimensions.length, 4, `${scaleCode} dimension count`);
    assert.equal(localItems.length, itemCounts[scaleCode], `${scaleCode} item count`);
  }
});

test('assessment pages are statically generated from known scale codes', () => {
  for (const page of [detailPage, takePage, resultPage]) {
    assert.match(page, /generateStaticParams/);
    assert.match(page, /demoScales\.map/);
    assert.doesNotMatch(page, /force-dynamic/);
    assert.doesNotMatch(page, /redirect\(/);
    assert.doesNotMatch(page, /createSupabase/);
  }

  assert.match(detailPage, /href=\{`\/\$\{locale\}\/assessments\/\$\{scale\.scale_code\}\/take\/`\}/);
  assert.match(takePage, /StaticScaleTake/);
  assert.match(resultPage, /StaticScaleResult/);
});

test('static records use browser localStorage instead of user tables', () => {
  assert.match(staticRecords, /localStorage/);
  assert.match(staticRecords, /eqai\.static\.scaleAttempts\.v1/);
  assert.match(staticRecords, /ensureStaticAttempt/);
  assert.match(staticRecords, /completeStaticAttempt/);
  assert.match(takeComponent, /completeStaticAttempt/);
  assert.match(resultComponent, /readStaticAttempt/);
  assert.match(recordsComponent, /readStaticAttempts/);
  assert.match(recordsPage, /StaticRecordsList/);
  assert.doesNotMatch(recordsPage, /getUserAttempts|redirect|signOut/);
});

test('static catalog filters on the client and keeps localized scale text', () => {
  assert.match(catalogPage, /StaticAssessmentCatalog/);
  assert.match(catalogComponent, /normalizeMvpScaleCategory/);
  assert.match(catalogComponent, /filterMvpScalesByCategory/);
  assert.match(catalogComponent, /window\.history\.pushState/);
  assert.match(catalogComponent, /getLocalizedScaleText\(scale, locale\)/);
});

test('navigation defaults to records rather than database-backed auth state', () => {
  assert.match(navigation, /key: 'records'/);
  assert.doesNotMatch(navigation, /supabase\.auth/);
  assert.doesNotMatch(navigation, /authState/);
  assert.doesNotMatch(localeLayout, /getSupabaseBrowserConfig|isSupabaseConfigured/);
});
