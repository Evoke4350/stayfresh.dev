// Build orchestrator: wires lib/frontmatter, lib/markdown, lib/templates,
// lib/feeds and lib/config together into a static site generator.
//
// Scans `contentDir` for `content/<section>/<slug>.md` (section is
// "research" or "workflows" -- there is no "thesis" section in the
// rebuilt site), parses front-matter + renders Markdown, skips drafts and
// any file whose basename starts with `_`, sorts the surviving posts by
// full ISO `date` descending, then renders and writes every surface under
// `outDir`.
//
// `node scripts/build.mjs` builds the real site in place. `node
// scripts/build.mjs --check` instead builds into a throwaway temp
// directory and asserts structural/validity invariants over the result,
// without ever touching the real site.

import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

import { parseFrontmatter } from './lib/frontmatter.mjs';
import { renderMarkdown } from './lib/markdown.mjs';
import {
  articlePage,
  sectionIndex,
  tagPage,
  tagsIndex,
  blogIndex,
  homePage,
} from './lib/templates.mjs';
import { rss, atom, jsonFeed, sitemap, llms } from './lib/feeds.mjs';
import { siteUrl } from './lib/config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The only two content sections in the rebuilt site. No "thesis".
const SECTIONS = ['research', 'workflows'];

/**
 * Scan `contentDir/<section>/*.md` for every section in SECTIONS, parsing
 * front-matter and rendering Markdown for each surviving post. Skips
 * drafts (`draft: true`) and any file whose basename starts with `_`.
 * Returns posts sorted by full ISO `date` descending.
 */
async function scanContent(contentDir) {
  const posts = [];

  for (const section of SECTIONS) {
    const sectionDir = path.join(contentDir, section);
    let entries;
    try {
      entries = await fs.readdir(sectionDir, { withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT') continue;
      throw err;
    }

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (!entry.name.endsWith('.md')) continue;
      if (entry.name.startsWith('_')) continue; // draft-by-filename convention

      const slug = entry.name.slice(0, -'.md'.length);
      const filePath = path.join(sectionDir, entry.name);
      const raw = await fs.readFile(filePath, 'utf8');
      const { data, body } = parseFrontmatter(raw);

      if (data.draft) continue;

      if (data.section !== section) {
        throw new Error(
          `${filePath}: frontmatter section "${data.section}" does not match its directory "${section}"`
        );
      }

      posts.push({
        title: data.title,
        description: data.description,
        section,
        slug,
        date: data.date,
        tags: data.tags,
        path: `/${section}/${slug}/`,
        bodyHtml: renderMarkdown(body),
      });
    }
  }

  // Full ISO date descending. Node's Array#sort is stable, so posts that
  // share a date keep their scan order.
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return posts;
}

/** Render every site surface for `posts` into a flat map of relPath -> content. */
function renderSurfaces(posts) {
  const files = new Map();

  const bySection = Object.fromEntries(SECTIONS.map((s) => [s, []]));
  for (const post of posts) bySection[post.section].push(post);

  // Article pages.
  for (const post of posts) {
    files.set(path.join(post.section, post.slug, 'index.html'), articlePage(post));
  }

  // Section indexes.
  for (const section of SECTIONS) {
    files.set(path.join(section, 'index.html'), sectionIndex(section, bySection[section]));
  }

  // Tag pages + tags listing.
  const tagMap = new Map(); // tag -> posts[], insertion order == first-seen order
  for (const post of posts) {
    for (const tag of post.tags) {
      if (!tagMap.has(tag)) tagMap.set(tag, []);
      tagMap.get(tag).push(post);
    }
  }
  for (const [tag, tagPosts] of tagMap) {
    files.set(path.join('tags', tag, 'index.html'), tagPage(tag, tagPosts));
  }
  const tagCounts = {};
  for (const [tag, tagPosts] of tagMap) tagCounts[tag] = tagPosts.length;
  files.set(path.join('tags', 'index.html'), tagsIndex(tagCounts));

  // Blog index (every post, chronological).
  files.set(path.join('blog', 'index.html'), blogIndex(posts));

  // Home page: one h-feed section per content section.
  files.set(
    path.join('home', 'index.html'),
    homePage(
      SECTIONS.map((section) => ({
        name: section,
        intro: `field notes on ${section}.`,
        posts: bySection[section],
      }))
    )
  );

  // Feeds + discovery. `feeds.mjs` posts are { title, description, path, date }.
  const feedPosts = posts.map(({ title, description, path: p, date }) => ({
    title,
    description,
    path: p,
    date,
  }));
  files.set('rss.xml', rss(feedPosts));
  files.set('atom.xml', atom(feedPosts));
  files.set('feed.json', JSON.stringify(jsonFeed(feedPosts), null, 2) + '\n');

  const surfacePaths = [
    '/',
    '/blog/',
    '/home/',
    '/tags/',
    ...SECTIONS.map((s) => `/${s}/`),
    ...posts.map((p) => p.path),
    ...[...tagMap.keys()].map((t) => `/tags/${t}/`),
  ];
  files.set('sitemap.xml', sitemap(surfacePaths.map((p) => siteUrl + p)));

  files.set('llms.txt', llms(feedPosts));

  return files;
}

/**
 * Scan `contentDir`, render every surface, and write it under `outDir`.
 * Returns `{ posts, written }` where `written` is the absolute path of
 * every file written.
 */
export async function buildSite({ contentDir, outDir }) {
  const posts = await scanContent(contentDir);
  const files = renderSurfaces(posts);

  const written = [];
  for (const [relPath, content] of files) {
    const fullPath = path.join(outDir, relPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content, 'utf8');
    written.push(fullPath);
  }

  return { posts, written };
}

// Minimal "is this well-formed XML" gut check: every opening tag has a
// matching closing tag, in the right order (self-closing tags are
// dropped first). Not a real parser -- a tag-balance assertion, which is
// enough to catch a broken template without a dependency.
function assertWellFormedXml(xml, label) {
  const stripped = xml
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<([a-zA-Z0-9:]+)(?:[^>]*?)\/>/g, ''); // drop self-closing tags

  const tagRe = /<\/?([a-zA-Z0-9:]+)[^>]*>/g;
  const stack = [];
  let match;
  while ((match = tagRe.exec(stripped))) {
    const isClosing = match[0][1] === '/';
    const name = match[1];
    if (isClosing) {
      const top = stack.pop();
      if (top !== name) {
        throw new Error(`${label}: mismatched tag </${name}> (expected </${top ?? 'nothing'}>)`);
      }
    } else {
      stack.push(name);
    }
  }
  if (stack.length !== 0) {
    throw new Error(`${label}: unclosed tag(s): ${stack.join(', ')}`);
  }
}

