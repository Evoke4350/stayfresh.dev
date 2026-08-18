---
title: project ai philosophy
description: a written position for bounded, evidence-backed ai use in delivery.
section: workflows
date: 2026-04-13
tags: [policy, governance, delivery]
draft: false
---

this document is a written position for projects using generative systems.

absent policy, default governance becomes novelty pressure, convenience, and untracked risk.

### position

ai is used inside bounded workflows.

acceptable roles: drafting, summarization, retrieval, code scaffolding, critique, evaluation, and repetitive local automation.

unacceptable roles: hidden authority, unsupervised publication, irreversible state changes, invented expertise, and persuasion without evidence.

### control surface

- **explicit scope** - named task, named inputs, named completion condition
- **evidence required** - sources, tests, diffs, logs, screenshots, or reproducible traces
- **human gate on irreversible actions** - merge, deploy, publish, delete, charge, notify, or mutate production data
- **reversibility first** - rollback path before automation depth
- **failure legibility** - uncertainty, missing context, blocked tools, and assumption drift surfaced in plain language
- **cost discipline** - token spend, latency, and review burden treated as engineering costs
- **local fit** - repository conventions outrank model preferences

### operational standard

best use cases share five properties: bounded context, available verification, low blast radius, clear ownership, and reversible outcome.

worst use cases share the opposite pattern: vague goals, hidden dependencies, weak review, social pressure, and no rollback.

### required questions

1. task class
2. evidence source
3. approval gate
4. rollback method
5. maximum acceptable failure

### anti-patterns

- **ai-first as strategy** - slogan in place of a user problem
- **assistant prose as evidence** - polished language mistaken for verified fact
- **autonomy by boredom** - dangerous delegation justified by repetitive work
- **evaluation theater** - quality claims with no tests, no rubric, and no citations
- **interface cosplay** - chat wrapper added where a form, script, or search box would work better

### minimum spec

```
[ai]
role = "bounded assistant"
allowed = ["drafting", "retrieval", "summarization", "critique", "code_scaffolding"]
forbidden = ["unreviewed_publish", "unreviewed_deploy", "production_mutation", "invented_citation"]
required = ["task_scope", "evidence", "owner", "approval_gate", "rollback_path"]
success = ["correctness", "traceability", "reversibility", "review_cost"]
```

### reference pattern

- [kagi ai philosophy](https://help.kagi.com/kagi/why-kagi/ai-philosophy.html) - product-level boundary setting with clear scope and limits

### bottom line

good ai policy reduces ambiguity, not labor.

good ai policy preserves judgment, surfaces evidence, and narrows blast radius.

remaining variants reduce to marketing attached to tooling.
