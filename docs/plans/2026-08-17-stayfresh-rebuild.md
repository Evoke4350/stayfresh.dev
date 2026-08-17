# StayFresh Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild stayfresh.dev with a zero-dependency Markdown blog engine, a committed CRT/demoscene visual identity, and a de-preached neutral-voice content set.

**Architecture:** Node ESM generator (`scripts/build.mjs` + `scripts/lib/*.mjs`) turns `content/<section>/<slug>.md` into all site HTML/XML/JSON. Output is committed; GitHub Pages serves static. A single dark CRT theme in `style.css` styles every page; a hand-rolled WebGL splash at `/` gates the homepage.

**Tech Stack:** Node ≥ 18 (ESM, built-in modules only), raw WebGL, HTML/CSS. No npm dependencies. Reference design: `docs/specs/2026-08-17-stayfresh-rebuild-design.md`. Approved prototypes: `prototypes/landing-proto.html`, `prototypes/reading-theme-proto.html`.

## Global Constraints

- **Zero npm dependencies.** Only Node built-ins (`node:fs`, `node:path`, `node:url`, `node:test`, `node:assert`). No package.json deps.
- **All output committed.** No CI build; `node scripts/build.mjs` runs locally and its output is checked in.
- **Lowercase prose.** Body/heading/title text is all-lowercase. Code content preserves case.
- **No em-dashes.** The parser never emits `—`/`–`; `--`/`---` in prose stays literal. No em-dashes in any authored copy.
- **IndieWeb preserved.** Every content page keeps microformats2 (`h-entry`/`h-feed`, `p-name`, `dt-published`, `e-content`, hidden `p-author h-card`, `u-url`, `p-summary`), the fixed `<head>` (canonical, three `rel=alternate` feeds, `rel=webmention`, `rel=pingback`), and the footer `h-card`. `rel=me` (github + `mailto:nathanib@pm.me`) lives on the splash and the homepage.
- **CRT identity.** Single dark theme (no light theme). Monospace stack `"SFMono-Regular","SF Mono",Menlo,Consolas,"DejaVu Sans Mono",monospace`. Palette tokens: `--void #05070e`, `--void2 #080b14`, `--amber #ffb000`, `--text #c4d2ce`, `--muted #6f807a`, `--cyan #29ffe3`, `--magenta #ff3d81`, `--code #ffd08a`. Content pages carry no flicker/warp/aberration. All motion respects `prefers-reduced-motion`.
- **Neutral voice (the de-preach rubric).** Field-notes tone: factual, understated, first-person-light ("here is what happened / what worked"). No "thesis / position / doctrine / belief / manifesto / strong take" framing. No grand claims. Keep technical accuracy, tables, and code intact.
- **Sections.** Only `research` and `workflows`. Nav is `home / workflows / research / github`. No `thesis`.
- **Analytics.** Every generated page and the splash carry the Google Analytics 4 `gtag.js` snippet and a Search Console `google-site-verification` meta, both sourced from `scripts/lib/config.mjs` (`ga4`, `searchConsole`). No "no tracking / no cookies" copy anywhere. Real ids are supplied by the author.
- **Post inventory (23):** research — agents-md-effectiveness, context-is-a-budget, enterprise-agent-design, formal-verification-agents, persona-anchors, protocol-before-personality, reward-engineering, reward-hacking, sleepcast, specs-as-shared-reality, techno-alexithymia, what-is-prompting. workflows — agent-psychology, anubis-github-pages, ci-automation, claude-code-skills-stack, instant-project-sync, modular-workflow-stack, preference-toml, project-ai-philosophy, prompt-patterns, psay-agent-notify, reward-rubric-dsl.

---

## Task 1: Front-matter parser

**Files:**
- Create: `scripts/lib/frontmatter.mjs`
- Test: `scripts/lib/frontmatter.test.mjs`

**Interfaces:**
- Produces: `parseFrontmatter(raw: string) -> { data: object, body: string }`. `data` holds string scalars, `tags` as a string array, `draft` as a boolean. Throws `Error` naming any missing required field (`title`, `description`, `section`, `date`).

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFrontmatter } from "./frontmatter.mjs";

