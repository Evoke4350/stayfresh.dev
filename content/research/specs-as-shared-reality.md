---
title: specs as shared reality
description: agents do not share understanding. they share binding artifacts, versions, and tests.
section: research
date: 2026-04-07
tags: [specs, coordination, versioning, testing]
draft: false
---

agents didn't share understanding in any mystical sense. they didn't "align" by wanting the same thing. when they aligned at all, it was by reading the same artifacts and being judged against the same boundaries.

the spec was the closest thing an agent workflow had to common reality.

### what held up

> if the truth of the task only existed in conversation history, the task did not have a durable truth.

human teams could survive a surprising amount of ambiguity because they carried shared background, tacit knowledge, and the ability to ask follow-up questions. agents were worse at all three.

that changed the epistemology of delivery. instead of asking whether the model "understood," the more useful question was: what artifact would make misunderstanding harder?

### conversation as an unstable substrate

conversation history felt like shared reality because it was chronologically complete. that wasn't the same thing as being authoritative.

history contained:

- draft ideas
- obsolete assumptions
- midstream reversals
- soft language that never became a decision
- local clarifications buried under later turns

asking each new agent to reconstruct truth from that pile wasn't robust. it amounted to archaeological guesswork.

### what a spec did

a spec didn't need to be grand or bureaucratic. it just needed to collapse uncertainty into a current, inspectable statement.

at minimum, a useful spec named:

- the objective
- the actors
- the expected behavior
- the constraints
- the rejection conditions

```
feature: webhook retry backoff

objective:
  prevent rapid retry storms on downstream failure

behavior:
  - failed deliveries retry with exponential backoff
  - max attempts default to 5
  - terminal failure emits metric and marks delivery dead

constraints:
  - no schema changes
  - preserve current API payload shape
  - reuse existing queue system

reject_if:
  - retries become unbounded
  - delivery ordering semantics change
  - failure metrics disappear
```

that was enough to ground planning, implementation, qa, and review in the same world.

### specs versus memory

memory was useful for durable preferences and persistent facts. specs worked better for current truth because they were explicit, local, and revisable on purpose.

memories lingered. specs could be versioned, superseded, diffed, and approved. a good spec functioned as a legitimacy mechanism.

### shared reality needed versioning

the moment multiple agents or sessions touched the same feature, versioning stopped being optional.

if one agent read spec v2 and another implemented against v1, the team no longer shared a reality. it shared a category name.

```
spec: specs/auth-v2.md
version: 6f1e0d9
status: approved
supersedes: auth-v1.md
```

that small bit of ceremony paid for itself quickly. it prevented the quiet chaos where everyone assumed they were talking about the same thing because the filename still sounded familiar.

### tests as spec fragments

tests didn't replace specs. they did, however, encode parts of the same reality.

the workflows that worked best made the relationship explicit:

- spec said what should happen
- tests proved selected claims about what should happen
- implementation attempted to satisfy both

when the spec and tests disagreed, that disagreement was useful signal. it showed the workflow didn't actually have one truth yet.

### what happened without a spec

#### planning drifted into invention

the planning step quietly became requirements generation.

#### implementation overfit to the last message

the coder agent obeyed whatever was said most recently, whether or not it outranked the rest of the project.

#### review turned vague

without a grounded artifact, review comments became aesthetic: "this feels wrong," "maybe cleaner," "not quite what was intended." nobody could point to shared truth.

#### handoffs became storytelling

instead of passing a stable document, agents summarized their own interpretation of what happened. every handoff introduced a chance to mutate reality by accident.

### writing specs for agents

traditional specs often assumed patient human readers who could tolerate narrative, politics, and historical context. agent-facing specs worked better tighter.

the specs that worked were:

- operational instead of inspirational
- bounded instead of visionary
- explicit about rejection conditions
- split into sections that could be referenced directly
- short enough to reload without resentment

this also tended to help human readers.

### specs needed update rules

a stale spec was worse than no spec because it advertised confidence it didn't deserve.

every workflow needed an answer for:

- who was allowed to change the spec
- which changes needed human approval
- how downstream agents were told a revision happened
- whether in-flight work had to restart on spec change

without that policy, "the spec" was just a nice-looking prop.

### the human-agent treaty

the spec was where human intent became something the system could inspect repeatedly without asking the human to restate it every time.

this mattered because repeated restatement was a hidden tax. each retelling introduced drift, omission, and accidental re-prioritization. a spec stopped that bleed by turning intent into a revisable object.

### what tended to work

1. a spec got written before parallel work began.
2. it got versioned once multiple sessions or agents depended on it.
3. it stayed shorter than the conversation it replaced.
4. tests and rubrics linked back to it explicitly.
5. undocumented midstream changes got treated as scope changes, not casual chat.

agents didn't need a perfect theory of the project. they needed the same binding artifact, the same revision history, and the same criteria for being wrong. that's what shared reality looked like in practice.

### further reading

- [project ai philosophy](/workflows/project-ai-philosophy/): why bounded operating rules mattered
- [modular workflow stack](/workflows/modular-workflow-stack/): specs as a distinct context layer
- [context is a budget](/research/context-is-a-budget/): why stable truth should be compressed, not endlessly repeated
