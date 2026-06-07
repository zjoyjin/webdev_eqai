import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const reviewPage = readFileSync(new URL('../src/app/[locale]/review/page.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../src/components/Footer.tsx', import.meta.url), 'utf8');
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');
const readme = readFileSync(new URL('../README.md', import.meta.url), 'utf8');

test('review page documents the walkthrough and review scope', () => {
  assert.match(reviewPage, /External review pack/);
  assert.match(reviewPage, /Walkthrough path/);
  assert.match(reviewPage, /Verified capabilities/);
  assert.match(reviewPage, /Known limitations/);
  assert.match(reviewPage, /Open product questions/);
  assert.match(reviewPage, /Review assets/);
  assert.match(reviewPage, /MWI_DEMO/);
  assert.doesNotMatch(reviewPage, /\bMVP\b|\bdemo\b|test account|演示/i);
});

test('review page links to the core MVP routes', () => {
  assert.match(reviewPage, /\/\$\{locale\}\/assessments/);
  assert.match(reviewPage, /\/\$\{locale\}\/contact/);
  assert.match(reviewPage, /\/en\/assessments/);
  assert.match(reviewPage, /\/en\/assessments\/MWI_DEMO/);
  assert.match(reviewPage, /\/zh\/assessments\/MWI_DEMO/);
  assert.match(reviewPage, /\/zh\/me\/assessments/);
});

test('review route is discoverable without joining the primary navigation', () => {
  assert.match(footer, /href: `\/\$\{locale\}\/review`/);
  assert.match(footer, /t\('nav\.review'\)/);
  assert.doesNotMatch(readFileSync(new URL('../src/components/Navigation.tsx', import.meta.url), 'utf8'), /nav\.review/);
});

test('review route labels are localized and documented', () => {
  assert.match(enMessages, /"review": "Review Pack"/);
  assert.match(zhMessages, /"review": "评审包"/);
  assert.match(readme, /\/en\/review/);
  assert.match(readme, /External MVP review pack/);
});
