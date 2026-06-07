import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const sql = readFileSync(new URL('../backend/ingestion/contact_submissions.sql', import.meta.url), 'utf8');
const route = readFileSync(new URL('../src/app/api/contact/route.ts', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/components/ContactForm.tsx', import.meta.url), 'utf8');
const contactPage = readFileSync(new URL('../src/app/[locale]/contact/page.tsx', import.meta.url), 'utf8');
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');

test('contact submissions SQL creates an insert-only public intake table', () => {
  assert.match(sql, /CREATE TABLE IF NOT EXISTS contact_submissions/);
  assert.match(sql, /ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY/);
  assert.match(sql, /REVOKE ALL ON contact_submissions FROM anon, authenticated/);
  assert.match(sql, /GRANT INSERT ON contact_submissions TO anon, authenticated/);
  assert.doesNotMatch(sql, /GRANT SELECT ON contact_submissions TO anon/);
  assert.doesNotMatch(sql, /GRANT SELECT ON contact_submissions TO authenticated/);
  assert.match(sql, /contact_submissions_public_insert/);
  assert.match(sql, /WITH CHECK \(\s*consent_contact = true/);
});

test('contact API validates deterministic fields before inserting', () => {
  assert.match(route, /const INQUIRY_TYPES = \[/);
  assert.match(route, /const INTERESTED_CATEGORIES = \['general', 'work', 'personal', 'kid', 'pet'\]/);
  assert.match(route, /const AUDIENCE_TYPES = \[/);
  assert.match(route, /payload\.consentContact !== true/);
  assert.match(route, /\.from\('contact_submissions'\)\.insert/);
  assert.match(route, /source_locale: validation\.data\.sourceLocale/);
  assert.match(route, /user-agent/);
});

test('contact form posts to the API and exposes consent/category fields', () => {
  assert.match(contactPage, /<ContactForm locale=\{locale\} \/>/);
  assert.match(form, /fetch\('\/api\/contact'/);
  assert.match(form, /name="inquiryType"/);
  assert.match(form, /name="interestedCategory"/);
  assert.match(form, /name="audienceType"/);
  assert.match(form, /name="consentContact"/);
  assert.match(form, /t\('success'\)/);
  assert.doesNotMatch(form, /alert\(/);
  assert.doesNotMatch(form, /not yet implemented/i);
});

test('contact form has English and Chinese submission copy', () => {
  for (const messages of [enMessages, zhMessages]) {
    assert.match(messages, /"inquiryType"/);
    assert.match(messages, /"interestedCategory"/);
    assert.match(messages, /"audienceType"/);
    assert.match(messages, /"consent"/);
    assert.match(messages, /"success"/);
    assert.match(messages, /"review_feedback"/);
  }
});
