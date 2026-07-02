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
  let table: string[][] = [];
  let codeLines: string[] | null = null;
  let blockquote: string[] = [];

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

  const flushTable = () => {
    if (table.length === 0) return;
    const [header, ...rows] = table;
    const headerHtml = header.map((cell) => `<th>${renderInline(cell.trim())}</th>`).join('');
    const bodyHtml = rows
      .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell.trim())}</td>`).join('')}</tr>`)
      .join('');
    blocks.push(`<div class="overflow-x-auto"><table><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`);
    table = [];
  };

  const flushCode = () => {
    if (codeLines === null) return;
    blocks.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
    codeLines = null;
  };

  const flushBlockquote = () => {
    if (blockquote.length === 0) return;
    blocks.push(`<blockquote>${blockquote.map((line) => `<p>${renderInline(line)}</p>`).join('')}</blockquote>`);
    blockquote = [];
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
    flushTable();
    flushCode();
    flushBlockquote();
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushAll();
      continue;
    }

    if (line.startsWith('```')) {
      if (codeLines) {
        flushCode();
      } else {
        flushAll();
        codeLines = [];
      }
      continue;
    }

    if (codeLines) {
      codeLines.push(rawLine);
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushAll();
      const level = Math.min(6, headingMatch[1].length + 1);
      blocks.push(`<h${level}>${renderInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    if (line.startsWith('>')) {
      flushParagraph();
      flushList();
      flushTable();
      blockquote.push(line.replace(/^>\s?/, ''));
      continue;
    }

    if (line.startsWith('|') && line.endsWith('|')) {
      flushParagraph();
      flushList();
      flushBlockquote();
      const cells = line
        .slice(1, -1)
        .split('|')
        .map((cell) => cell.trim());
      const isDivider = cells.every((cell) => /^:?-{3,}:?$/.test(cell));
      if (isDivider) {
        continue;
      }
      table.push(cells);
      continue;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      flushBlockquote();
      flushTable();
      listItems.push(line.slice(2));
      continue;
    }

    flushList();
    flushTable();
    flushBlockquote();
    paragraph.push(line);
  }

  flushAll();
  return blocks.join('');
}

function renderInline(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
