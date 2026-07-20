# StayFresh

Static archive of workflow research and patterns.

## Structure

- `/workflows/` - Practical patterns for AI-assisted development
- `/research/` - Empirical findings on AI workflow effectiveness
- `/sitemap.xml`, `/rss.xml`, `/atom.xml`, `/feed.json`, `/robots.txt`, `/llms.txt` - Machine-readable discovery surfaces

## IndieWeb

The site participates in the [IndieWeb](https://indieweb.org):

- **Identity**: the homepage carries `rel="me"` links (GitHub, email) and a
  representative [h-card](https://indieweb.org/h-card) in the footer, so
  `https://stayfresh.dev/` works as a web identity for
  [Web sign-in](https://indielogin.com).
- **Microformats2**: index pages are [h-feed](https://indieweb.org/h-feed)s of
  `h-entry` items; every article is an [h-entry](https://indieweb.org/h-entry)
  with `p-name`, `dt-published`, `e-content`, `u-url`, and `p-author`.
- **Webmentions**: every content page (home, indexes, thesis, workflows,
  research) advertises a [Webmention](https://indieweb.org/Webmention)
  endpoint hosted by [webmention.io](https://webmention.io).

One-time account setup (requires being logged in as the site owner):

1. Make sure the GitHub profile at <https://github.com/Evoke4350> lists
   `https://stayfresh.dev` as its website (that closes the `rel="me"` loop).
2. Sign in at <https://webmention.io> with `https://stayfresh.dev` to activate
   the webmention endpoint. Mentions can then be read from the webmention.io
   dashboard or API.
3. Optionally verify everything at <https://indiewebify.me>.

## License

MIT

## Publish Metadata

Rebuild sitemap, feed, and `llms.txt` files after adding or renaming pages:

`node scripts/build-publisher-files.mjs`
