import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

export type DevlogEntry = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  contentHtml: string;
};

const DEVLOG_DIR = path.join(process.cwd(), 'docs', 'devlog');
let cachedEntries: DevlogEntry[] | null = null;

export function getDevlogEntries(): DevlogEntry[] {
  cachedEntries ??= loadDevlogEntries();
  return cachedEntries;
}

export function getDevlogEntry(slug: string): DevlogEntry | undefined {
  return getDevlogEntries().find((entry) => entry.slug === slug);
}

function loadDevlogEntries(): DevlogEntry[] {
  return readdirSync(DEVLOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => parseDevlogFile(path.join(DEVLOG_DIR, entry.name)))
    .sort((left, right) => right.date.localeCompare(left.date) || right.slug.localeCompare(left.slug));
}

function parseDevlogFile(filePath: string): DevlogEntry {
  const source = readFileSync(filePath, 'utf8');
  const { frontmatter, body } = splitFrontmatter(source, filePath);
  const slug = requireFrontmatter(frontmatter, 'slug', filePath);
  const title = requireFrontmatter(frontmatter, 'title', filePath);
  const date = requireFrontmatter(frontmatter, 'date', filePath);
  const excerpt = requireFrontmatter(frontmatter, 'excerpt', filePath);

  return {
    slug,
    title,
    date,
    excerpt,
    contentHtml: markdownToHtml(body),
  };
}

function splitFrontmatter(source: string, filePath: string): { frontmatter: string; body: string } {
  const normalized = source.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    throw new Error(`Devlog file missing frontmatter: ${filePath}`);
  }

  const endIndex = normalized.indexOf('\n---\n', 4);
  if (endIndex < 0) {
    throw new Error(`Devlog file missing closing frontmatter fence: ${filePath}`);
  }

  return {
    frontmatter: normalized.slice(4, endIndex),
    body: normalized.slice(endIndex + 5).trim(),
  };
}

function requireFrontmatter(frontmatter: string, key: string, filePath: string): string {
  const pattern = new RegExp(`^${key}:\\s*(.+)$`, 'm');
  const match = frontmatter.match(pattern);
  if (!match) {
    throw new Error(`Devlog file missing frontmatter key "${key}": ${filePath}`);
  }
  return match[1].trim().replace(/^["']|["']$/g, '');
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push(`<ul>${listItems.map((item) => `<li>${renderInline(item)}</li>`).join('')}</ul>`);
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = Math.min(6, headingMatch[1].length + 1);
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      listItems.push(line.slice(2));
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks.join('');
}

function renderInline(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
