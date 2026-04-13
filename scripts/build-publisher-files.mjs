// SPDX-License-Identifier: MIT
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const siteUrl = "https://stayfresh.dev";

const pages = [
  {
    path: "/",
    sourceFile: "index.html",
    title: "StayFresh",
    description: "Static archive of workflow research and patterns for AI-assisted development.",
    updated: "2026-04-07",
    includeInFeed: false
  },
  {
    path: "/thesis/",
    sourceFile: "thesis/index.html",
    title: "StayFresh Thesis",
    description: "The hard position behind the archive: reward surfaces, legible architecture, and tools that lower comprehension debt.",
    updated: "2026-03-29",
    includeInFeed: true
  },
  {
    path: "/workflows/",
    sourceFile: "workflows/index.html",
    title: "Workflows",
    description: "Practical patterns for AI-assisted development.",
    updated: "2026-04-07",
    includeInFeed: false
  },
  {
    path: "/research/",
    sourceFile: "research/index.html",
    title: "Research",
    description: "Empirical findings on AI workflow effectiveness.",
    updated: "2026-04-07",
    includeInFeed: false
  },
  {
    path: "/workflows/claude-code-skills-stack/",
    sourceFile: "workflows/claude-code-skills-stack/index.html",
    title: "Claude Code Skills Stack",
    description: "A practical three-layer stack for Claude Code: decision, context, and execution.",
    updated: "2026-04-07",
    includeInFeed: true
  },
  {
    path: "/workflows/modular-workflow-stack/",
    sourceFile: "workflows/modular-workflow-stack/index.html",
    title: "Modular Workflow Stack",
    description: "Right tool, right job, right time: layered orchestration, typed agent delegation, human-in-the-loop gates, parallelism, and loops with real halting conditions.",
    updated: "2026-04-07",
    includeInFeed: true
  },
  {
    path: "/workflows/anubis-github-pages/",
    sourceFile: "workflows/anubis-github-pages/index.html",
    title: "Anubis in Front of GitHub Pages",
    description: "How to put Anubis in front of a GitHub Pages site with a real reverse proxy and no proxy-loop nonsense.",
    updated: "2026-03-29",
    includeInFeed: true
  },
  {
    path: "/workflows/instant-project-sync/",
    sourceFile: "workflows/instant-project-sync/index.html",
    title: "Instant Project Sync",
    description: "Synchronize ticket queues against contract dates and repository evidence, with requirement reconstruction when docs are missing.",
    includeInFeed: true
  },
  {
    path: "/workflows/psay-agent-notify/",
    sourceFile: "workflows/psay-agent-notify/index.html",
    title: "psay Agent Notifications",
    description: "Local voice and Notification Center loops for agent completion, handoff, and operator recall.",
    includeInFeed: true
  },
  {
    path: "/workflows/project-ai-philosophy/",
    sourceFile: "workflows/project-ai-philosophy/index.html",
    title: "Project AI Philosophy",
    description: "A written position for bounded, evidence-backed AI use in delivery.",
    includeInFeed: true
  },
  {
    path: "/workflows/preference-toml/",
    sourceFile: "workflows/preference-toml/index.html",
    title: "Preference TOML",
    description: "Use RLHF-shaped semantics in a simple config DSL for agent evaluation loops.",
    includeInFeed: true
  },
  {
    path: "/workflows/reward-rubric-dsl/",
    sourceFile: "workflows/reward-rubric-dsl/index.html",
    title: "Reward Rubric DSL",
    description: "A small machine-readable format for scoring coding agent output.",
    includeInFeed: true
  },
  {
    path: "/workflows/prompt-patterns/",
    sourceFile: "workflows/prompt-patterns/index.html",
    title: "Prompt Patterns",
    description: "Common prompt structures for reliable agent behavior.",
    includeInFeed: true
  },
  {
    path: "/workflows/agent-psychology/",
    sourceFile: "workflows/agent-psychology/index.html",
    title: "Agent Psychology",
    description: "Understanding how agents reason and respond to instructions.",
    includeInFeed: true
  },
  {
    path: "/workflows/ci-automation/",
    sourceFile: "workflows/ci-automation/index.html",
    title: "CI Automation with AI Agents",
    description: "Integrating AI agents with continuous integration workflows.",
    includeInFeed: true
  },
  {
    path: "/research/context-is-a-budget/",
    sourceFile: "research/context-is-a-budget/index.html",
    title: "Context Is a Budget",
    description: "More tokens do not create more truth. Context should be spent where it changes the next decision.",
    updated: "2026-04-07",
    includeInFeed: true
  },
  {
    path: "/research/protocol-before-personality/",
    sourceFile: "research/protocol-before-personality/index.html",
    title: "Protocol Before Personality",
    description: "Shared artifacts and exit conditions beat charisma, cosplay, and fake seniority.",
    updated: "2026-04-07",
    includeInFeed: true
  },
  {
    path: "/research/specs-as-shared-reality/",
    sourceFile: "research/specs-as-shared-reality/index.html",
    title: "Specs as Shared Reality",
    description: "Agents do not share understanding. They share binding artifacts, versions, and tests.",
    updated: "2026-04-07",
    includeInFeed: true
  },
  {
    path: "/research/reward-engineering/",
    sourceFile: "research/reward-engineering/index.html",
    title: "Reward Engineering for Coding Agents",
    description: "Why coding agents optimize the rubric more than the prompt.",
    includeInFeed: true
  },
  {
    path: "/research/reward-hacking/",
    sourceFile: "research/reward-hacking/index.html",
    title: "Reward Hacking in Coding Agents",
    description: "How poorly designed metrics produce plausible but unstable code.",
    includeInFeed: true
  },
  {
    path: "/research/agents-md-effectiveness/",
    sourceFile: "research/agents-md-effectiveness/index.html",
    title: "AGENTS.md Effectiveness",
    description: "Evaluating repository-level context files for coding agents.",
    includeInFeed: true
  },
  {
    path: "/research/formal-verification-agents/",
    sourceFile: "research/formal-verification-agents/index.html",
    title: "Formal Verification with Agents",
    description: "Property-based testing and specification generation.",
    includeInFeed: true
  },
  {
    path: "/research/enterprise-agent-design/",
    sourceFile: "research/enterprise-agent-design/index.html",
    title: "Enterprise Agent Design",
    description: "BCG framework for production-grade agents.",
    includeInFeed: true
  },
  {
    path: "/research/persona-anchors/",
    sourceFile: "research/persona-anchors/index.html",
    title: "Persona Anchors",
    description: "Character-based instruction patterns for consistent agent behavior.",
    includeInFeed: true
  },
  {
    path: "/research/what-is-prompting/",
    sourceFile: "research/what-is-prompting/index.html",
    title: "What is Prompting: Operational Constraints",
    description: "Prompting is a constrained pipeline where tokenization, max tokens, and control tokens form the operational boundaries that determine agent behavior.",
    updated: "2026-04-07",
    includeInFeed: true
  }
];

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function isoDate(value) {
  return value.length === 10 ? value + "T00:00:00Z" : value;
}

