import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8');
const form = readFileSync(new URL('../src/components/ContactForm.tsx', import.meta.url), 'utf8');
const privacyPage = readFileSync(new URL('../src/app/[locale]/privacy/page.tsx', import.meta.url), 'utf8');
const termsPage = readFileSync(new URL('../src/app/[locale]/terms/page.tsx', import.meta.url), 'utf8');
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');

test('footer links to real privacy and terms routes', () => {
  assert.match(footer, /href=\{`\/\$\{locale\}\/privacy`\}/);
  assert.match(footer, /href=\{`\/\$\{locale\}\/terms`\}/);
  assert.match(footer, /t\('nav\.privacy'\)/);
  assert.match(footer, /t\('nav\.terms'\)/);
  assert.doesNotMatch(footer, /Privacy Policy\s*<\/Link>[\s\S]*href=\{`\/\$\{locale\}\/contact`\}/);
});

test('contact consent links to privacy and terms', () => {
  assert.match(form, /href=\{`\/\$\{locale\}\/privacy`\}/);
  assert.match(form, /href=\{`\/\$\{locale\}\/terms`\}/);
  assert.match(form, /t\('consentPrefix'\)/);
  assert.match(form, /t\('privacyPolicy'\)/);
  assert.match(form, /t\('termsOfService'\)/);
});

test('privacy and terms pages define service data boundaries', () => {
  assert.match(privacyPage, /contact form/);
  assert.match(privacyPage, /current browser/);
  assert.match(privacyPage, /not synchronized across devices/);
  assert.match(privacyPage, /not medical, clinical, emergency, or diagnostic support/);
  assert.match(termsPage, /No medical or diagnostic service/);
  assert.match(termsPage, /Results are not formal psychological assessments/);
  assert.match(termsPage, /contact form/);
  assert.match(termsPage, /Clearing browser data or switching devices/);
  assert.doesNotMatch(privacyPage, /MVP|demo/i);
  assert.doesNotMatch(termsPage, /MVP|demo/i);
});

test('privacy and terms labels are localized', () => {
  for (const messages of [enMessages, zhMessages]) {
    assert.match(messages, /"privacy"/);
    assert.match(messages, /"terms"/);
    assert.match(messages, /"consentPrefix"/);
    assert.match(messages, /"privacyPolicy"/);
    assert.match(messages, /"termsOfService"/);
  }
});
