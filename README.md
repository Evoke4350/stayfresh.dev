# StayFresh

Static archive of workflow research and patterns.

## Structure

- `/workflows/` - Practical patterns for AI-assisted development
- `/research/` - Empirical findings on AI workflow effectiveness
- `/sitemap.xml`, `/rss.xml`, `/atom.xml`, `/feed.json`, `/robots.txt`, `/llms.txt` - Machine-readable discovery surfaces

## License

MIT

## Publish Metadata

Rebuild sitemap, feed, and `llms.txt` files after adding or renaming pages:

`node scripts/build-publisher-files.mjs`
