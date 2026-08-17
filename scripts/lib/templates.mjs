// House HTML templates -- the CRT reading theme from
// prototypes/reading-theme-proto.html, wired up to real post data.
//
// Every generated page shares: the fixed <head> (canonical, three feed
// links, webmention, pingback, title suffix, stylesheet), the terminal
// header/nav chrome, and a footer h-card. Article pages additionally carry
// full microformats2 (h-entry, p-name, dt-published, e-content, hidden
// p-author h-card, tag list); index pages carry h-feed / article-list.
//
// All emitted prose is lowercase and no em-dashes are ever written here
// (the surrounding chrome text is authored lowercase by hand; article body
// text arrives pre-rendered from markdown.mjs, which already guarantees
// no em-dash output).

import { escapeHtml } from './markdown.mjs';
import { siteUrl, ga4, searchConsole } from './config.mjs';

const GITHUB_URL = 'https://github.com/Evoke4350';
const GITHUB_REPO_URL = 'https://github.com/Evoke4350/stayfresh.dev';
const MAILTO = 'mailto:nathanib@pm.me';

const NAV_LINKS = [
  { href: '/home/', label: 'home' },
  { href: '/workflows/', label: 'workflows' },
  { href: '/research/', label: 'research' },
  { href: GITHUB_REPO_URL, label: 'github' },
];

/** Shared terminal nav: home / workflows / research / github. No thesis. */
export function nav() {
  const links = NAV_LINKS
    .map((l) => `    <a href="${l.href}">${l.label}</a>`)
    .join('\n');
  return `<nav>\n${links}\n  </nav>`;
}

/**
 * Shared <head>. `opts`:
 *   - path (required): site-relative path, e.g. "/research/reward-hacking/"
 *   - title (required): page title, prefixed onto " - stayfresh"
 *   - description (optional): meta description
 *   - relMe (optional, default false): emit rel=me (github + mailto);
 *     reserved for the homepage and splash per the IndieWeb identity rule.
 */
export function head({ path, title, description, relMe = false }) {
  const canonical = `${siteUrl}${path}`;
  const lines = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
  ];
  if (description) {
    lines.push(`<meta name="description" content="${escapeHtml(description)}">`);
  }
  lines.push(`<link rel="canonical" href="${canonical}">`);
  lines.push(`<link rel="alternate" type="application/rss+xml" title="stayfresh rss" href="${siteUrl}/rss.xml">`);
  lines.push(`<link rel="alternate" type="application/atom+xml" title="stayfresh atom" href="${siteUrl}/atom.xml">`);
  lines.push(`<link rel="alternate" type="application/feed+json" title="stayfresh json feed" href="${siteUrl}/feed.json">`);
  lines.push('<link rel="webmention" href="https://webmention.io/stayfresh.dev/webmention">');
  lines.push('<link rel="pingback" href="https://webmention.io/stayfresh.dev/xmlrpc">');
  if (relMe) {
    lines.push(`<link rel="me" href="${GITHUB_URL}">`);
    lines.push(`<link rel="me" href="${MAILTO}">`);
  }
  lines.push(`<title>${escapeHtml(title)} - stayfresh</title>`);
  lines.push('<link rel="stylesheet" href="/style.css">');

  // GA4 / Search Console: emitted only when scripts/lib/config.mjs carries
  // a real id. Both are empty strings today, so neither line is written --
  // keeps tests and fixtures clean until Task 18 supplies real values.
  if (ga4) {
    lines.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"></script>`);
    lines.push(
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4}');</script>`
    );
  }
  if (searchConsole) {
    lines.push(`<meta name="google-site-verification" content="${searchConsole}">`);
  }

  return `<head>\n  ${lines.join('\n  ')}\n</head>`;
}

/** Terminal header brand + tagline. Neutral, no doctrine framing. */
function header() {
  return `<header>
    <div class="brand">stayfresh<span class="cur"></span></div>
    <div class="tag">field notes // workflows // research</div>
  </header>`;
}

/** Footer h-card, present on every page. rel=me only when relMe is set. */
function footer({ relMe = false } = {}) {
  const me = relMe ? ' rel="me"' : '';
  return `<footer class="h-card">
    <a class="p-name u-url" href="${siteUrl}/">stayfresh</a>
    &middot;
    <a class="u-email"${me} href="${MAILTO}">nathanib@pm.me</a>
    &middot;
    <a${me} href="${GITHUB_URL}">github</a>
    &middot;
    mit license
  </footer>`;
}

function docShell({ path, title, description, relMe, bodyInner }) {
  return `<!DOCTYPE html>
<html lang="en">
${head({ path, title, description, relMe })}
<body>
  ${header()}

  ${nav()}

${bodyInner}

  ${footer({ relMe })}
</body>
</html>
`;
}