function absoluteUrl(pagePath) {
  if (pagePath === "/") return siteUrl + "/";
  return siteUrl + pagePath;
}

function gitUpdatedDate(sourceFile) {
  try {
    const output = execFileSync(
      "git",
      ["log", "-1", "--format=%cs", "--", sourceFile],
      { cwd: root, encoding: "utf8" }
    ).trim();
    return output || null;
  } catch {
    return null;
  }
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(root, relativePath), content);
}

const resolvedPages = pages.map((page) => ({
  ...page,
  updated: page.updated || gitUpdatedDate(page.sourceFile) || "2026-03-19"
}));
const pageByPath = new Map(resolvedPages.map((page) => [page.path, page]));

const feedItems = resolvedPages
  .filter((page) => page.includeInFeed)
  .sort((a, b) => isoDate(b.updated).localeCompare(isoDate(a.updated)));

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
];

for (const page of resolvedPages) {
  sitemap.push("  <url>");
  sitemap.push("    <loc>" + xmlEscape(absoluteUrl(page.path)) + "</loc>");
  sitemap.push("    <lastmod>" + xmlEscape(page.updated) + "</lastmod>");
  sitemap.push("  </url>");
}
sitemap.push("</urlset>");

const rss = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<rss version="2.0">',
  "  <channel>",
  "    <title>StayFresh</title>",
  "    <link>" + xmlEscape(siteUrl + "/") + "</link>",
  "    <description>Static archive of workflow research and patterns for AI-assisted development.</description>",
  "    <language>en-us</language>",
  "    <lastBuildDate>" + new Date(isoDate(feedItems[0].updated)).toUTCString() + "</lastBuildDate>"
];

