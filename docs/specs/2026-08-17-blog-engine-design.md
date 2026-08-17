# StayFresh Blog Engine — Design

**Date:** 2026-08-17
**Goal:** Replace hand-authored HTML + a hand-maintained metadata array with a zero-dependency Node static generator, so posts are written once in Markdown and every derived surface (article HTML, section indexes, tag pages, a chronological blog index, feeds, sitemap, llms.txt) is generated.

## Position

Today the site duplicates metadata in three places: each article's HTML, the `pages[]` array in `scripts/build-publisher-files.mjs`, and the hand-written `<li class="h-entry">` rows in each section index. Adding or editing a post means editing all three by hand, in sync. The engine inverts this: **the Markdown post is the single source of truth**, and all derived HTML/XML/JSON is generated from it.

The site's own doctrine constrains the build: minimal, legible, low comprehension debt, zero npm dependencies, IndieWeb-precise. The engine is one owned Node script plus small library modules, no framework.

stayfresh.dev is the author's personal brand, so full fidelity and polish outrank shortcuts: every existing article must regenerate byte-faithfully, and the parser covers what the real content uses rather than a convenient subset.

## Scope

In scope:
- Markdown authoring with YAML-ish front-matter, one file per post.
- A bespoke zero-dependency Markdown-subset parser.
- Generation of: article pages, section indexes, tag pages + tag listing, a chronological blog index, and the discovery surfaces (rss.xml, atom.xml, feed.json, sitemap.xml, llms.txt).
- Migration of all 22 existing articles to Markdown, verified by diffing generated HTML against the committed originals.

Out of scope (v1, YAGNI):
- Full-text search. Tags + the chronological index + a 22-post corpus make search unjustified, and it would require client-side JS the site currently avoids. A small client-side tag filter can be added later.
- Comments, pagination, scheduled publishing. A `draft: true` flag that skips a post is the only draft workflow.
- Tables and footnotes in Markdown, until a post actually needs them.

## Authoring format

One Markdown file per post at `content/<section>/<slug>.md`. The directory `<slug>` becomes the output path `<section>/<slug>/index.html`. The canonical URL is derived, not stored.

Front-matter (delimited by `---` lines):

```
---
title: Reward Hacking in Coding Agents
description: How poorly designed metrics produce plausible but unstable code.
section: research
date: 2026-04-13
tags: [rubrics, evaluation, failure-modes]
draft: false
---
```

Field rules:
- `title` (required) — becomes `<title>`, the `h1`/`p-name`, and index/feed titles.
- `description` (required) — meta description, `p-summary` in indexes, feed summary.
- `section` (required) — one of `research`, `workflows`. Determines output directory and which section index the post appears in.
- `date` (required) — full ISO date `YYYY-MM-DD`. Feeds and sitemap use the full date; on-page and index display shows month granularity (`2026-04`) to match the current house voice. Sort order is by full date, newest first.
- `tags` (optional) — list of kebab-case strings. Empty or absent means the post appears in no tag pages.
- `draft` (optional, default false) — when true the post is skipped entirely (no page, not in any index or feed).

Front-matter parsing is intentionally small: `key: value` scalars and `key: [a, b, c]` inline lists. No nested structures, no multi-line values. The parser is bespoke (no YAML dependency).

## Markdown subset

The parser covers exactly what the existing 26 articles use (verified against their HTML during design: 20 use code blocks, 17 use `h4`, 14 use ordered lists, 10 use tables). Bespoke and zero-dependency, but not tiny — fidelity on the real content requires the full set below.

