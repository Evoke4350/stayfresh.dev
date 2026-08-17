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
