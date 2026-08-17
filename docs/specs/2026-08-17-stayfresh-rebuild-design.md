# StayFresh Rebuild — Design

**Date:** 2026-08-17
**Goal:** Rebuild stayfresh.dev as the author's personal brand: a zero-dependency Markdown blog engine, a committed CRT/demoscene visual identity (a WebGL splash plus a legible phosphor reading theme), and a content revision that deletes the manifesto and rewrites every note in a neutral, understated voice.

This one design covers three coupled changes, because they ship together and share templates:
1. **Engine** — Markdown posts as the single source of truth, generating all HTML/feeds.
2. **Identity** — one dark CRT world across the splash and every content page.
3. **Voice** — delete the thesis, drop the doctrine framing, rewrite the notes flat.

## Position

Today the site duplicates metadata across each article's HTML, a hand-maintained `pages[]` array in `scripts/build-publisher-files.mjs`, and hand-written index rows. It also carries a heavy "thesis / position / doctrine / ten beliefs" voice that the author no longer wants. The rebuild inverts the data flow (Markdown post is the single source of truth) and resets the voice (neutral technical field-notes).

Constraints from the site's own history that survive the rebuild: zero npm dependencies, IndieWeb-precise markup (microformats2, `rel=me`, webmention), all-lowercase prose, and no em-dashes.

## Visual identity

The site commits to a single dark CRT/demoscene world (no light theme — a deliberate choice, like an arcade screen, not an omission). Prototypes approved during design:
- Splash: `prototypes/landing-proto.html`
- Reading theme: `prototypes/reading-theme-proto.html`

**Palette (tokens):**
| token | value | role |
|---|---|---|
| `--void` | `#05070e` | background |
| `--void2` | `#080b14` | panels, code, nav |
| `--amber` | `#ffb000` | headings, brand |
| `--text` | `#c4d2ce` | body (soft phosphor, readable) |
| `--muted` | `#6f807a` | dates, captions, footer |
| `--cyan` | `#29ffe3` | links, wireframe, hairlines |
| `--magenta` | `#ff3d81` | hover/active, ENTER |
| `--code` | `#ffd08a` | code text |

**Typography:** monospace throughout (`SFMono-Regular, SF Mono, Menlo, Consolas, DejaVu Sans Mono, monospace`). The old self-hosted serif (`LoraHacked`) and its em-dash-as-double-hyphen font hack are retired; the no-em-dash guarantee moves into the Markdown parser and content instead. Prose stays all-lowercase. Headings use terminal markers (`##`, `###`), amber with a soft glow.

**CRT treatment:** faint fixed scanlines and a vignette, tuned low enough to read long-form through. Content pages carry no flicker, warp, or chromatic aberration — those live only on the splash. All motion respects `prefers-reduced-motion`.

**Splash landing** (`/`): hand-rolled raw WebGL (zero dependencies), a rotating wireframe torus over a warp starfield, chrome title with RGB-split aberration, CRT overlays. Content is deliberately minimal: the animation, the `STAYFRESH` title, and an `[ ENTER ]` link. `ENTER` leads to the homepage. Degrades to a styled static splash when WebGL is unavailable; freezes to one static frame under reduced motion.

**Homepage relocation:** the current `index.html` (archive homepage, and holder of the IndieWeb `rel=me` links + representative `h-card`) moves behind the splash to `/home/`. The splash at `/` also carries the minimum IndieWeb identity (`rel=me`, a hidden representative `h-card`) so web sign-in still resolves against `https://stayfresh.dev/`.

## Content and voice

**Delete the thesis.** Remove `/thesis/` entirely: the page, its nav link, its feed/sitemap/llms entries, and every "this is a position, not a feed / ten beliefs" framing that references it.

**Drop the doctrine vocabulary.** Replace "doctrine / thesis / position / belief / manifesto" framing wherever it appears: nav labels, the homepage intro, index blurbs, taglines, `llms.txt`, and section descriptions. The nav becomes `home / workflows / research / github`.

**Rewrite the voice to neutral technical field-notes** across all surfaces and all article bodies: factual, understated, first-person-light ("here is what happened / what worked"), no grand claims, no "strong take" posturing. This rewrite happens during the Markdown migration — each article is converted and de-preached in the same pass. Lowercase and no-em-dash rules hold.

The homepage and section intros are rewritten to plainly say what the notes are, with no manifesto energy.

## Authoring format

One Markdown file per post at `content/<section>/<slug>.md`. The directory `<slug>` becomes the output path `<section>/<slug>/index.html`. Front-matter (delimited by `---`):

```
---
title: reward hacking in coding agents
description: how gameable metrics produce plausible but unstable code.
section: research
date: 2026-04-13
tags: [rubrics, evaluation, failure-modes]
draft: false
---
```

Field rules:
- `title` (required) — `<title>`, `p-name`, index/feed title. Lowercase.
- `description` (required) — meta description, `p-summary`, feed summary.
- `section` (required) — `research` or `workflows`.
- `date` (required) — full ISO `YYYY-MM-DD`. Feeds/sitemap use the full date; display shows month (`2026-04`). Sort by full date, newest first.
- `tags` (optional) — kebab-case list.
- `draft` (optional, default false) — when true, skipped entirely.

