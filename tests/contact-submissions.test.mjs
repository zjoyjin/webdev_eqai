import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const form = readFileSync(new URL('../src/components/ContactForm.tsx', import.meta.url), 'utf8');
const contactPage = readFileSync(new URL('../src/app/[locale]/contact/page.tsx', import.meta.url), 'utf8');
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');

test('contact form works without a server API', () => {
  assert.match(contactPage, /<ContactForm locale=\{locale\} \/>/);
  assert.doesNotMatch(form, /fetch\('\/api\/contact'/);
  assert.match(form, /window\.localStorage\.setItem/);
  assert.match(form, /eqai\.static\.contactSubmissions\.v1/);
  assert.match(form, /createdAt: new Date\(\)\.toISOString\(\)/);
});

test('contact form keeps deterministic fields for local review', () => {
  assert.match(form, /name="inquiryType"/);
  assert.match(form, /name="interestedCategory"/);
  assert.match(form, /name="audienceType"/);
  assert.match(form, /name="consentContact"/);
  assert.match(form, /t\('success'\)/);
  assert.doesNotMatch(form, /alert\(/);
  assert.doesNotMatch(form, /not yet implemented/i);
});

test('contact form has English and Chinese static submission copy', () => {
  assert.match(enMessages, /saved in this browser/);
  assert.match(zhMessages, /保存在当前浏览器/);

  for (const messages of [enMessages, zhMessages]) {
    assert.match(messages, /"inquiryType"/);
    assert.match(messages, /"interestedCategory"/);
    assert.match(messages, /"audienceType"/);
    assert.match(messages, /"consent"/);
    assert.match(messages, /"success"/);
    assert.match(messages, /"review_feedback"/);
  }
});
