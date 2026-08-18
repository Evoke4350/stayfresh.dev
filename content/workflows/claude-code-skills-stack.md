---
title: claude code skills stack
description: a practical three-layer stack for claude code: decision, context, and execution.
section: workflows
date: 2026-04-07
tags: [claude-code, skills, orchestration]
draft: false
---

installing every shiny skill pack is not a workflow. it is a haunted attic with autocomplete.

the stable stack is three layers: **decision**, **context**, and **execution**. each layer gets one clear job, or the session turns into token confetti.

### the take

opinionated planning skills decide what should happen. a small context system keeps state from rotting. execution skills write, test, review, and close the loop.

the three layers do not all talk at once on every task. that is how a two-line patch becomes a committee meeting.

### default stack

| layer | job | keep | do not let it become |
|---|---|---|---|
| decision | scope, tradeoffs, sequencing | one or two high-value planning skills | a permanent board of directors |
| context | goals, constraints, state, open questions | small durable files and summaries | a second codebase made of stale notes |
| execution | implementation, tests, verification, closeout | the strongest build-and-check loop | an excuse to skip judgment |

### routing rule

routing is by task shape, not by framework fandom.

- **fuzzy requirement** - decision skills run first
- **long-running feature or multi-session work** - context gets updated before more coding
- **clear scoped change** - goes straight to execution
- **tiny fix** - skips half the ceremony and ships the patch

### why this structure holds up

the late-2025 to early-2026 research is not subtle about it.

- **december 18, 2025:** paace showed plan-aware context compression can improve correctness while cutting context load. context quality matters more than context bulk.
- **december 20, 2025:** swe-evo showed software evolution tasks stay hard because agents still struggle with long-horizon, multi-file work in realistic repositories.
- **january 8, 2026:** ide-bench argued that real engineering work is collaborative, iterative, and tool-heavy, which is exactly where sloppy skill piles start wasting time.
- **february 4, 2026:** omnicode showed agents that look decent on narrow patch benchmarks still fall apart across broader software tasks like test generation and review fixing.
- **march 15, 2026:** swe-skills-bench found that most software-engineering skills had no measurable value and a lot of them imposed heavy token overhead. more skills was usually just more billable confusion.

### practical policy

1. one execution stack is chosen as the default.
2. one decision layer is added only for work that is still under-specified.
3. context artifacts stay short enough to survive rereading.
4. overlapping skills get retired. duplicate roles are just prompt inflation wearing a fake mustache.
5. token cost gets reviewed the same way review time gets reviewed. waste is still waste when it looks intelligent.

### minimal operating shape

```
1. decide:
   - clarify goal
   - reject bad scope
   - lock success criteria
2. stabilize context:
   - project summary
   - active constraints
   - current decision log
3. execute:
   - implement
   - test
   - review
   - verify
4. compress:
   - write back only what future work needs
```

### what to steal from the current claude code discourse

the april 6, 2026 dev article on combining superpowers, gstack, and gsd got the broad framing right: decision, context, and execution are different jobs.

the stricter version here is simpler: the layer split stays, but not every task deserves the full stack. most do not.

one decision layer, one context layer, one execution layer. anything beyond that needs to earn its keep or get cut.

### references

- [yaohua chen, "a claude code skills stack: how to combine superpowers, gstack, and gsd without the chaos"](https://dev.to/imaginex/a-claude-code-skills-stack-how-to-combine-superpowers-gstack-and-gsd-without-the-chaos-44b3) (dev community, april 6, 2026)
- [swe-skills-bench: evaluating software engineering skills of language agents](https://arxiv.org/abs/2603.11934) (march 15, 2026)
- [omnicode: a benchmark for evaluating software engineering agents](https://arxiv.org/abs/2602.02262) (february 4, 2026)
- [ide-bench: a benchmark for software engineering agents in integrated development environments](https://arxiv.org/abs/2601.13102) (january 21, 2026)
- [swe-evo: evolving the evaluation of language model software engineering agents](https://arxiv.org/abs/2512.18241) (december 20, 2025)
- [paace: a plan-aware automated agent context engineering framework](https://arxiv.org/abs/2512.16970) (december 18, 2025)