Front-matter parsing is bespoke and small: `key: value` scalars and `key: [a, b, c]` inline lists. No YAML dependency.

## Markdown subset

The parser covers what the articles actually use (verified during design: 20 use code blocks, 17 use `h4`, 14 use ordered lists, 10 use tables). Bespoke and zero-dependency.

Block constructs: ATX headings `#`…`######` (in-body headings run `h3`/`h4`; the post title is the `h2` `p-name`); paragraphs; unordered (`-`) and ordered (`1.`) lists, nestable; blockquotes (`>`); fenced and indented code blocks as `<pre><code>`; GFM pipe tables as `<table><thead><tbody>`.

Inline: `**bold**`, `*italic*`, `` `code` ``, `[text](url)`.

Constraints: the parser HTML-escapes text and code, emits only the tags above, passes through no raw HTML, and never emits em-dashes (`--`/`---` in prose stay literal). Deferred (footnotes, images, definition lists) are added per-post when needed, each with a test.

## Output surfaces

All output is committed; GitHub Pages serves static files; the build runs locally via `node scripts/build.mjs`. No CI requirement.

1. **Splash** — `/index.html`. The WebGL landing (from the approved prototype), plus IndieWeb `rel=me` + hidden `h-card`.
2. **Homepage** — `/home/index.html`. The relocated archive homepage, rewritten flat, carrying the full `rel=me` + representative `h-card`, linking into the sections and the blog index.
3. **Article pages** — `<section>/<slug>/index.html`, in the CRT reading theme with full microformats2 (`h-entry`, `p-name`, `dt-published`, `e-content`, hidden `p-author h-card`, tag list), the fixed head (canonical, three feed links, webmention/pingback) and terminal-chrome header/nav/footer.
4. **Section indexes** — `workflows/index.html`, `research/index.html`. `h-feed` grouped by year, newest first.
5. **Tag pages (new)** — `tags/<tag>/index.html` per tag + `tags/index.html` listing all tags with counts.
6. **Chronological blog index (new)** — `blog/index.html`, all non-draft posts across sections, newest first.
7. **Discovery** — `rss.xml`, `atom.xml`, `feed.json`, `sitemap.xml`, `llms.txt`, regenerated from scanned posts (folding in the current `build-publisher-files.mjs` XML/JSON logic), with the thesis removed and copy de-preached.

## Architecture

```
content/<section>/<slug>.md      authored posts (source of truth)
style.css                        the CRT reading theme (rewritten)
index.html                       splash (generated or static, from prototype)
scripts/build.mjs                entry: scan, parse, render, write
scripts/lib/frontmatter.mjs      front-matter -> object
scripts/lib/markdown.mjs         Markdown subset -> HTML
scripts/lib/templates.mjs        page/index/tag templates (house style + CRT)
scripts/lib/feeds.mjs            rss/atom/json/sitemap/llms builders
```

Each module has one responsibility and a testable interface. `build.mjs` orchestrates: collect posts, validate front-matter, sort, render each surface. `scripts/build-publisher-files.mjs` is superseded by `feeds.mjs` and deleted once output matches.

## Testing

Because content is being rewritten, the earlier "generated HTML byte-matches the originals" test no longer applies to article bodies. The guarantees become:
- **Structural fidelity:** generated pages match the house template shape — required `<head>` links (canonical, three feeds, webmention, pingback), the microformats2 classes (`h-entry`/`h-feed`, `p-name`, `dt-published`, `e-content`, `p-author h-card`, `u-url`), and the header/nav/footer chrome. Asserted by snapshot on one representative generated page per template.
- **Markup validity:** every generated HTML page is well-formed; `sitemap.xml`/`rss.xml`/`atom.xml` parse as XML; `feed.json` parses as JSON.
- **Unit:** `markdown.mjs` — one assertion per construct (headings h1-h4, paragraphs, ordered/unordered/nested lists, blockquotes, fenced/indented code, GFM tables, inline bold/italic/code/links) plus the no-em-dash guarantee; `frontmatter.mjs` — scalars, inline lists, missing-required-field errors.
- **Content review (manual):** the rewritten copy is read for the neutral-voice target and the absence of doctrine framing, em-dashes, and stray uppercase. This is a human gate, not automated.

## Migration

1. Delete `/thesis/` and every reference to it (nav, feeds, sitemap, llms, homepage).
2. For each remaining article: extract front-matter from the current HTML + `pages[]`, convert the body to Markdown, and rewrite it in the neutral voice in the same pass. Save as `content/<section>/<slug>.md`.
3. Rewrite the homepage and section intros flat, drop the doctrine vocabulary sitewide.
4. Regenerate; confirm structural + validity tests pass and every page renders in the CRT theme.
5. Delete `scripts/build-publisher-files.mjs` and the old `pages[]` array once feed output matches.

## Files

- Create: `content/**/*.md` (migrated + rewritten posts, a post template), `index.html` (splash), `home/index.html`, `blog/`, `tags/`, `scripts/build.mjs`, `scripts/lib/{frontmatter,markdown,templates,feeds}.mjs`.
- Rewrite: `style.css` (CRT reading theme), section index intros, `llms.txt`, `README.md` (authoring instructions).
- Delete: `thesis/`, `scripts/build-publisher-files.mjs`, `fonts/` (retired serif) once nothing references them.
