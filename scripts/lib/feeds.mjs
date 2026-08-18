// Feed + discovery builders: rss.xml, atom.xml, feed.json, sitemap.xml,
// llms.txt. Ported from scripts/build-publisher-files.mjs (escape/date/
// envelope logic) but driven by generic `posts` input instead of a
// hardcoded page list, so callers decide which pages count as articles
// (index pages and /thesis/ are simply never passed in).
//
// Post shape: { title, description, path, date }. `path` is site-relative
// (e.g. "/research/a/"); `date` is a full ISO date ("YYYY-MM-DD" or a full
// timestamp) and is used to sort newest-first and to derive RFC-822 /
// ISO-8601 timestamps for each feed format.

import { siteUrl } from './config.mjs';

const SITE_TITLE = 'stayfresh';
const SITE_DESCRIPTION =
  'Static archive of workflow research and patterns for AI-assisted development.';

export function xmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function isoDate(value) {
  return value.length === 10 ? value + 'T00:00:00Z' : value;
}

function absoluteUrl(pagePath) {
  return siteUrl + pagePath;
}

// Newest first, by full ISO date. Does not mutate the input array.
function sortedNewestFirst(posts) {
  return [...posts].sort((a, b) => isoDate(b.date).localeCompare(isoDate(a.date)));
}

/** RSS 2.0 feed for `posts` (article entries only), newest first. */
export function rss(posts) {
  const items = sortedNewestFirst(posts);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    `    <title>${xmlEscape(SITE_TITLE)}</title>`,
    `    <link>${xmlEscape(siteUrl + '/')}</link>`,
    `    <description>${xmlEscape(SITE_DESCRIPTION)}</description>`,
    '    <language>en-us</language>',
  ];
  if (items.length > 0) {
    lines.push(
      `    <lastBuildDate>${new Date(isoDate(items[0].date)).toUTCString()}</lastBuildDate>`
    );
  }
  for (const item of items) {
    lines.push('    <item>');
    lines.push(`      <title>${xmlEscape(item.title)}</title>`);
    lines.push(`      <link>${xmlEscape(absoluteUrl(item.path))}</link>`);
    lines.push(`      <guid>${xmlEscape(absoluteUrl(item.path))}</guid>`);
    lines.push(`      <pubDate>${new Date(isoDate(item.date)).toUTCString()}</pubDate>`);
    lines.push(`      <description>${xmlEscape(item.description)}</description>`);
    lines.push('    </item>');
  }
  lines.push('  </channel>');
  lines.push('</rss>');
  return lines.join('\n') + '\n';
}

/** Atom 1.0 feed for `posts` (article entries only), newest first. */
export function atom(posts) {
  const items = sortedNewestFirst(posts);
  const lines = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${xmlEscape(SITE_TITLE)}</title>`,
    `  <subtitle>${xmlEscape(SITE_DESCRIPTION)}</subtitle>`,
    `  <link href="${xmlEscape(siteUrl + '/atom.xml')}" rel="self"/>`,
    `  <link href="${xmlEscape(siteUrl + '/')}"/>`,
  ];
  if (items.length > 0) {
    lines.push(`  <updated>${xmlEscape(isoDate(items[0].date))}</updated>`);
  }
  lines.push(`  <id>${xmlEscape(siteUrl + '/')}</id>`);
  for (const item of items) {
    lines.push('  <entry>');
    lines.push(`    <title>${xmlEscape(item.title)}</title>`);
    lines.push(`    <link href="${xmlEscape(absoluteUrl(item.path))}"/>`);
    lines.push(`    <id>${xmlEscape(absoluteUrl(item.path))}</id>`);
    lines.push(`    <updated>${xmlEscape(isoDate(item.date))}</updated>`);
    lines.push(`    <summary>${xmlEscape(item.description)}</summary>`);
    lines.push('  </entry>');
  }
  lines.push('</feed>');
  return lines.join('\n') + '\n';
}

/** JSON Feed 1.1 object for `posts` (article entries only), newest first. */
export function jsonFeed(posts) {
  const items = sortedNewestFirst(posts);
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_TITLE,
    home_page_url: siteUrl + '/',
    feed_url: siteUrl + '/feed.json',
    description: SITE_DESCRIPTION,
    language: 'en-US',
    authors: [{ name: SITE_TITLE, url: siteUrl + '/' }],
    items: items.map((item) => ({
      id: absoluteUrl(item.path),
      url: absoluteUrl(item.path),
      title: item.title,
      summary: item.description,
      date_published: isoDate(item.date),
      date_modified: isoDate(item.date),
    })),
  };
}

/** XML sitemap listing `urls` (already-absolute URL strings), in order. */
export function sitemap(urls) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const url of urls) {
    lines.push('  <url>');
    lines.push(`    <loc>${xmlEscape(url)}</loc>`);
    lines.push('  </url>');
  }
  lines.push('</urlset>');
  return lines.join('\n') + '\n';
}

/** llms.txt body: a plain-markdown index of `posts`, newest first. */
export function llms(posts) {
  const items = sortedNewestFirst(posts);
  const lines = [
    `# ${SITE_TITLE}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    '## Posts',
    '',
  ];
  for (const item of items) {
    lines.push(`- [${item.title}](${absoluteUrl(item.path)}): ${item.description}`);
  }
  lines.push('');
  lines.push('## Feeds');
  lines.push('');
  lines.push(`- [RSS Feed](${siteUrl}/rss.xml): Recent site updates in RSS 2.0 format.`);
  lines.push(`- [Atom Feed](${siteUrl}/atom.xml): Recent site updates in Atom 1.0 format.`);
  lines.push(
    `- [JSON Feed](${siteUrl}/feed.json): Machine-readable feed for applications that prefer JSON.`
  );
  lines.push(`- [XML Sitemap](${siteUrl}/sitemap.xml): Full canonical URL inventory for crawlers.`);
  return lines.join('\n') + '\n';
}
