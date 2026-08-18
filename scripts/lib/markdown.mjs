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
const URL_SAFE_CHAR_RE = /[A-Za-z0-9/:.\-_#?=&]/;

// Escape a URL for use inside `href="..."`. This *enforces* the allow-list
// (rather than merely deciding whether to HTML-escape): any character
// outside `A-Za-z0-9 / : . - _ # ? = &` is percent-encoded byte-by-byte
// (UTF-8), not passed through -- so something like `**evil**`, a quote, or
// an angle bracket in a URL can never break out of the attribute. Note:
// this only sanitizes characters, not URL *scheme* -- e.g. `javascript:`
// still passes the char allow-list. Scheme-filtering is intentionally out
// of scope here (single-author site, per the task brief).
//
// The allow-list intentionally permits a literal `&` (needed for
// multi-param query strings); it is HTML-escaped to `&amp;` in the final
// step below so the attribute stays valid HTML. This function must be
// called with the RAW (pre-escapeHtml) url -- see the extraction order in
// renderInline -- otherwise a url's `&` would already be `&amp;` by the
// time this runs and get double-escaped to `&amp;amp;`.
function escapeUrl(url) {
  let safe = '';
  for (const ch of String(url)) {
    if (URL_SAFE_CHAR_RE.test(ch)) {
      safe += ch;
    } else {
      for (const byte of Buffer.from(ch, 'utf8')) {
        safe += '%' + byte.toString(16).toUpperCase().padStart(2, '0');
      }
    }
  }
  return escapeHtml(safe);
}

// Sentinels used to stash `code` spans and `[text](url)` links out of the
// way of the later escapeHtml/bold/italic passes, built via fromCharCode
// (rather than a literal escape in source) to avoid any accidental
// mangling of a raw control character. U+E000/U+E001 are in the Unicode
// Private Use Area: they contain none of the HTML-special, `*`, `[`, `]`,
// `(`, `)` characters that the passes below look for, so they survive
// escapeHtml and every later regex untouched, and they cannot occur in
// real Markdown source -- so the digits wrapped between a pair of
// sentinels can never collide with ordinary numbers in the surrounding
// text.
const CODE_PLACEHOLDER_MARK = String.fromCharCode(0xe000);
const LINK_PLACEHOLDER_MARK = String.fromCharCode(0xe001);
const CODE_PLACEHOLDER_RE = new RegExp(
  CODE_PLACEHOLDER_MARK + '(\\d+)' + CODE_PLACEHOLDER_MARK,
  'g'
);
const LINK_PLACEHOLDER_RE = new RegExp(
  LINK_PLACEHOLDER_MARK + '(\\d+)' + LINK_PLACEHOLDER_MARK,
  'g'
);

// Single seam for text-bearing constructs (headings, paragraphs, list
// items, blockquote text, table cells). Applies inline spans -- code,
// links, bold, italic -- always escaping surrounding text first so raw
// HTML in the source can never leak through.
//
// Order matters: code spans AND links are both extracted to placeholders
// first, against the RAW (pre-escapeHtml) text -- their contents
// (code) / text+url (links) are escaped right there and never
// re-processed. Only after that does the generic escapeHtml pass run
// over what's left, followed by bold, then italic, then both sets of
// placeholders are restored (links first, then code -- order between
// those two doesn't matter since neither's replacement text can contain
// the other's sentinel).
//
// Links must be extracted from raw text (not after the generic
// escapeHtml pass) for two reasons: (1) so a url's `&` isn't already
// `&amp;` by the time escapeUrl sees it (which would double-escape to
// `&amp;amp;`), and (2) so link text/url content is fully insulated from
// the later bold/italic regexes the same way code spans are.
function renderInline(text) {
  const codeSpans = [];
  const linkSpans = [];

  // 1. Extract `code` spans into placeholders. Contents are escaped now
  // and never touched again by the passes below.
  let withPlaceholders = String(text).replace(/`([^`]+)`/g, (_, code) => {
    const idx = codeSpans.push(escapeHtml(code)) - 1;
    return CODE_PLACEHOLDER_MARK + idx + CODE_PLACEHOLDER_MARK;
  });

  // 2. Extract [text](url) links into placeholders, still against raw
  // text (code spans are already opaque placeholders at this point, but
  // nothing else has been escaped yet). Both the link text and the url
  // are finalized here.
  withPlaceholders = withPlaceholders.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, linkText, url) => {
    const html = `<a href="${escapeUrl(url)}">${escapeHtml(linkText)}</a>`;
    const idx = linkSpans.push(html) - 1;
    return LINK_PLACEHOLDER_MARK + idx + LINK_PLACEHOLDER_MARK;
  });

  // 3. Escape everything else (the surrounding text, including any
  // literal HTML that was typed) before injecting any tags.
  let escaped = escapeHtml(withPlaceholders);

  // 4. Bold: **text**
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // 5. Italic: *text*
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // 6. Restore link placeholders.
  escaped = escaped.replace(LINK_PLACEHOLDER_RE, (_, idx) => linkSpans[Number(idx)]);

  // 7. Restore code placeholders.
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
