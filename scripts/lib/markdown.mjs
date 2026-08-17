// Zero-dependency block-level Markdown -> HTML renderer.
//
// This module implements BLOCK constructs: headings, paragraphs,
// unordered/ordered lists (one level of nesting), blockquotes, fenced code
// blocks, and GFM tables. `renderInline` (below) implements INLINE spans
// (bold, italic, code, links) and is the single seam that every
// text-bearing construct routes through -- except fenced code blocks,
// which stay verbatim/escaped and are never inline-processed.

const FENCE_RE = /^\s*```/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const BLOCKQUOTE_RE = /^>\s?(.*)$/;
const TABLE_ROW_RE = /^\s*\|.*\|\s*$/;
const OL_TOP_RE = /^\d+\.\s+(.*)$/;
const UL_TOP_RE = /^-\s+(.*)$/;
const OL_NESTED_RE = /^ {2}\d+\.\s+(.*)$/;
const UL_NESTED_RE = /^ {2}-\s+(.*)$/;

/** Escape the characters that would otherwise be interpreted as HTML. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Allow-list of characters permitted unescaped in a link URL.
const URL_SAFE_RE = /^[A-Za-z0-9/:.\-_#?=&]*$/;

/** Escape a URL to a small allow-list of safe characters. */
function escapeUrl(url) {
  return URL_SAFE_RE.test(url) ? url : escapeHtml(url);
}

// Sentinel used to stash `code` spans out of the way of the later
// link/bold/italic passes, built via fromCharCode (rather than a literal
// escape in source) to avoid any accidental mangling of a raw control
// character. U+E000 is in the Unicode Private Use Area: it contains none
// of the HTML-special, `*`, `[`, `]`, `(`, `)` characters that the passes
// below look for, so it survives escapeHtml and every later regex
// untouched, and it cannot occur in real Markdown source -- so the digits
// wrapped between two sentinels can never collide with ordinary numbers
// in the surrounding text.
const CODE_PLACEHOLDER_MARK = String.fromCharCode(0xe000);
const CODE_PLACEHOLDER_RE = new RegExp(
  CODE_PLACEHOLDER_MARK + '(\\d+)' + CODE_PLACEHOLDER_MARK,
  'g'
);

// Single seam for text-bearing constructs (headings, paragraphs, list
// items, blockquote text, table cells). Applies inline spans -- code,
// links, bold, italic -- always escaping surrounding text first so raw
// HTML in the source can never leak through.
//
// Order matters: code spans are extracted to placeholders first (their
// contents are escaped and never re-processed), then links, then bold,
// then italic, then the code placeholders are restored. This keeps `code`
// contents immune to the later passes and avoids ** / * inside link text
// being mishandled before the link itself is recognized.
function renderInline(text) {
  const codeSpans = [];

  // 1. Extract `code` spans into placeholders. Contents are escaped now
  // and never touched again by the passes below.
  const withPlaceholders = String(text).replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeSpans.push(escapeHtml(code)) - 1;
    return CODE_PLACEHOLDER_MARK + idx + CODE_PLACEHOLDER_MARK;
  });

  // 2. Escape everything else (the surrounding text, including any
  // literal HTML that was typed) before injecting any tags.
  let escaped = escapeHtml(withPlaceholders);

  // 3. Links: [text](url). Text is already escaped (from step 2); url is
  // escaped via a small allow-list of safe characters.
  escaped = escaped.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, linkText, url) => {
    return `<a href="${escapeUrl(url)}">${linkText}</a>`;
  });

  // 4. Bold: **text**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 5. Italic: *text*
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 6. Restore code placeholders.
  escaped = escaped.replace(CODE_PLACEHOLDER_RE, (_, idx) => {
    return `<code>${codeSpans[Number(idx)]}</code>`;
  });

  return escaped;
}

function splitTableRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map((cell) => cell.trim());
}

function isTableDelimiterRow(line) {
  if (!TABLE_ROW_RE.test(line)) return false;
  const cells = splitTableRow(line);
  if (cells.length === 0) return false;
  return cells.every((cell) => /^:?-+:?$/.test(cell));
}

function parseList(lines, start, ordered) {
  const topRe = ordered ? OL_TOP_RE : UL_TOP_RE;
  const nestedRe = ordered ? OL_NESTED_RE : UL_NESTED_RE;
  const otherNestedRe = ordered ? UL_NESTED_RE : OL_NESTED_RE;
  const items = [];
  let i = start;

  while (i < lines.length && topRe.test(lines[i])) {
    const [, text] = topRe.exec(lines[i]);
    i++;

    // One level of nesting: contiguous lines indented by exactly two
    // spaces that themselves look like a list item (either marker style).
    const nestedLines = [];
    while (i < lines.length && (nestedRe.test(lines[i]) || otherNestedRe.test(lines[i]))) {
      nestedLines.push(lines[i].slice(2));
      i++;
    }

    let nestedHtml = '';
    if (nestedLines.length > 0) {
      const nestedBlocks = parseBlocks(nestedLines);
      nestedHtml = '\n' + nestedBlocks.map(renderBlock).join('\n');
    }

    items.push({ text, nestedHtml });
  }

  return { block: { type: ordered ? 'ol' : 'ul', items }, next: i };
}

/** Split the document into a flat list of block descriptors. */
function parseBlocks(lines) {
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Fenced code block: verbatim content, HTML-escaped, no inline pass.
    // Any language hint after the opening ``` (e.g. ```js) is intentionally
    // dropped for now -- no <code class="language-..."> is emitted.
    if (FENCE_RE.test(line)) {
      i++;
      const codeLines = [];
      while (i < lines.length && !FENCE_RE.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // consume closing fence
      blocks.push({ type: 'code', lines: codeLines });
      continue;
    }

    // GFM table: a header row followed by a delimiter row.
    if (
      TABLE_ROW_RE.test(line) &&
      i + 1 < lines.length &&
      isTableDelimiterRow(lines[i + 1])
    ) {
      const header = splitTableRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && TABLE_ROW_RE.test(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    // Blockquote: strip the leading "> " from contiguous quoted lines and
    // recursively parse the remainder as its own block sequence.
    if (BLOCKQUOTE_RE.test(line)) {
      const bqLines = [];
      while (i < lines.length && BLOCKQUOTE_RE.test(lines[i])) {
        bqLines.push(lines[i].replace(BLOCKQUOTE_RE, '$1'));
        i++;
      }
      blocks.push({ type: 'blockquote', inner: parseBlocks(bqLines) });
      continue;
    }

    // Heading: 1-6 '#' followed by whitespace.
    const headingMatch = HEADING_RE.exec(line);
    if (headingMatch) {
      i++;
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      continue;
    }

    // Ordered list.
    if (OL_TOP_RE.test(line)) {
      const { block, next } = parseList(lines, i, true);
      blocks.push(block);
      i = next;
      continue;
    }

    // Unordered list.
    if (UL_TOP_RE.test(line)) {
      const { block, next } = parseList(lines, i, false);
      blocks.push(block);
      i = next;
      continue;
    }

    // Paragraph: contiguous non-blank lines that don't start another block.
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !FENCE_RE.test(lines[i]) &&
      !BLOCKQUOTE_RE.test(lines[i]) &&
      !HEADING_RE.test(lines[i]) &&
      !OL_TOP_RE.test(lines[i]) &&
      !UL_TOP_RE.test(lines[i]) &&
      !(TABLE_ROW_RE.test(lines[i]) && i + 1 < lines.length && isTableDelimiterRow(lines[i + 1]))
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', text: paraLines.join(' ') });
  }

  return blocks;
}

function renderBlock(block) {
  switch (block.type) {
    case 'heading':
      return `<h${block.level}>${renderInline(block.text)}</h${block.level}>`;

    case 'paragraph':
      return `<p>${renderInline(block.text)}</p>`;

    case 'code':
      return `<pre><code>${escapeHtml(block.lines.join('\n'))}\n</code></pre>`;

    case 'blockquote': {
      const inner = block.inner.map(renderBlock).join('\n');
      return `<blockquote>\n${inner}\n</blockquote>`;
    }

    case 'ul':
    case 'ol': {
      const itemsHtml = block.items
        .map((item) => `  <li>${renderInline(item.text)}${item.nestedHtml}</li>`)
        .join('\n');
      return `<${block.type}>\n${itemsHtml}\n</${block.type}>`;
    }

    case 'table': {
      const theadCells = block.header.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
      const bodyRows = block.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
        .join('');
      return `<table><thead><tr>${theadCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    }

    default:
      return '';
  }
}

export function renderMarkdown(md) {
  const lines = String(md).replace(/\r\n/g, '\n').split('\n');
  const blocks = parseBlocks(lines);
  return blocks.map(renderBlock).join('\n') + '\n';
}
