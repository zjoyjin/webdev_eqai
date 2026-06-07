import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const chatBox = readFileSync(new URL('../src/components/ChatBox.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/app/[locale]/layout.tsx', import.meta.url), 'utf8');
const homePage = readFileSync(new URL('../src/app/[locale]/page.tsx', import.meta.url), 'utf8');

test('floating chat starts collapsed so it does not obscure review pages', () => {
  assert.match(chatBox, /useState\(variant === 'inline'\)/);
  assert.match(layout, /<ChatBox \/>/);
  assert.match(chatBox, /aria-label=\{isOpen \? 'Close chat' : 'Open assessment guide'\}/);
});

test('inline homepage chat remains visible in the page flow', () => {
  assert.match(homePage, /<ChatBox variant="inline" \/>/);
});