function tagChips(tags) {
  if (!tags || tags.length === 0) return '';
  const chips = tags.map((t) => `      <a href="/tags/${t}/">${t}</a>`).join('\n');
  return `\n\n    <div class="tags">\n${chips}\n    </div>`;
}

/** One <li class="h-entry"> row for an .article-list, shared by every index. */
function articleListItem(post) {
  const month = post.date.slice(0, 7);
  return `      <li class="h-entry">
        <span class="date"><time class="dt-published" datetime="${post.date}">${month}</time></span>
        <a class="title u-url p-name" href="${post.path}">${escapeHtml(post.title)}</a>
        <p class="p-summary">${escapeHtml(post.description)}</p>
      </li>`;
}

function groupByYearDesc(posts) {
  const years = new Map();
  for (const post of posts) {
    const year = post.date.slice(0, 4);
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(post);
  }
  return [...years.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
}

const hiddenAuthor = () =>
  `    <a class="p-author h-card" href="${siteUrl}/home/" hidden>stayfresh</a>`;

/**
 * Full article page. post = { title, description, section, slug, date,
 * tags, path, bodyHtml }.
 */
export function articlePage(post) {
  const { title, description, date, tags, path, bodyHtml } = post;
  const month = date.slice(0, 7);

  const bodyInner = `  <main class="h-entry">
    <p class="date"><time class="dt-published" datetime="${date}">${month}</time></p>
    <h2 class="p-name">${escapeHtml(title)}</h2>

    <div class="e-content">
${bodyHtml}
    </div>${tagChips(tags)}

${hiddenAuthor()}
  </main>`;

  return docShell({ path, title, description, bodyInner });
}

/** Section index (workflows/research): h-feed grouped by descending year. */
export function sectionIndex(section, posts) {
  const path = `/${section}/`;
  const years = groupByYearDesc(posts);
  const groups = years
    .map(
      ([year, yearPosts]) => `    <div class="yr">${year}</div>
    <ul class="article-list">
${yearPosts.map(articleListItem).join('\n')}
    </ul>`
    )
    .join('\n\n');

  const bodyInner = `  <main class="h-feed">
${hiddenAuthor()}
    <h2>${section}</h2>

${groups}
  </main>`;

  return docShell({
    path,
    title: section,
    description: `${section} notes.`,
    bodyInner,
  });
}

/** One tag's page: every post carrying that tag, newest first. */
export function tagPage(tag, posts) {
  const path = `/tags/${tag}/`;

  const bodyInner = `  <main class="h-feed">
${hiddenAuthor()}
    <h2>${tag}</h2>

    <ul class="article-list">
${posts.map(articleListItem).join('\n')}
    </ul>
  </main>`;

  return docShell({
    path,
    title: tag,
    description: `posts tagged ${tag}.`,
    bodyInner,
  });
}

/** All tags with post counts, e.g. { rubrics: 3, evaluation: 1 }. */
export function tagsIndex(tagCounts) {
  const path = '/tags/';
  const entries = Object.entries(tagCounts).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );
  const chips = entries
    .map(([tag, count]) => `      <a href="/tags/${tag}/">${tag} (${count})</a>`)
    .join('\n');

  const bodyInner = `  <main class="h-feed">
${hiddenAuthor()}
    <h2>tags</h2>

    <div class="tags">
${chips}
    </div>
  </main>`;

  return docShell({ path, title: 'tags', description: 'all tags.', bodyInner });
}

/** Chronological blog index: every non-draft post, newest first. */
export function blogIndex(posts) {
  const path = '/blog/';

  const bodyInner = `  <main class="h-feed">
${hiddenAuthor()}
    <h2>blog</h2>

    <ul class="article-list">
${posts.map(articleListItem).join('\n')}
    </ul>
  </main>`;

  return docShell({
    path,
    title: 'blog',
    description: 'every post, newest first.',
    bodyInner,
  });
}

/**
 * Relocated homepage (/home/): full rel=me + representative h-card, one
 * h-feed section per entry in `sections`. Each section is
 * { name, intro, posts }.
 */
export function homePage(sections) {
  const path = '/home/';

  const blocks = sections
    .map(
      (s) => `    <h2>${s.name}</h2>
    <p>${escapeHtml(s.intro)}</p>
    <ul class="article-list">
${s.posts.map(articleListItem).join('\n')}
    </ul>`
    )
    .join('\n\n');

  const bodyInner = `  <main class="h-feed">
${hiddenAuthor()}
${blocks}
  </main>`;

  return docShell({
    path,
    title: 'home',
    description: 'field notes on ai-assisted development.',
    relMe: true,
    bodyInner,
  });
}