/** Structural + validity invariants asserted by `--check`. Throws on failure. */
async function validateBuild(outDir, posts) {
  const read = (relPath) => fs.readFile(path.join(outDir, relPath), 'utf8');

  for (const post of posts) {
    const html = await read(path.join(post.section, post.slug, 'index.html'));
    if (!html.includes('h-entry')) {
      throw new Error(`${post.path}: article page missing h-entry`);
    }
    const canonical = `<link rel="canonical" href="${siteUrl}${post.path}">`;
    if (!html.includes(canonical)) {
      throw new Error(`${post.path}: article page missing canonical link ${canonical}`);
    }
  }

  for (const section of SECTIONS) {
    const html = await read(path.join(section, 'index.html'));
    if (!html.includes('h-feed')) {
      throw new Error(`${section}/index.html: missing h-feed`);
    }
  }

  const blogHtml = await read(path.join('blog', 'index.html'));
  if (!blogHtml.includes('h-feed')) throw new Error('blog/index.html: missing h-feed');

  await read(path.join('tags', 'index.html'));
  await read(path.join('home', 'index.html'));

  const tags = new Set(posts.flatMap((p) => p.tags));
  for (const tag of tags) {
    await read(path.join('tags', tag, 'index.html'));
  }

  const rssXml = await read('rss.xml');
  assertWellFormedXml(rssXml, 'rss.xml');

  const atomXml = await read('atom.xml');
  assertWellFormedXml(atomXml, 'atom.xml');

  const sitemapXml = await read('sitemap.xml');
  assertWellFormedXml(sitemapXml, 'sitemap.xml');

  const feedJsonRaw = await read('feed.json');
  const feedJson = JSON.parse(feedJsonRaw); // throws if malformed
  if (feedJson.items.length !== posts.length) {
    throw new Error(
      `feed.json: expected ${posts.length} items, got ${feedJson.items.length}`
    );
  }

  const llmsTxt = await read('llms.txt');
  if (posts.length > 0 && llmsTxt.trim() === '') {
    throw new Error('llms.txt: expected non-empty output');
  }
}

/**
 * Build `contentDir` into a fresh throwaway temp directory, assert
 * structural/validity invariants over the result, then delete the temp
 * directory -- the real site is never written to. Returns `{ posts,
 * written, ok: true }` on success; throws on the first violated
 * invariant.
 */
export async function runCheck(contentDir) {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'stayfresh-build-check-'));
  try {
    const { posts, written } = await buildSite({ contentDir, outDir: tmpDir });
    await validateBuild(tmpDir, posts);
    return { posts, written, ok: true };
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

// --- CLI -------------------------------------------------------------

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const repoRoot = path.join(__dirname, '..');
  const contentDir = path.join(repoRoot, 'content');
  const check = process.argv.includes('--check');

  try {
    if (check) {
      const { posts, written } = await runCheck(contentDir);
      console.log(`--check passed: ${posts.length} posts, ${written.length} files, invariants OK`);
    } else {
      const { posts, written } = await buildSite({ contentDir, outDir: repoRoot });
      console.log(`built ${posts.length} posts, wrote ${written.length} files`);
    }
  } catch (err) {
    console.error(err.stack || err.message);
    process.exitCode = 1;
  }
}
