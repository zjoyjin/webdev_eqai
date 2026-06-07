import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

loadLocalEnv('.env.local');

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  fail('Supabase URL and publishable key are required for contact smoke.');
}

const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

const marker = `MVP contact smoke ${new Date().toISOString()}`;
const { error: insertError } = await supabase.from('contact_submissions').insert({
  name: 'MVP Contact Smoke',
  email: 'mvp-contact-smoke@eqaiglobal.test',
  inquiry_type: 'review_feedback',
  interested_category: 'general',
  audience_type: 'reviewer',
  subject: marker,
  message: 'Automated MVP smoke test verifying public contact submission insert.',
  consent_contact: true,
  source_locale: 'en',
  user_agent: 'tests/smoke-contact.mjs',
});

if (insertError) {
  fail(`Contact smoke insert failed: ${insertError.message}`);
}

const { data: publicRows, error: readError } = await supabase
  .from('contact_submissions')
  .select('id,subject')
  .eq('subject', marker);

if (!readError && Array.isArray(publicRows) && publicRows.length > 0) {
  fail('Contact smoke failed: public client can read submitted contact rows.');
}

console.log(
  JSON.stringify(
    {
      ok: true,
      inserted: true,
      publicReadBlocked: Boolean(readError) || (Array.isArray(publicRows) && publicRows.length === 0),
      publicReadError: readError?.message ?? null,
      subject: marker,
    },
    null,
    2
  )
);

function fail(message) {
  console.error(message);
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
