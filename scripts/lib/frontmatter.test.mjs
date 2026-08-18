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