const raw = `---
title: reward hacking in coding agents
description: how gameable metrics produce unstable code.
section: research
date: 2026-04-13
tags: [rubrics, evaluation, failure-modes]
draft: false
---
body line one

body line two
`;

test("parses scalars, inline list, boolean, and body", () => {
  const { data, body } = parseFrontmatter(raw);
  assert.equal(data.title, "reward hacking in coding agents");
  assert.equal(data.section, "research");
  assert.equal(data.date, "2026-04-13");
  assert.deepEqual(data.tags, ["rubrics", "evaluation", "failure-modes"]);
  assert.equal(data.draft, false);
  assert.equal(body.trim().startsWith("body line one"), true);
});

test("missing required field throws naming it", () => {
  assert.throws(() => parseFrontmatter(`---\ntitle: x\n---\nb`), /description/);
});

test("absent tags default to empty array, draft defaults false", () => {
  const { data } = parseFrontmatter(`---\ntitle: t\ndescription: d\nsection: research\ndate: 2026-01-01\n---\nb`);
  assert.deepEqual(data.tags, []);
  assert.equal(data.draft, false);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --test scripts/lib/frontmatter.test.mjs`
Expected: FAIL (module not found / parseFrontmatter undefined).

- [ ] **Step 3: Implement `frontmatter.mjs`**

Parse the leading `---`…`---` block. Split each line on the first `:`. Trim. Recognize `[a, b, c]` inline lists (strip brackets, split on comma, trim, drop empties). Recognize `true`/`false` as booleans. Everything else is a string. After parsing, default `tags` to `[]` and `draft` to `false`, then assert `title`, `description`, `section`, `date` are present (throw `new Error("frontmatter missing required field: <name>")` otherwise). Return `{ data, body }` where `body` is everything after the closing `---`.

- [ ] **Step 4: Run test, verify it passes**

Run: `node --test scripts/lib/frontmatter.test.mjs`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/frontmatter.mjs scripts/lib/frontmatter.test.mjs
git commit -m "Add zero-dep front-matter parser"
```

---

## Task 2: Markdown parser — block constructs

**Files:**
- Create: `scripts/lib/markdown.mjs`
- Test: `scripts/lib/markdown.test.mjs`

**Interfaces:**
- Produces: `renderMarkdown(md: string) -> string` (HTML). This task implements block-level constructs; Task 3 adds inline. Output HTML-escapes text, emits only whitelisted tags, and never emits em-dashes.

- [ ] **Step 1: Write the failing test** (block constructs)

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdown } from "./markdown.mjs";

test("headings h3/h4", () => {
  assert.equal(renderMarkdown("### foo").trim(), "<h3>foo</h3>");
  assert.equal(renderMarkdown("#### bar").trim(), "<h4>bar</h4>");
});
test("paragraph", () => {
  assert.equal(renderMarkdown("hello world").trim(), "<p>hello world</p>");
});
test("unordered list", () => {
  assert.equal(renderMarkdown("- a\n- b").replace(/\s+/g, " ").trim(),
    "<ul> <li>a</li> <li>b</li> </ul>");
});
test("ordered list", () => {
  assert.equal(renderMarkdown("1. a\n2. b").replace(/\s+/g, " ").trim(),
    "<ol> <li>a</li> <li>b</li> </ol>");
});
test("blockquote", () => {
  assert.equal(renderMarkdown("> quoted").replace(/\s+/g, " ").trim(),
    "<blockquote> <p>quoted</p> </blockquote>");
});
test("fenced code preserves case and escapes", () => {
  const out = renderMarkdown("```\nName <T>\n```");
  assert.match(out, /<pre><code>Name &lt;T&gt;\n<\/code><\/pre>/);
});
test("gfm table", () => {
  const out = renderMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |").replace(/\s+/g, " ");
  assert.match(out, /<table><thead><tr><th>a<\/th><th>b<\/th><\/tr><\/thead>/);
  assert.match(out, /<tbody><tr><td>1<\/td><td>2<\/td><\/tr><\/tbody>/);
});
test("no em-dash emitted from double hyphen", () => {
  assert.equal(renderMarkdown("a -- b").includes("—"), false);
  assert.match(renderMarkdown("a -- b"), /a -- b/);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --test scripts/lib/markdown.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement block parsing in `markdown.mjs`**

Split input into lines. Walk line-by-line, grouping into blocks: fenced code (```` ``` ````…```` ``` ````, verbatim + HTML-escaped, no inline processing), tables (a header row `| … |` followed by a `| --- |` delimiter), blockquotes (`>` prefix), ordered lists (`N.`), unordered lists (`-`), headings (`#`×n), and paragraphs (contiguous non-blank lines). Support one level of list nesting by indentation (two spaces). Emit the whitelisted tags only. Provide an `escapeHtml` helper (`& < > "`). Leave inline spans as raw text for now (Task 3 wraps this). Guarantee no `—`/`–` is ever produced.

- [ ] **Step 4: Run test, verify it passes**

Run: `node --test scripts/lib/markdown.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/markdown.mjs scripts/lib/markdown.test.mjs
git commit -m "Add Markdown block parser (headings, lists, quotes, code, tables)"
```

---

## Task 3: Markdown parser — inline spans

**Files:**
- Modify: `scripts/lib/markdown.mjs`
- Modify: `scripts/lib/markdown.test.mjs`

**Interfaces:**
- Consumes: the block renderer from Task 2.
- Produces: inline processing applied to text content of paragraphs, headings, list items, table cells, and blockquotes (never inside code). `**bold**`→`<strong>`, `*italic*`→`<em>`, `` `code` ``→`<code>` (escaped), `[t](url)`→`<a href="url">t</a>`.

- [ ] **Step 1: Write the failing test** (append)

```js
test("inline bold/italic/code/link", () => {
  assert.equal(renderMarkdown("a **b** c").trim(), "<p>a <strong>b</strong> c</p>");
  assert.equal(renderMarkdown("a *b* c").trim(), "<p>a <em>b</em> c</p>");
  assert.equal(renderMarkdown("a `x<y` c").trim(), "<p>a <code>x&lt;y</code> c</p>");
  assert.equal(renderMarkdown("see [docs](/x)").trim(), '<p>see <a href="/x">docs</a></p>');
});
test("inline not applied inside fenced code", () => {
  assert.match(renderMarkdown("```\n**not bold**\n```"), /\*\*not bold\*\*/);
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --test scripts/lib/markdown.test.mjs`
Expected: FAIL on the new inline tests.

- [ ] **Step 3: Implement inline pass**

Add `renderInline(text)`: first extract `` `code` `` spans to placeholders (escaped, no further processing), then apply `[t](url)` (escape the url via a small allow of `/`, `:`, `.`, `-`, `_`, alnum, `#`, `?`, `=`, `&`), then `**bold**`, then `*italic*`, then restore code placeholders. Call `renderInline` from the block renderer for all text-bearing constructs except code blocks. Keep escaping correct (escape first, then inject tags).

- [ ] **Step 4: Run test, verify it passes**

Run: `node --test scripts/lib/markdown.test.mjs`
Expected: PASS (all block + inline).

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/markdown.mjs scripts/lib/markdown.test.mjs
git commit -m "Add Markdown inline spans (bold, italic, code, links)"
```

---

## Task 4: Page templates

**Files:**
- Create: `scripts/lib/templates.mjs`
- Test: `scripts/lib/templates.test.mjs`

**Interfaces:**
- Consumes: rendered body HTML (string), post metadata objects.
- Produces:
  - `articlePage(post) -> string` — full `<!DOCTYPE html>` document: fixed head (canonical `https://stayfresh.dev<path>`, three feed links, webmention, pingback, `<title>… - stayfresh</title>`, `<link rel=stylesheet href=/style.css>`), terminal header + nav, `<main class="h-entry">` with `p-name`, `dt-published` (month display, full ISO in `datetime`), `e-content` body, hidden `p-author h-card`, tag list, footer `h-card`.
  - `sectionIndex(section, posts) -> string` — `h-feed` grouped by descending year.
  - `tagPage(tag, posts) -> string`, `tagsIndex(tagCounts) -> string`.
  - `blogIndex(posts) -> string` — chronological `h-feed`.
  - `homePage(sections) -> string` — relocated homepage with full `rel=me` + `h-card`.
- A `nav()` and `head(opts)` helper shared by all. Uses the CRT classes from `style.css` (Task 7). `head()` injects the GA4 `gtag.js` snippet and Search Console verification meta from `scripts/lib/config.mjs` (Task 18); when those config ids are empty strings it emits neither, so tests and fixtures stay clean.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { articlePage } from "./templates.mjs";

const post = {
  title: "reward hacking", description: "d", section: "research",
  slug: "reward-hacking", date: "2026-04-13", tags: ["rubrics"],
  path: "/research/reward-hacking/", bodyHtml: "<p>body</p>"
};

test("article page carries house head + microformats", () => {
  const h = articlePage(post);
  assert.match(h, /<link rel="canonical" href="https:\/\/stayfresh\.dev\/research\/reward-hacking\/">/);
  assert.match(h, /rel="alternate" type="application\/rss\+xml"/);
  assert.match(h, /rel="webmention"/);
  assert.match(h, /<main class="h-entry">/);
  assert.match(h, /class="p-name"/);
  assert.match(h, /<time class="dt-published" datetime="2026-04-13">2026-04<\/time>/);
  assert.match(h, /class="e-content"/);
  assert.match(h, /class="p-author h-card"[^>]*hidden/);
  assert.match(h, /<footer class="h-card">/);
  assert.match(h, />rubrics</); // tag chip
});
test("nav has no thesis, has the four links", () => {
  const h = articlePage(post);
  assert.equal(/thesis/i.test(h), false);
  for (const l of ["home","workflows","research","github"]) assert.match(h, new RegExp(">"+l+"<","i"));
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `node --test scripts/lib/templates.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement `templates.mjs`**

Build the shared `head()` and `nav()` helpers, then each page function, matching the approved `prototypes/reading-theme-proto.html` structure and classes exactly (header brand, `/`-prefixed nav, `.e-content`, `.article-list`, `.tags`, footer). Month display = `date.slice(0,7)`. All emitted prose lowercase. No thesis anywhere.

- [ ] **Step 4: Run test, verify it passes**

Run: `node --test scripts/lib/templates.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/templates.mjs scripts/lib/templates.test.mjs
git commit -m "Add page templates (article, indexes, tags, blog, home)"
```

---

## Task 5: Feed + discovery builders

**Files:**
- Create: `scripts/lib/feeds.mjs`
- Test: `scripts/lib/feeds.test.mjs`
- Reference: `scripts/build-publisher-files.mjs` (port XML/JSON/escape/date logic; do not import).

**Interfaces:**
- Produces: `rss(posts) -> string`, `atom(posts) -> string`, `jsonFeed(posts) -> object`, `sitemap(urls) -> string`, `llms(posts) -> string`. Feeds include article entries only (not pure index pages), newest first, using full ISO dates.

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { rss, atom, jsonFeed, sitemap } from "./feeds.mjs";

const posts = [{ title:"a & b", description:"d", path:"/research/a/", date:"2026-04-13" }];

test("rss is well-formed and escapes", () => {
  const x = rss(posts);
  assert.match(x, /<rss version="2.0"/);
  assert.match(x, /a &amp; b/);
});
test("atom well-formed, json parses", () => {
  assert.match(atom(posts), /<feed xmlns="http:\/\/www\.w3\.org\/2005\/Atom">/);
  const j = jsonFeed(posts);
  assert.equal(j.version.startsWith("https://jsonfeed.org/"), true);
  assert.equal(j.items[0].url, "https://stayfresh.dev/research/a/");
});
test("sitemap lists urls", () => {
  assert.match(sitemap(["https://stayfresh.dev/"]), /<loc>https:\/\/stayfresh\.dev\/<\/loc>/);
});
```

- [ ] **Step 2: Run test, verify it fails** — `node --test scripts/lib/feeds.test.mjs` → FAIL.
- [ ] **Step 3: Implement `feeds.mjs`** porting the escape/date/envelope logic from `build-publisher-files.mjs`, sourced from posts. No thesis entry.
- [ ] **Step 4: Run test, verify it passes** — PASS.
- [ ] **Step 5: Commit**

```bash
git add scripts/lib/feeds.mjs scripts/lib/feeds.test.mjs
git commit -m "Add feed + discovery builders (rss, atom, json, sitemap, llms)"
```

---

## Task 6: Build orchestrator

**Files:**
- Create: `scripts/build.mjs`
- Test: `scripts/build.test.mjs`
- Create fixture: `scripts/fixtures/content/research/sample.md`

**Interfaces:**
- Consumes: all `lib/*` modules.
- Produces: `buildSite({ contentDir, outDir }) -> { posts, written: string[] }`. Scans `content/`, parses front-matter + Markdown, skips drafts, sorts by date desc, renders every surface (articles, section indexes, tag pages + listing, blog index, home, feeds, sitemap, llms) and writes them under `outDir`. A `--check` flag builds to a temp dir and asserts structural + validity invariants without writing the site.

- [ ] **Step 1: Write the failing test** — build the fixture content into a temp dir; assert `research/sample/index.html` exists, contains `h-entry` + canonical, `blog/index.html` and `tags/<tag>/index.html` exist, `sitemap.xml` parses (well-formed check via a minimal tag balance assert or `new (await import('node:...'))` — use a regex well-formedness check), and `feed.json` parses via `JSON.parse`.
- [ ] **Step 2: Run test, verify it fails** — `node --test scripts/build.test.mjs` → FAIL.
- [ ] **Step 3: Implement `build.mjs`** (scan/validate/sort/render/write + `--check`).
- [ ] **Step 4: Run test, verify it passes** — PASS.
- [ ] **Step 5: Commit**

```bash
git add scripts/build.mjs scripts/build.test.mjs scripts/fixtures
git commit -m "Add build orchestrator with --check structural/validity mode"
```

---

## Task 7: CRT reading theme (`style.css`)

**Files:**
- Rewrite: `style.css` (replace the O'Reilly serif theme)
- Reference: `prototypes/reading-theme-proto.html`

- [ ] **Step 1:** Port the prototype's `<style>` into `style.css`: palette tokens, monospace body, lowercase, faint scanline `::before` + vignette `::after`, terminal header/nav, `.e-content` headings with `##`/`###` markers, blockquote, code/pre, `.tablewrap`/table, `.article-list`, `.tags`, footer, and the `prefers-reduced-motion` block. Single dark theme only.
- [ ] **Step 2:** Regenerate the site (`node scripts/build.mjs`) and open `research/reward-hacking/index.html` (once migrated) or the fixture output in a browser; confirm the reading theme renders, long-form is legible, and no light-theme flash.
- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "Rewrite style.css as the CRT phosphor reading theme"
```

---

## Task 8: WebGL splash + homepage relocation

**Files:**
- Create: `index.html` (splash, from `prototypes/landing-proto.html`)
- Create: `home/index.html` (relocated homepage; generated by `homePage()` in Task 9's content pass, or hand-placed here as the shell)
- Modify: `scripts/deploy-eepsite.sh` (copy `home/`, `blog/`, `tags/`)

- [ ] **Step 1:** Move the current homepage content to `/home/` (via the generator's `homePage()` output). Add full `rel=me` (github + mailto) + representative `h-card` there.
- [ ] **Step 2:** Adapt `prototypes/landing-proto.html` into `/index.html`: full `<!DOCTYPE>` document, `<head>` with `rel=me` (github + mailto), `rel=canonical`, and a hidden representative `h-card` in the body so `https://stayfresh.dev/` resolves for web sign-in. `[ ENTER ]` links to `/home/`. Keep WebGL-null and reduced-motion fallbacks.
- [ ] **Step 3:** Update `deploy-eepsite.sh` to stage `home/`, `blog/`, `tags/` alongside the existing dirs.
- [ ] **Step 4:** Verify: load `/` (splash animates, ENTER → `/home/`), and `indiewebify.me`-style check that `rel=me` + `h-card` are present on both `/` and `/home/`.
- [ ] **Step 5: Commit**

```bash
git add index.html home scripts/deploy-eepsite.sh
git commit -m "Add WebGL splash at / and relocate homepage to /home/"
```

---

## Task 9: Delete thesis + reset framing copy

**Files:**
- Delete: `thesis/`
- Modify: `content` homepage source + section intro copy, `llms.txt` source data

- [ ] **Step 1:** Delete `thesis/` and remove every reference: nav (already absent in templates), homepage links, `llms.txt`, sitemap/feeds (regenerate), and any "start here: thesis" pointer in section intros.
- [ ] **Step 2:** Rewrite the homepage intro and both section intros (`research`, `workflows`) in the neutral voice: plainly state what the notes are. Drop "doctrine / position / thesis / belief" vocabulary everywhere.
- [ ] **Step 3:** Regenerate; confirm no `thesis` string remains in generated output (`grep -ri thesis` over the built site is empty) and feeds/sitemap no longer list it.
- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Delete thesis and reset framing copy to neutral voice"
```

---

## Tasks 10-15: Migrate + de-preach the 23 articles

Each task takes one group, converts every article in it to `content/<section>/<slug>.md` (front-matter from the current HTML + `pages[]`), and **rewrites the body in the neutral voice** per the de-preach rubric in Global Constraints. Then regenerate and verify. These are editorial tasks: the "test" is the structural/validity `--check` plus a read-through against the rubric.

**Per-article steps (apply to each article in the group):**
- [ ] Extract `title`, `description`, `section`, `date` (full ISO; upgrade the current month-only value to a real date), and assign `tags`.
- [ ] Convert the `e-content` body to Markdown (headings→`###`/`####`, lists, blockquotes, code fences, pipe tables).
- [ ] Rewrite the prose in the neutral field-notes voice: cut "strong take / thesis / position / doctrine / belief", grand claims, and posturing; keep the technical content, tables, and code. Lowercase, no em-dashes.
- [ ] `node scripts/build.mjs` and confirm the article renders in the CRT theme; run `node scripts/build.mjs --check`.
- [ ] Commit the group.

**Groups:**
- [ ] **Task 10 — research A:** reward-hacking, reward-engineering, reward-rubric-dsl-adjacent set → reward-hacking, reward-engineering, agents-md-effectiveness, context-is-a-budget.
- [ ] **Task 11 — research B:** protocol-before-personality, specs-as-shared-reality, persona-anchors, what-is-prompting.
- [ ] **Task 12 — research C:** formal-verification-agents, enterprise-agent-design, sleepcast, techno-alexithymia.
- [ ] **Task 13 — workflows A:** claude-code-skills-stack, modular-workflow-stack, prompt-patterns, agent-psychology.
- [ ] **Task 14 — workflows B:** preference-toml, reward-rubric-dsl, ci-automation, project-ai-philosophy.
- [ ] **Task 15 — workflows C:** anubis-github-pages, instant-project-sync, psay-agent-notify.

Commit message per group, e.g.:
```bash
git add content research
git commit -m "Migrate + de-preach research group A"
```

---

## Task 16: Retire the old generator and dead assets

**Files:**
- Delete: `scripts/build-publisher-files.mjs`, `fonts/` (retired serif), any `pages[]` remnant
- Verify: tags/blog populated, feeds regenerated, links valid

- [ ] **Step 1:** Confirm `feeds.mjs` output matches the intended discovery surfaces for the full post set, then delete `scripts/build-publisher-files.mjs`.
- [ ] **Step 2:** Delete `fonts/` and remove the `@font-face` (already gone from `style.css`); grep the built site for `lora-hacked` → empty.
- [ ] **Step 3:** Full regenerate; run `--check`; sweep internal links (a small script asserting every `href="/…"` resolves to a generated file); confirm `tags/`, `tags/index.html`, `blog/index.html` are populated.
- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Retire build-publisher-files.mjs and the serif font assets"
```

---

## Task 17: Author docs + post template

**Files:**
- Modify: `README.md`
- Create: `content/_template.md`

- [ ] **Step 1:** Rewrite `README.md`: the new structure (`content/`, `scripts/build.mjs`), how to add a post (front-matter fields, supported Markdown, the voice rubric, lowercase + no-em-dash rules), and the build/deploy commands.
- [ ] **Step 2:** Add `content/_template.md` with the front-matter block and a short body stub (the generator skips files beginning with `_`).
- [ ] **Step 3:** Regenerate; confirm `_template.md` is not emitted as a page.
- [ ] **Step 4: Commit**

```bash
git add README.md content/_template.md scripts/build.mjs
git commit -m "Document authoring workflow and add post template"
```

---

## Task 18: Analytics + Search Console

**Files:**
- Create: `scripts/lib/config.mjs`
- Modify: `scripts/lib/templates.mjs` (`head()` reads config), `index.html` (splash)
- Test: `scripts/lib/templates.test.mjs` (extend)

**Interfaces:**
- Produces: `config.mjs` exports `{ siteUrl: "https://stayfresh.dev", ga4: "", searchConsole: "" }`. Author fills `ga4` (`G-XXXXXXX`) and `searchConsole` (verification token). `head()` emits the GA4 snippet only when `ga4` is non-empty, and the `<meta name="google-site-verification">` only when `searchConsole` is non-empty.

- [ ] **Step 1: Write the failing test** — with a stubbed config id set, `articlePage(post)` contains `gtag('config', 'G-TEST')` and `googletagmanager.com/gtag/js?id=G-TEST`; with a stubbed verification token, the head contains `<meta name="google-site-verification" content="tok123">`; with both empty, neither string appears. (Inject config via a small parameter or module override so the test is deterministic.)
- [ ] **Step 2: Run test, verify it fails** — `node --test scripts/lib/templates.test.mjs` → FAIL.
- [ ] **Step 3: Implement** — add `config.mjs`; in `head()`, conditionally emit the standard GA4 `gtag.js` async snippet and the verification meta. Add the same GA4 snippet + verification meta to the splash `index.html` head.
- [ ] **Step 4: Run test, verify it passes** — PASS.
- [ ] **Step 5: Manual (author, outside the build):** create the GA4 property + Search Console property for `stayfresh.dev`, paste the real `ga4` and `searchConsole` ids into `config.mjs`, regenerate, deploy, then submit `https://stayfresh.dev/sitemap.xml` in Search Console. Incoming search traffic appears in Search Console's Performance report; organic-search sessions appear in GA4.
- [ ] **Step 6: Commit**

```bash
git add scripts/lib/config.mjs scripts/lib/templates.mjs scripts/lib/templates.test.mjs index.html
git commit -m "Add GA4 analytics and Search Console verification via config"
```

---

## Self-Review Notes

- **Spec coverage:** engine (T1-T6), identity/theme (T7), splash + homepage relocation + IndieWeb (T8), thesis deletion + framing (T9), content migration + de-preach (T10-T15), old-generator retirement (T16), docs (T17), analytics + Search Console (T18). All spec sections map to tasks.
- **Type consistency:** `renderMarkdown`, `parseFrontmatter`, `articlePage/sectionIndex/tagPage/tagsIndex/blogIndex/homePage`, `rss/atom/jsonFeed/sitemap/llms`, `buildSite` are the fixed names used across tasks.
- **Ordering:** engine and templates precede content so migration can regenerate and verify against real templates. `style.css` (T7) lands before content review so pages are judged in the real theme. The old generator is deleted last (T16), after `feeds.mjs` proves out.
