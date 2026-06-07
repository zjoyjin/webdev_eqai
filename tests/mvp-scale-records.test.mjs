import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../backend/ingestion/mvp_scale_records.sql', import.meta.url), 'utf8');
const rlsSmokeSql = readFileSync(new URL('../backend/ingestion/mvp_rls_smoke.sql', import.meta.url), 'utf8');
const actions = readFileSync(new URL('../src/app/[locale]/mvpScaleActions.ts', import.meta.url), 'utf8');
const catalogPage = readFileSync(new URL('../src/app/[locale]/assessments/page.tsx', import.meta.url), 'utf8');
const detailPage = readFileSync(new URL('../src/app/[locale]/assessments/[scaleCode]/page.tsx', import.meta.url), 'utf8');
const homePage = readFileSync(new URL('../src/app/[locale]/page.tsx', import.meta.url), 'utf8');
const takePage = readFileSync(new URL('../src/app/[locale]/assessments/[scaleCode]/take/page.tsx', import.meta.url), 'utf8');
const resultPage = readFileSync(new URL('../src/app/[locale]/assessments/[scaleCode]/result/page.tsx', import.meta.url), 'utf8');
const recordsPage = readFileSync(new URL('../src/app/[locale]/me/assessments/page.tsx', import.meta.url), 'utf8');
const workPage = readFileSync(new URL('../src/app/[locale]/work/page.tsx', import.meta.url), 'utf8');
const personalPage = readFileSync(new URL('../src/app/[locale]/personal/page.tsx', import.meta.url), 'utf8');
const kidPage = readFileSync(new URL('../src/app/[locale]/kid/page.tsx', import.meta.url), 'utf8');
const petPage = readFileSync(new URL('../src/app/[locale]/pet/page.tsx', import.meta.url), 'utf8');
const smokeScript = readFileSync(new URL('../tests/smoke-mvp-auth.mjs', import.meta.url), 'utf8');
const loginForm = readFileSync(new URL('../src/components/LoginForm.tsx', import.meta.url), 'utf8');
const authCallbackRoute = readFileSync(new URL('../src/app/auth/callback/route.ts', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../src/middleware.ts', import.meta.url), 'utf8');
const packageJson = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const readinessScript = readFileSync(new URL('../tests/check-mvp-readiness.mjs', import.meta.url), 'utf8');
const mvpScales = readFileSync(new URL('../src/lib/mvpScales.ts', import.meta.url), 'utf8');
const navigation = readFileSync(new URL('../src/components/Navigation.tsx', import.meta.url), 'utf8');
const localeLayout = readFileSync(new URL('../src/app/[locale]/layout.tsx', import.meta.url), 'utf8');
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');

const scaleCodes = [
  'MWI',
  'ACAD',
  'EMOTION_REG',
  'ADHD',
  'SSD',
  'DASS_SHORT',
];

const itemCounts = {
  MWI: 95,
  ACAD: 54,
  EMOTION_REG: 28,
  ADHD: 25,
  SSD: 8,
  DASS_SHORT: 7,
};

test('MVP SQL defines the required scale and user attempt tables', () => {
  for (const tableName of [
    'assessment_scales',
    'assessment_dimensions',
    'assessment_demo_items',
    'user_scale_attempts',
  ]) {
    assert.match(sql, new RegExp(`CREATE TABLE IF NOT EXISTS ${tableName}`));
  }
});

test('MVP attempt status is explicitly bounded to started or completed', () => {
  assert.match(sql, /status\s+TEXT NOT NULL CHECK \(status IN \('started', 'completed'\)\)/);
});

test('MVP RLS keeps user scale attempts owner-scoped', () => {
  assert.match(sql, /ALTER TABLE user_scale_attempts ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /user_scale_attempts_select_own/);
  assert.match(sql, /user_scale_attempts_insert_own/);
  assert.match(sql, /user_scale_attempts_update_own/);
  assert.match(sql, /\(select auth\.uid\(\)\) = user_id/);
});

test('MVP seed includes six assessment scales with product-facing copy', () => {
  for (const scaleCode of scaleCodes) {
    assert.match(sql, new RegExp(`'${scaleCode}'`));
  }

  assert.match(sql, /Rows are informational tools and not clinical diagnostic instruments/i);
  assert.match(sql, /EQAI多维智慧与智力问卷/);
  assert.match(sql, /EQAI-躯体症状障碍量表/);
  assert.doesNotMatch(sql, /用于测试|A demo scale for testing|MVP demo scale catalog/i);
});

test('MVP scale seed and local fallback include enough dimensions and answerable items', () => {
  for (const scaleCode of scaleCodes) {
    const dimensionRows = [...sql.matchAll(new RegExp(`\\('${scaleCode}',\\s*'[A-Z_]+',\\s*NULL`, 'g'))];
    const itemRows = [...sql.matchAll(new RegExp(`\\('${scaleCode}',\\s*'[A-Z_]+',\\s*'[A-Z_0-9]+'`, 'g'))];
    const localDimensions = [...mvpScales.matchAll(new RegExp(`dimension\\('${scaleCode}'`, 'g'))];
    const localItems = [...mvpScales.matchAll(new RegExp(`item\\('${scaleCode}'`, 'g'))];

    assert.equal(dimensionRows.length, 4, `${scaleCode} SQL dimension count`);
    assert.equal(itemRows.length, itemCounts[scaleCode], `${scaleCode} SQL item count`);
    assert.equal(localDimensions.length, 4, `${scaleCode} fallback dimension count`);
    assert.equal(localItems.length, itemCounts[scaleCode], `${scaleCode} fallback item count`);
  }

  assert.match(sql, /'MWI', 'EXECUTION_RESILIENCE'/);
  assert.match(sql, /'SSD', 'BODY_WORRY'/);
  assert.match(mvpScales, /item\('MWI', 'AESTHETIC_EXPRESSION', 'MWI_008'/);
  assert.match(mvpScales, /item\('DASS_SHORT', 'ANXIETY', 'DASS_007'/);
});

test('MVP assessment flow routes started attempts through the demo take page', () => {
  assert.match(actions, /redirect\(`\/\$\{locale\}\/assessments\/\$\{scaleCode\}\/take\?attemptId=\$\{attemptId\}`\)/);
  assert.match(recordsPage, /\/assessments\/\$\{attempt\.scale_code\}\/take\?attemptId=\$\{attempt\.id\}/);
  assert.match(recordsPage, /t\('continue'\)/);
});

test('MVP catalog groups assessments by module before listing scale cards', () => {
  assert.match(catalogPage, /groupedScales = scales\.reduce/);
  assert.match(catalogPage, /moduleCode: scale\.module_code/);
  assert.match(catalogPage, /group\.scales\.map/);
  assert.match(catalogPage, /\{group\.scales\.length\} \{copy\.scaleCount\}/);
  assert.match(catalogPage, /getLocalizedScaleText\(scale, locale\)/);
});

test('MVP Chinese assessment surfaces do not duplicate English secondary text', () => {
  assert.match(mvpScales, /const secondaryTitle = isZh \? null : scale\.title_cn/);
  assert.match(mvpScales, /const secondaryTitle = isZh \? null : dimension\.title_cn/);
  assert.match(mvpScales, /const secondaryPrompt = isZh \? null : item\.prompt_cn/);
  assert.match(catalogPage, /localized\.secondaryTitle/);
  assert.match(detailPage, /localizedScale\.secondaryTitle/);
  assert.match(detailPage, /localizedDimension\.secondaryTitle/);
  assert.match(takePage, /localizedItem\.secondaryPrompt/);
  assert.doesNotMatch(zhMessages, /情智AI/);
  assert.match(zhMessages, /"appName": "EQAI"/);
});

test('MVP detail page does not preview non-answerable questions or internal variants', () => {
  assert.doesNotMatch(detailPage, /getMvpDemoItems/);
  assert.doesNotMatch(detailPage, /getLocalizedItemText/);
  assert.doesNotMatch(detailPage, /item\.item_code/);
  assert.doesNotMatch(detailPage, /localizedItem\.secondaryPrompt/);
  assert.doesNotMatch(detailPage, /dimension\.variant_type/);
  assert.match(takePage, /getMvpDemoItems/);
  assert.match(takePage, /name=\{`score_\$\{item\.item_code\}`\}/);
});

test('MVP navigation swaps login and records from the browser auth session', () => {
  assert.match(localeLayout, /getSupabaseBrowserConfig/);
  assert.match(localeLayout, /authConfigured=\{isSupabaseConfigured\(\)\}/);
  assert.match(navigation, /authState, setAuthState/);
  assert.match(navigation, /authConfigured \? 'loading' : 'signedOut'/);
  assert.match(navigation, /supabase\.auth\.getSession\(\)/);
  assert.match(navigation, /supabase\.auth\.onAuthStateChange/);
  assert.match(navigation, /authState === 'signedIn'\s*\?\s*\{ key: 'records'/);
  assert.match(navigation, /authState === 'signedOut'\s*\?\s*\{ key: 'login'/);
  assert.match(navigation, /\.filter\(\(item\): item is \{ key: string; href: string; label: string \}/);
});

test('MVP category entry points route into the unified filtered catalog', () => {
  assert.match(mvpScales, /mvpScaleCategories = \['work', 'personal', 'kid', 'pet'\]/);
  assert.match(mvpScales, /filterMvpScalesByCategory/);
  assert.match(catalogPage, /normalizeMvpScaleCategory\(searchParams\.category\)/);
  assert.match(catalogPage, /href=\{`\/\$\{locale\}\/assessments\?category=\$\{category\}`\}/);
  assert.match(homePage, /\/assessments\?category=work/);
  assert.match(homePage, /\/assessments\?category=personal/);
  assert.match(homePage, /\/assessments\?category=kid/);
  assert.match(homePage, /\/assessments\?category=pet/);

  for (const [page, category] of [
    [workPage, 'work'],
    [personalPage, 'personal'],
    [kidPage, 'kid'],
    [petPage, 'pet'],
  ]) {
    assert.match(page, new RegExp(`/assessments\\?category=${category}`));
    assert.doesNotMatch(page, /placeholder/i);
  }
});

test('MVP demo submission validates 1-7 item scores and saves a total score', () => {
  assert.match(takePage, /const SCORE_OPTIONS = \[1, 2, 3, 4, 5, 6, 7\]/);
  assert.match(takePage, /name=\{`score_\$\{item\.item_code\}`\}/);
  assert.match(actions, /score < 1 \|\| score > 7/);
  assert.match(actions, /totalScore = \(scores as number\[\]\)\.reduce/);
  assert.match(actions, /total_score: totalScore/);
  assert.match(actions, /status: 'completed'/);
});

test('MVP demo submission lands on a saved result page before history', () => {
  assert.match(actions, /\/assessments\/\$\{scaleCode\}\/result\?attemptId=\$\{attemptId\}/);
  assert.match(resultPage, /Result saved/);
  assert.match(resultPage, /Total score/);
  assert.match(resultPage, /does not represent a formal psychological assessment result or diagnosis/);
  assert.match(resultPage, /\/me\/assessments/);
});

test('MVP smoke verifies public catalog and authenticated attempt writes when credentials exist', () => {
  assert.match(smokeScript, /\.from\('assessment_scales'\)/);
  assert.match(smokeScript, /\.from\('assessment_demo_items'\)/);
  assert.match(smokeScript, /MVP public catalog smoke passed/);
  assert.match(smokeScript, /MVP_SMOKE_EMAIL/);
  assert.match(smokeScript, /\.from\('user_scale_attempts'\)/);
  assert.match(smokeScript, /status: 'completed'/);
  assert.match(smokeScript, /total_score: totalScore/);
  assert.match(smokeScript, /completedAttempt\.total_score !== totalScore/);
});

test('MVP RLS smoke proves two-user isolation and rolls back test data', () => {
  assert.match(rlsSmokeSql, /BEGIN;/);
  assert.match(rlsSmokeSql, /ROLLBACK;/);
  assert.match(rlsSmokeSql, /mvp-rls-user-a@example\.test/);
  assert.match(rlsSmokeSql, /mvp-rls-user-b@example\.test/);
  assert.match(rlsSmokeSql, /SET LOCAL ROLE authenticated/);
  assert.match(rlsSmokeSql, /request\.jwt\.claim\.sub = '00000000-0000-4000-8000-000000000001'/);
  assert.match(rlsSmokeSql, /request\.jwt\.claim\.sub = '00000000-0000-4000-8000-000000000002'/);
  assert.match(rlsSmokeSql, /user_a_completed_visible/);
  assert.match(rlsSmokeSql, /user_b_visible_attempts/);
  assert.match(rlsSmokeSql, /user_b_updated_attempts/);
});

test('MVP registration confirmation uses the SSR auth callback safely', () => {
  assert.match(loginForm, /useTranslations\('auth'\)/);
  assert.match(readFileSync(new URL('../src/app/[locale]/login/page.tsx', import.meta.url), 'utf8'), /getTranslations\(\{ locale, namespace: 'auth' \}\)/);
  assert.match(loginForm, /emailRedirectTo: `\$\{window\.location\.origin\}\/auth\/callback\?next=/);
  assert.match(loginForm, /encodeURIComponent\(nextPath \|\| `\/\$\{locale\}\/me\/assessments`\)/);
  assert.match(middleware, /\(\?!_next\|_vercel\|api\|auth\|\.\*\\\\\.\.\*\)/);
  assert.match(authCallbackRoute, /exchangeCodeForSession\(code\)/);
  assert.match(authCallbackRoute, /value === '\/en'/);
  assert.match(authCallbackRoute, /value === '\/zh'/);
  assert.match(authCallbackRoute, /value\.startsWith\('\/en\/'\)/);
  assert.match(authCallbackRoute, /value\.startsWith\('\/zh\/'\)/);
  assert.match(authCallbackRoute, /Missing authentication code\./);
});

test('MVP auth and records surfaces are localized', () => {
  assert.match(recordsPage, /getTranslations\(\{ locale, namespace: 'records' \}\)/);
  assert.match(recordsPage, /t\('logout'\)/);
  assert.match(recordsPage, /t\('emptyTitle'\)/);
  assert.match(recordsPage, /Intl\.DateTimeFormat\(locale === 'zh' \? 'zh-CN' : 'en'/);
  assert.match(loginForm, /t\('loginTab'\)/);
  assert.match(loginForm, /t\('registerTab'\)/);
  assert.match(loginForm, /t\('registrationSaved'\)/);
  assert.match(loginForm, /t\('emailNotConfirmed'\)/);
  assert.match(loginForm, /t\('rateLimited'\)/);

  for (const messages of [enMessages, zhMessages]) {
    assert.match(messages, /"auth"/);
    assert.match(messages, /"records"/);
    assert.match(messages, /"loginTab"/);
    assert.match(messages, /"registerTab"/);
    assert.match(messages, /"logout"/);
    assert.match(messages, /"browseDemoScales"/);
  }
});

test('MVP product surfaces avoid visible demo and test wording', () => {
  for (const page of [catalogPage, detailPage, takePage, resultPage, actions, enMessages, zhMessages]) {
    assert.doesNotMatch(page, /Demo catalog|Assessment MVP|Start demo scale|Submit demo result|demo total score/i);
    assert.doesNotMatch(page, /浏览、作答并保存 demo 记录|demo 量表|MVP 流程/i);
  }
});

test('MVP readiness check reports missing authenticated smoke credentials explicitly', () => {
  assert.match(packageJson, /"check:mvp": "node tests\/check-mvp-readiness\.mjs"/);
  assert.match(readinessScript, /blocked_by_test_account/);
  assert.match(readinessScript, /MVP_SMOKE_EMAIL/);
  assert.match(readinessScript, /MVP_SMOKE_PASSWORD/);
  assert.match(readinessScript, /publicCatalogReadable/);
  assert.match(readinessScript, /authWriteSmokeRunnable/);
});
