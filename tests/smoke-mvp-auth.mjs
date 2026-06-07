import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

loadLocalEnv('.env.local');

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const email = process.env.MVP_SMOKE_EMAIL;
const password = process.env.MVP_SMOKE_PASSWORD;
const shouldCreate = process.env.MVP_SMOKE_CREATE === '1';
const scaleCode = process.env.MVP_SMOKE_SCALE_CODE ?? 'MWI_DEMO';

if (!supabaseUrl || !supabasePublishableKey) {
  fail('Supabase env vars are missing. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.');
}

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const { data: scale, error: scaleError } = await supabase
  .from('assessment_scales')
  .select('scale_code,title_en,title_cn')
  .eq('active', true)
  .eq('scale_code', scaleCode)
  .maybeSingle();

if (scaleError || !scale) {
  fail(formatDatabaseError(scaleError?.message ?? `Scale ${scaleCode} was not readable.`));
}

const { data: items, error: itemsError } = await supabase
  .from('assessment_demo_items')
  .select('item_code')
  .eq('active', true)
  .eq('scale_code', scale.scale_code)
  .order('sort_order', { ascending: true });

if (itemsError || !items || items.length === 0) {
  fail(formatDatabaseError(itemsError?.message ?? `Scale ${scale.scale_code} has no readable demo items.`));
}

if (!email || !password) {
  console.log(
    [
      `MVP public catalog smoke passed for ${scale.scale_code} with ${items.length} demo items.`,
      'MVP auth smoke skipped: set MVP_SMOKE_EMAIL and MVP_SMOKE_PASSWORD to verify login and user-owned attempt writes.',
      'To create a new public test account, also set MVP_SMOKE_CREATE=1.',
      'This script does not create accounts by default because Supabase email quotas can block repeated runs.',
    ].join('\n')
  );
  process.exit(0);
}

const result = shouldCreate
  ? await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: process.env.MVP_SMOKE_REDIRECT_TO ?? 'http://127.0.0.1:3029/en/me/assessments',
      },
    })
  : await supabase.auth.signInWithPassword({ email, password });

if (result.error) {
  fail(formatAuthError(result.error));
}

const user = result.data.user;
const session = result.data.session;

if (!user || !session) {
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: shouldCreate ? 'signup' : 'login',
        userId: user?.id ?? null,
        hasSession: Boolean(session),
        needsEmailConfirmation: Boolean(user && !session),
        scaleCode: scale.scale_code,
        itemCount: items.length,
      },
      null,
      2
    )
  );
  process.exit(0);
}

const smokeNotes = `MVP auth smoke for ${scale.scale_code}`;
const { data: existingAttempts, error: existingAttemptsError } = await supabase
  .from('user_scale_attempts')
  .select('id,status,total_score,notes')
  .eq('user_id', user.id)
  .eq('scale_code', scale.scale_code)
  .eq('notes', smokeNotes)
  .order('started_at', { ascending: false })
  .limit(1);

if (existingAttemptsError) {
  fail(formatDatabaseError(existingAttemptsError.message));
}

let attemptId = existingAttempts?.[0]?.id;

if (!attemptId) {
  const { data: insertedAttempt, error: insertAttemptError } = await supabase
    .from('user_scale_attempts')
    .insert({
      user_id: user.id,
      scale_code: scale.scale_code,
      status: 'started',
      notes: smokeNotes,
    })
    .select('id')
    .single();

  if (insertAttemptError) {
    fail(formatDatabaseError(insertAttemptError.message));
  }

  attemptId = insertedAttempt.id;
}

const totalScore = items.reduce((sum, _item, index) => sum + ((index % 5) + 1), 0);
const { data: completedAttempt, error: completeAttemptError } = await supabase
  .from('user_scale_attempts')
  .update({
    status: 'completed',
    total_score: totalScore,
    completed_at: new Date().toISOString(),
    notes: smokeNotes,
  })
  .eq('id', attemptId)
  .eq('user_id', user.id)
  .eq('scale_code', scale.scale_code)
  .select('id,status,total_score,scale_code')
  .single();

if (completeAttemptError) {
  fail(formatDatabaseError(completeAttemptError.message));
}

if (completedAttempt.status !== 'completed' || completedAttempt.total_score !== totalScore) {
  fail('MVP attempt write verification failed: completed attempt did not round-trip expected status and score.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: shouldCreate ? 'signup' : 'login',
      userId: user.id,
      hasSession: true,
      scaleCode: completedAttempt.scale_code,
      itemCount: items.length,
      attemptId: completedAttempt.id,
      totalScore: completedAttempt.total_score,
    },
    null,
    2
  )
);

function loadLocalEnv(path) {
  let content = '';

  try {
    content = readFileSync(path, 'utf8');
  } catch {
    return;
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function formatAuthError(error) {
  const code = error.code ? ` (${error.code})` : '';
  const status = error.status ? ` status=${error.status}` : '';

  return `Supabase Auth smoke failed${code}${status}: ${error.message}`;
}

function formatDatabaseError(message) {
  return /assessment_scales|assessment_demo_items|user_scale_attempts|schema cache|PGRST205/i.test(message)
    ? 'MVP database tables are not ready. Run backend/ingestion/mvp_scale_records.sql in Supabase SQL Editor first.'
    : `MVP database smoke failed: ${message}`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
