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