Block constructs:
- ATX headings `#`…`######`. In-body headings run `h3`/`h4` (the post title is the `h2` `p-name`); both levels are common.
- Paragraphs.
- Unordered lists (`-`) and ordered lists (`1.`), including nesting.
- Blockquotes (`>`).
- Fenced code blocks (```` ``` ````) and indented code blocks, rendered as `<pre><code>`.
- Tables, GFM pipe syntax (`| h | h |` / `| --- | --- |` / rows), rendered as `<table><thead><tbody>` with `<th>`/`<td>`.

Inline constructs: `**bold**`, `*italic*`, `` `code` ``, `[text](url)`.

Constraints:
- The parser HTML-escapes text and code content, and only emits the tags listed above. It does not pass through raw HTML.
- The parser must never emit em-dashes or the "AI-slop" punctuation patterns removed in an earlier cleanup commit. Markdown `--`/`---` in prose is left literal, never converted to em/en dashes.

Deferred constructs (footnotes, images, definition lists, nested raw HTML) are added only when a post needs them, each with its own test.

## Output surfaces

All output is committed to the repository. GitHub Pages serves the static files; there is no server-side build step and no CI requirement. The build is run locally with `node scripts/build.mjs`.

1. **Article page** — `<section>/<slug>/index.html`. Exact current house style:
   - `<head>`: charset, viewport, `rel=canonical`, three `rel=alternate` feed links (rss/atom/json), `rel=webmention`, `rel=pingback`, `<title>`, stylesheet.
   - `<header>` and `<nav>` blocks identical to current pages.
   - `<main class="h-entry">` containing the `p-name` title, a `dt-published` time (month display, full ISO in the `datetime` attribute), the `e-content` body, a hidden `p-author h-card`, and, when tags exist, a tag list linking to the tag pages.
   - Footer h-card identical to current pages.

2. **Section indexes** — `research/index.html`, `workflows/index.html`. An `h-feed` grouped by year (descending), each entry an `h-entry` `<li>` with month-display `dt-published`, `u-url p-name` title link, and `p-summary`. Matches the current structure exactly.

3. **Tag pages (new)** — `tags/<tag>/index.html` per tag, an `h-feed` of the posts carrying that tag (newest first, across sections), plus `tags/index.html` listing all tags with post counts.

4. **Chronological blog index (new)** — `blog/index.html`. All non-draft posts across sections, newest first, as an `h-feed`. This is the "blog" reading view; the section indexes remain as topical entry points.

5. **Discovery surfaces** — `rss.xml`, `atom.xml`, `feed.json`, `sitemap.xml`, `llms.txt`. Regenerated from the scanned posts, folding in the existing `build-publisher-files.mjs` generation logic (XML escaping, ISO date formatting, feed envelope) but sourcing entries from posts instead of the hand-maintained `pages[]` array. Feed inclusion follows the current rule: articles are included; pure index pages are not.

## Architecture

```
content/<section>/<slug>.md      authored posts (source of truth)
scripts/build.mjs                entry point: scan, parse, render, write
scripts/lib/frontmatter.mjs      parse front-matter block -> object
scripts/lib/markdown.mjs         Markdown subset -> HTML
scripts/lib/templates.mjs        page/index/tag/feed HTML templates
scripts/lib/feeds.mjs            rss/atom/json/sitemap/llms builders
```

Each module has one responsibility and a well-defined interface (function in, string/object out), so it can be tested in isolation. `build.mjs` orchestrates: collect posts, validate front-matter, sort, then render each surface.

The old `scripts/build-publisher-files.mjs` is superseded by `feeds.mjs` and deleted once feed output matches.

## Testing

- **Fidelity (primary):** `node scripts/build.mjs --check` regenerates every migrated article into a temp location and diffs against the committed originals with whitespace normalized. A non-empty diff fails the check. This proves the engine reproduces the hand-written site and guards against regressions.
- **Unit:** small assertions for `markdown.mjs` — one per construct (headings h1-h4, paragraphs, ordered + unordered + nested lists, blockquotes, fenced + indented code, GFM tables, inline bold/italic/code/links) plus the no-em-dash guarantee — and `frontmatter.mjs` (scalars, inline lists, missing required fields error).
- **Discovery validity:** the generated `sitemap.xml`, `rss.xml`, and `atom.xml` parse as well-formed XML; `feed.json` parses as JSON.

## Migration

1. For each of the 22 articles, extract front-matter values from the current HTML + the `pages[]` array, and convert the `e-content` body to Markdown.
2. Regenerate and run `--check`; fix parser/template gaps until the diff is empty for every article.
3. Only then delete the hand-maintained `pages[]` array and `build-publisher-files.mjs`.

## Files

- Create: `content/**/*.md` (22 migrated posts + a template), `scripts/build.mjs`, `scripts/lib/frontmatter.mjs`, `scripts/lib/markdown.mjs`, `scripts/lib/templates.mjs`, `scripts/lib/feeds.mjs`, `tags/`, `blog/`.
- Modify: `scripts/deploy-eepsite.sh` (copy `blog/` and `tags/`), `README.md` (authoring instructions).
- Delete (after fidelity passes): `scripts/build-publisher-files.mjs`.
