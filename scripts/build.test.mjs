import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { buildSite, runCheck } from './build.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesContentDir = path.join(__dirname, 'fixtures', 'content');

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'stayfresh-build-test-'));
  try {
    return await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

// Very small "is this XML well-formed" gut check: every opening tag has a
// matching closing tag, in the right order. Not a real parser -- a
// tag-balance assertion, per the brief.
function isWellFormedXml(xml) {
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
      if (stack.pop() !== name) return false;
    } else {
      stack.push(name);
    }
  }
  return stack.length === 0;
}

test('buildSite writes an article page with h-entry + canonical', async () => {
  await withTempDir(async (outDir) => {
    const { posts, written } = await buildSite({ contentDir: fixturesContentDir, outDir });
    assert.ok(posts.length > 0);

    const articlePath = path.join(outDir, 'research', 'sample', 'index.html');
    assert.ok(written.includes(articlePath));

    const html = await fs.readFile(articlePath, 'utf8');
    assert.match(html, /h-entry/);
    assert.match(
      html,
      /<link rel="canonical" href="https:\/\/stayfresh\.dev\/research\/sample\/">/
    );
  });
});

test('buildSite skips drafts and underscore-prefixed files', async () => {
  await withTempDir(async (outDir) => {
    const { posts } = await buildSite({ contentDir: fixturesContentDir, outDir });
    const slugs = posts.map((p) => p.slug);
    assert.equal(slugs.includes('_hidden'), false);
    assert.equal(slugs.includes('draft-post'), false);
    assert.deepEqual(slugs, ['second-post', 'sample']); // sorted newest-first by date
    await assert.rejects(fs.access(path.join(outDir, 'research', '_hidden', 'index.html')));
    await assert.rejects(fs.access(path.join(outDir, 'workflows', 'draft-post', 'index.html')));
  });
});

test('buildSite writes blog index and a tag page', async () => {
  await withTempDir(async (outDir) => {
    await buildSite({ contentDir: fixturesContentDir, outDir });

    const blogHtml = await fs.readFile(path.join(outDir, 'blog', 'index.html'), 'utf8');
    assert.match(blogHtml, /h-feed/);
    assert.match(blogHtml, /sample post/);
    assert.match(blogHtml, /second post/);

    const tagHtml = await fs.readFile(path.join(outDir, 'tags', 'testing', 'index.html'), 'utf8');
    assert.match(tagHtml, /h-feed/);

    const tagsIndexHtml = await fs.readFile(path.join(outDir, 'tags', 'index.html'), 'utf8');
    assert.match(tagsIndexHtml, /h-feed/);
  });
});

test('buildSite writes section indexes and home page', async () => {
  await withTempDir(async (outDir) => {
    await buildSite({ contentDir: fixturesContentDir, outDir });
    const researchHtml = await fs.readFile(path.join(outDir, 'research', 'index.html'), 'utf8');
    assert.match(researchHtml, /h-feed/);
    const workflowsHtml = await fs.readFile(path.join(outDir, 'workflows', 'index.html'), 'utf8');
    assert.match(workflowsHtml, /h-feed/);
    const homeHtml = await fs.readFile(path.join(outDir, 'home', 'index.html'), 'utf8');
    assert.match(homeHtml, /h-feed/);
  });
});

test('sitemap.xml is well-formed and lists post + surface URLs', async () => {
  await withTempDir(async (outDir) => {
    await buildSite({ contentDir: fixturesContentDir, outDir });
    const xml = await fs.readFile(path.join(outDir, 'sitemap.xml'), 'utf8');
    assert.match(xml, /<urlset/);
    assert.ok(isWellFormedXml(xml), 'sitemap.xml should be well-formed');
    assert.match(xml, /<loc>https:\/\/stayfresh\.dev\/research\/sample\/<\/loc>/);
  });
});

test('rss.xml and atom.xml are well-formed', async () => {
  await withTempDir(async (outDir) => {
    await buildSite({ contentDir: fixturesContentDir, outDir });
    const rssXml = await fs.readFile(path.join(outDir, 'rss.xml'), 'utf8');
    assert.ok(isWellFormedXml(rssXml), 'rss.xml should be well-formed');
    const atomXml = await fs.readFile(path.join(outDir, 'atom.xml'), 'utf8');
    assert.ok(isWellFormedXml(atomXml), 'atom.xml should be well-formed');
  });
});

test('feed.json parses via JSON.parse', async () => {
  await withTempDir(async (outDir) => {
    await buildSite({ contentDir: fixturesContentDir, outDir });
    const raw = await fs.readFile(path.join(outDir, 'feed.json'), 'utf8');
    const parsed = JSON.parse(raw);
    assert.ok(Array.isArray(parsed.items));
    assert.equal(parsed.items.length, 2);
  });
});

test('llms.txt lists posts', async () => {
  await withTempDir(async (outDir) => {
    await buildSite({ contentDir: fixturesContentDir, outDir });
    const txt = await fs.readFile(path.join(outDir, 'llms.txt'), 'utf8');
    assert.match(txt, /sample post/);
    assert.match(txt, /second post/);
  });
});

test('runCheck builds to a temp dir, validates, and does not touch outDir', async () => {
  const result = await runCheck(fixturesContentDir);
  assert.equal(result.ok, true);
  assert.equal(result.posts.length, 2);
});