for (const item of feedItems) {
  rss.push("    <item>");
  rss.push("      <title>" + xmlEscape(item.title) + "</title>");
  rss.push("      <link>" + xmlEscape(absoluteUrl(item.path)) + "</link>");
  rss.push("      <guid>" + xmlEscape(absoluteUrl(item.path)) + "</guid>");
  rss.push("      <pubDate>" + new Date(isoDate(item.updated)).toUTCString() + "</pubDate>");
  rss.push("      <description>" + xmlEscape(item.description) + "</description>");
  rss.push("    </item>");
}
rss.push("  </channel>");
rss.push("</rss>");

const atom = [
  '<?xml version="1.0" encoding="utf-8"?>',
  '<feed xmlns="http://www.w3.org/2005/Atom">',
  "  <title>StayFresh</title>",
  '  <subtitle>Static archive of workflow research and patterns for AI-assisted development.</subtitle>',
  '  <link href="' + xmlEscape(siteUrl + "/atom.xml") + '" rel="self"/>',
  '  <link href="' + xmlEscape(siteUrl + "/") + '"/>',
  "  <updated>" + xmlEscape(isoDate(feedItems[0].updated)) + "</updated>",
  "  <id>" + xmlEscape(siteUrl + "/") + "</id>"
];

for (const item of feedItems) {
  atom.push("  <entry>");
  atom.push("    <title>" + xmlEscape(item.title) + "</title>");
  atom.push('    <link href="' + xmlEscape(absoluteUrl(item.path)) + '"/>');
  atom.push("    <id>" + xmlEscape(absoluteUrl(item.path)) + "</id>");
  atom.push("    <updated>" + xmlEscape(isoDate(item.updated)) + "</updated>");
  atom.push("    <summary>" + xmlEscape(item.description) + "</summary>");
  atom.push("  </entry>");
}
atom.push("</feed>");

const jsonFeed = {
  version: "https://jsonfeed.org/version/1.1",
  title: "StayFresh",
  home_page_url: siteUrl + "/",
  feed_url: siteUrl + "/feed.json",
  description: "Static archive of workflow research and patterns for AI-assisted development.",
  language: "en-US",
  authors: [{ name: "StayFresh" }],
  items: feedItems.map((item) => ({
    id: absoluteUrl(item.path),
    url: absoluteUrl(item.path),
    title: item.title,
    summary: item.description,
    date_published: isoDate(item.updated),
    date_modified: isoDate(item.updated)
  }))
};

const robots = [
  "User-agent: *",
  "Allow: /",
  "",
  "Sitemap: " + siteUrl + "/sitemap.xml",
  ""
];

function llmsLink(pagePath, note) {
  const page = pageByPath.get(pagePath);
  if (!page) throw new Error("Missing page for llms.txt: " + pagePath);
  return "- [" + page.title + "](" + absoluteUrl(page.path) + "): " + note;
}

