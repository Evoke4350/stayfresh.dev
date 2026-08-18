# StayFresh

Notes on AI-assisted development. A zero-dependency static site generated from Markdown.

## Structure

- `content/<section>/<slug>.md` - the source of truth. Sections are `research` and `workflows`.
- `scripts/build.mjs` - the generator (Node ESM, no dependencies).
- `scripts/lib/` - `frontmatter.mjs`, `markdown.mjs`, `templates.mjs`, `feeds.mjs`, `config.mjs`.
- `style.css` - the CRT reading theme (single dark theme).
- `index.html` - the WebGL splash at `/`; `ENTER` leads to `/home/`.
- Generated output (committed): `<section>/<slug>/index.html`, `research/`, `workflows/`, `tags/`, `blog/`, `home/`, and the discovery surfaces `rss.xml`, `atom.xml`, `feed.json`, `sitemap.xml`, `llms.txt`.

## Adding a post

Create `content/<section>/<slug>.md` (copy `content/_template.md`). Front-matter:

```
---
title: your lowercase title
description: one lowercase sentence for the meta description and feed summary.
section: research        # research | workflows
date: 2026-08-18         # full ISO YYYY-MM-DD; feeds use it, display shows the month
tags: [kebab-case, tags]
draft: false             # true keeps it out of the build entirely
---
```

Then write the body in the supported Markdown subset: `###`/`####` headings (do not repeat the title), paragraphs, `-` and `1.` lists, `>` blockquotes, fenced and indented code, GFM pipe tables, and inline `**bold**` / `*italic*` / `` `code` `` / `[text](url)`.

Files whose basename starts with `_` are skipped, so `content/_template.md` is never published.

## Voice

- Neutral technical field-notes: factual, understated, impersonal.
- No first-person narrator voice (no `i`, `we`, `my`, `our`). First person inside a quote or citation is fine.
- No doctrine / manifesto / "strong take" framing, no grand claims.
- All prose lowercase. Code and URLs keep their case.
- No em-dashes. Use a comma or a period.

## Build and deploy

```
node scripts/build.mjs           # regenerate the whole site from content/
node scripts/build.mjs --check   # build into a temp dir and assert invariants; writes nothing
```

Commit the generated output. GitHub Pages serves the static files; there is no CI build step. `scripts/deploy-eepsite.sh` stages the site for an i2p eepsite.

## IndieWeb

The site participates in the [IndieWeb](https://indieweb.org):

- **Identity**: `/` and `/home/` carry `rel="me"` links (GitHub, email) and a representative [h-card](https://indieweb.org/h-card), so `https://stayfresh.dev/` works as a web identity for [Web sign-in](https://indielogin.com).
- **Microformats2**: index pages are [h-feed](https://indieweb.org/h-feed)s of `h-entry` items; every article is an [h-entry](https://indieweb.org/h-entry) with `p-name`, `dt-published`, `e-content`, `u-url`, and `p-author`.
- **Webmentions**: every content page advertises a [Webmention](https://indieweb.org/Webmention) endpoint hosted by [webmention.io](https://webmention.io).

## Analytics

Google Analytics 4 is injected by `head()` when `ga4` is set in `scripts/lib/config.mjs`. Google Search Console verifies ownership via the linked GA property.

## License

MIT.
