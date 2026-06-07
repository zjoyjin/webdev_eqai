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

const checks = {
  hasSupabaseUrl: Boolean(supabaseUrl),
  hasPublishableKey: Boolean(supabasePublishableKey),
  hasSmokeCredentials: Boolean(email && password),
  publicCatalogReadable: false,
  authWriteSmokeRunnable: Boolean(email && password),
};

if (supabaseUrl && supabasePublishableKey) {
  const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await supabase
    .from('assessment_scales')
    .select('scale_code')
    .eq('active', true)
    .limit(1);

  checks.publicCatalogReadable = !error && Array.isArray(data) && data.length > 0;
}

const missing = Object.entries(checks)
  .filter(([, value]) => value === false)
  .map(([key]) => key);
const status = missing.length === 0 ? 'ready' : 'blocked_by_test_account';

console.log(
  JSON.stringify(
    {
      status,
      checks,
      missing,
      nextAction:
        status === 'ready'
          ? 'Run npm run smoke:mvp-auth to verify authenticated attempt writes.'
          : 'Set MVP_SMOKE_EMAIL and MVP_SMOKE_PASSWORD for an existing confirmed Supabase Auth user, then run npm run smoke:mvp-auth.',
    },
    null,
    2
  )
);

if (!checks.hasSupabaseUrl || !checks.hasPublishableKey || !checks.publicCatalogReadable) {
  process.exit(1);
}

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