const llms = [
  "# StayFresh",
  "",
  "> Static archive of workflow research and patterns for AI-assisted development, with practical notes for keeping static sites useful and less scrapeable.",
  "",
  "Use the thesis first for doctrine, then workflows for implementation patterns, then research for supporting evidence. Canonical HTML pages are listed below. Markdown mirrors are not published yet.",
  "",
  "## Start Here",
  "",
  llmsLink("/", "Homepage with the thesis, workflow index, and the GitHub Pages plus Anubis deployment pattern."),
  llmsLink("/thesis/", "Best single starting point. Explains the site's position on reward surfaces, architecture, and comprehension debt."),
  llmsLink("/workflows/", "Index of practical workflow patterns."),
  llmsLink("/research/", "Index of supporting research notes."),
  "",
  "## Site and Operations",
  "",
  llmsLink("/workflows/anubis-github-pages/", "How to front a GitHub Pages site with Anubis using Caddy or Nginx without creating a proxy loop."),
  llmsLink("/workflows/instant-project-sync/", "Ticket-to-contract evidence sync for delivery operations."),
  llmsLink("/workflows/psay-agent-notify/", "Operator alerts via local voice and notifications for long-running agent work."),
  llmsLink("/workflows/project-ai-philosophy/", "How client AI policy gets translated into bounded operating rules."),
  "",
  "## Agent Workflow Patterns",
  "",
  llmsLink("/workflows/claude-code-skills-stack/", "A practical three-layer Claude Code stack: decision, context, and execution."),
  llmsLink("/workflows/modular-workflow-stack/", "Three-layer model for orchestration, context stability, and execution: role-based routing, human gates, parallelism, and loop patterns."),
  llmsLink("/workflows/preference-toml/", "Simple config shape for critique, selection, and evaluation loops."),
  llmsLink("/workflows/reward-rubric-dsl/", "Machine-readable rubric pattern for scoring agent output."),
  llmsLink("/workflows/prompt-patterns/", "Prompt structures that reduce token waste and instruction bloat."),
  llmsLink("/workflows/agent-psychology/", "Observed behavior patterns for coding agents and how to use them."),
  llmsLink("/workflows/ci-automation/", "Continuous integration patterns for agent loops, halting, and review."),
  "",
  "## Research",
  "",
  llmsLink("/research/context-is-a-budget/", "Why agent context should be treated as a scarce budget rather than an everything bucket."),
  llmsLink("/research/protocol-before-personality/", "Why multi-agent coordination depends more on handoff rules than on persona prompts."),
  llmsLink("/research/specs-as-shared-reality/", "How specs become the closest thing agent workflows have to a common truth."),
  llmsLink("/research/reward-engineering/", "Why rubrics shape agent behavior more than prompts."),
  llmsLink("/research/reward-hacking/", "Failure modes caused by narrow or gameable evaluation."),
  llmsLink("/research/agents-md-effectiveness/", "Evidence on repository instruction files and why they often add cost without helping."),
  llmsLink("/research/formal-verification-agents/", "Property-based testing and specification generation with agents."),
  llmsLink("/research/enterprise-agent-design/", "Enterprise design patterns for production-grade agents."),
  llmsLink("/research/persona-anchors/", "How named styles and persona anchors change agent behavior."),
  "",
  "## Optional",
  "",
  "- [RSS Feed](" + siteUrl + "/rss.xml): Recent site updates in RSS 2.0 format.",
  "- [Atom Feed](" + siteUrl + "/atom.xml): Recent site updates in Atom 1.0 format.",
  "- [JSON Feed](" + siteUrl + "/feed.json): Machine-readable feed for applications that prefer JSON.",
  "- [XML Sitemap](" + siteUrl + "/sitemap.xml): Full canonical URL inventory for crawlers.",
  "- [GitHub Repository](https://github.com/Evoke4350/stayfresh.dev): Source repository for the site."
];

writeFile("sitemap.xml", sitemap.join("\n") + "\n");
writeFile("rss.xml", rss.join("\n") + "\n");
writeFile("atom.xml", atom.join("\n") + "\n");
writeFile("feed.json", JSON.stringify(jsonFeed, null, 2) + "\n");
writeFile("robots.txt", robots.join("\n"));
writeFile("llms.txt", llms.join("\n") + "\n");
