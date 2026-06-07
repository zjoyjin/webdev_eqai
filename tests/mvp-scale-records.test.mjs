import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../backend/ingestion/mvp_scale_records.sql', import.meta.url), 'utf8');
const rlsSmokeSql = readFileSync(new URL('../backend/ingestion/mvp_rls_smoke.sql', import.meta.url), 'utf8');
const actions = readFileSync(new URL('../src/app/[locale]/mvpScaleActions.ts', import.meta.url), 'utf8');
const catalogPage = readFileSync(new URL('../src/app/[locale]/assessments/page.tsx', import.meta.url), 'utf8');
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
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');

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

test('MVP seed includes six demo scales and visible demo wording', () => {
  const scaleCodes = [...sql.matchAll(/'([A-Z_]+_DEMO)'/g)].map((match) => match[1]);
  assert.deepEqual(
    Array.from(new Set(scaleCodes)).filter((code) =>
      [
        'MWI_DEMO',
        'ACAD_DEMO',
        'PERSONALITY_DEMO',
        'EMOTION_REG_DEMO',
        'ADHD_DEMO',
        'PARENTING_STYLE_DEMO',
      ].includes(code)
    ).sort(),
    [
      'ACAD_DEMO',
      'ADHD_DEMO',
      'EMOTION_REG_DEMO',
      'MWI_DEMO',
      'PARENTING_STYLE_DEMO',
      'PERSONALITY_DEMO',
    ]
  );
  assert.match(sql, /not validated formal psychological instruments/i);
});

test('MVP assessment flow routes started attempts through the demo take page', () => {
  assert.match(actions, /redirect\(`\/\$\{locale\}\/assessments\/\$\{scaleCode\}\/take\?attemptId=\$\{attemptId\}`\)/);
  assert.match(recordsPage, /\/assessments\/\$\{attempt\.scale_code\}\/take\?attemptId=\$\{attempt\.id\}/);
  assert.match(recordsPage, /t\('continue'\)/);
});

test('MVP catalog groups demo scales by module before listing scale cards', () => {
  assert.match(catalogPage, /groupedScales = scales\.reduce/);
  assert.match(catalogPage, /moduleCode: scale\.module_code/);
  assert.match(catalogPage, /group\.scales\.map/);
  assert.match(catalogPage, /\{group\.scales\.length\} \{copy\.demoScales\}/);
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

test('MVP demo submission validates 1-5 item scores and saves a total score', () => {
  assert.match(takePage, /const SCORE_OPTIONS = \[1, 2, 3, 4, 5\]/);
  assert.match(takePage, /name=\{`score_\$\{item\.item_code\}`\}/);
  assert.match(actions, /score < 1 \|\| score > 5/);
  assert.match(actions, /totalScore = \(scores as number\[\]\)\.reduce/);
  assert.match(actions, /total_score: totalScore/);
  assert.match(actions, /status: 'completed'/);
});

test('MVP demo submission lands on a saved result page before history', () => {
  assert.match(actions, /\/assessments\/\$\{scaleCode\}\/result\?attemptId=\$\{attemptId\}/);
  assert.match(resultPage, /Demo result saved/);
  assert.match(resultPage, /Total score/);
  assert.match(resultPage, /not represent a formal psychological assessment result/);
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

  for (const messages of [enMessages, zhMessages]) {
    assert.match(messages, /"auth"/);
    assert.match(messages, /"records"/);
    assert.match(messages, /"loginTab"/);
    assert.match(messages, /"registerTab"/);
    assert.match(messages, /"logout"/);
    assert.match(messages, /"browseDemoScales"/);
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
