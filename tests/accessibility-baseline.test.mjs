import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const navigation = readFileSync(new URL('../src/components/Navigation.tsx', import.meta.url), 'utf8');
const languageToggle = readFileSync(new URL('../src/components/LanguageToggle.tsx', import.meta.url), 'utf8');
const contactForm = readFileSync(new URL('../src/components/ContactForm.tsx', import.meta.url), 'utf8');
const enMessages = readFileSync(new URL('../messages/en.json', import.meta.url), 'utf8');
const zhMessages = readFileSync(new URL('../messages/zh.json', import.meta.url), 'utf8');

test('mobile navigation exposes expanded state and menu relationship', () => {
  assert.match(navigation, /aria-controls="mobile-navigation"/);
  assert.match(navigation, /aria-expanded=\{mobileMenuOpen\}/);
  assert.match(navigation, /id="mobile-navigation"/);
  assert.match(navigation, /t\('nav\.openMenu'\)/);
  assert.match(navigation, /t\('nav\.closeMenu'\)/);
});

test('language toggle has localized accessible text and visible focus state', () => {
  assert.match(languageToggle, /useTranslations\('nav'\)/);
  assert.match(languageToggle, /aria-label=\{t\('switchLanguage'\)\}/);
  assert.match(languageToggle, /focus-visible:ring-2/);
});

test('contact form announces pending and result state accessibly', () => {
  assert.match(contactForm, /aria-busy=\{pending\}/);
  assert.match(contactForm, /role=\{status === 'error' \? 'alert' : 'status'\}/);
  assert.match(contactForm, /aria-live="polite"/);
});

test('navigation accessibility labels are localized', () => {
  for (const messages of [enMessages, zhMessages]) {
    assert.match(messages, /"openMenu"/);
    assert.match(messages, /"closeMenu"/);
    assert.match(messages, /"switchLanguage"/);
  }
});
