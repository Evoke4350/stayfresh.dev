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
test("unordered list nesting (2-space indent)", () => {
  assert.equal(
    renderMarkdown("- a\n  - b\n- c").replace(/\s+/g, " ").trim(),
    "<ul> <li>a <ul> <li>b</li> </ul></li> <li>c</li> </ul>"
  );
});
test("ordered list nesting (2-space indent)", () => {
  assert.equal(
    renderMarkdown("1. a\n  1. b\n2. c").replace(/\s+/g, " ").trim(),
    "<ol> <li>a <ol> <li>b</li> </ol></li> <li>c</li> </ol>"
  );
});
test("empty input", () => {
  assert.equal(renderMarkdown("").trim(), "");
});
test("blank-line-separated multi-block doc", () => {
  const out = renderMarkdown("hello\n\n- a\n- b").replace(/\s+/g, " ").trim();
  assert.equal(out, "<p>hello</p> <ul> <li>a</li> <li>b</li> </ul>");
});
test("gfm table with header + delimiter but no body rows", () => {
  const out = renderMarkdown("| a | b |\n| --- | --- |").replace(/\s+/g, " ").trim();
  assert.equal(
    out,
    "<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody></tbody></table>"
  );
});
