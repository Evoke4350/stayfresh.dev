import { test } from "node:test";
import assert from "node:assert/strict";
import {
  articlePage,
  sectionIndex,
  tagPage,
  tagsIndex,
  blogIndex,
  homePage,
} from "./templates.mjs";

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

const posts = [
  { title: "reward hacking", description: "d1", date: "2026-04-13", path: "/research/reward-hacking/", tags: ["rubrics"] },
  { title: "context is a budget", description: "d2", date: "2025-01-05", path: "/research/context-is-a-budget/", tags: ["context"] },
];

test("sectionIndex: h-feed with article-list rows and house head/footer", () => {
  const h = sectionIndex("research", posts);
  assert.match(h, /<main class="h-feed">/);
  assert.match(h, /<link rel="canonical" href="https:\/\/stayfresh\.dev\/research\/">/);
  assert.match(h, /rel="alternate" type="application\/rss\+xml"/);
  assert.match(h, /class="article-list"/);
  assert.match(h, /<li class="h-entry">/);
  assert.match(h, /<a class="title u-url p-name" href="\/research\/reward-hacking\/">reward hacking<\/a>/);
  assert.match(h, /<p class="p-summary">d1<\/p>/);
  assert.match(h, /<footer class="h-card">/);
});

test("tagPage: h-feed list, tag text and href escaped", () => {
  const h = tagPage("a&b", posts);
  assert.match(h, /<main class="h-feed">/);
  assert.match(h, /<link rel="canonical" href="https:\/\/stayfresh\.dev\/tags\/a&amp;b\/">/);
  assert.match(h, /<h2>a&amp;b<\/h2>/);
  assert.match(h, /class="article-list"/);
  assert.match(h, /<a class="title u-url p-name" href="\/research\/reward-hacking\/">reward hacking<\/a>/);
  assert.match(h, /<footer class="h-card">/);
});

test("tagsIndex: chip list with escaped tag text/href and counts", () => {
  const h = tagsIndex({ "a&b": 3, rubrics: 1 });
  assert.match(h, /<main class="h-feed">/);
  assert.match(h, /<link rel="canonical" href="https:\/\/stayfresh\.dev\/tags\/">/);
  assert.match(h, /<a href="\/tags\/a&amp;b\/">a&amp;b \(3\)<\/a>/);
  assert.match(h, /<a href="\/tags\/rubrics\/">rubrics \(1\)<\/a>/);
  assert.match(h, /<footer class="h-card">/);
});

test("blogIndex: chronological h-feed with article-list rows", () => {
  const h = blogIndex(posts);
  assert.match(h, /<main class="h-feed">/);
  assert.match(h, /<link rel="canonical" href="https:\/\/stayfresh\.dev\/blog\/">/);
  assert.match(h, /class="article-list"/);
  assert.match(h, /<a class="title u-url p-name" href="\/research\/context-is-a-budget\/">context is a budget<\/a>/);
  assert.match(h, /<p class="p-summary">d2<\/p>/);
  assert.match(h, /<footer class="h-card">/);
});

test("homePage: h-feed sections with article-list rows and full rel=me + h-card", () => {
  const h = homePage([{ name: "research", intro: "field notes.", posts }]);
  assert.match(h, /<main class="h-feed">/);
  assert.match(h, /<link rel="canonical" href="https:\/\/stayfresh\.dev\/home\/">/);
  assert.match(h, /<link rel="me" href="https:\/\/github\.com\/Evoke4350">/);
  assert.match(h, /<link rel="me" href="mailto:nathanib@pm\.me">/);
  assert.match(h, /class="article-list"/);
  assert.match(h, /<a class="title u-url p-name" href="\/research\/reward-hacking\/">reward hacking<\/a>/);
  assert.match(h, /<footer class="h-card">/);
  assert.match(h, /rel="me" href="mailto:nathanib@pm\.me">nathanib@pm\.me<\/a>/);
});
