---
title: context is a budget
description: more tokens do not create more truth; useful context is what changes the next decision.
section: research
date: 2026-04-07
tags: [context, memory, prompting]
draft: false
---

agent operators often talk about context like it's free. it isn't. every extra token costs something: money, latency, retrieval noise, weaker focus, and more chances for stale information to pass as current.

in practice, context earned its place when it changed the next decision. everything else was overhead.

### what context actually buys

useful context did one of four jobs:

- exposed the current objective
- stated the active constraints
- showed the artifact under change
- defined how success would be judged

if a block of text didn't help with one of those four jobs, it was usually there because nobody had decided what mattered.

### the common failure

most agent setups ran into one of two problems: dumping in everything "just in case," or stacking summaries of summaries until the system could no longer tell current truth from yesterday's interpretation of it.

the result looked thorough. it usually wasn't. wide context often made agents more responsive to whatever was easiest to quote, not whatever was most relevant to the live decision.

### why more context didn't mean more truth

truth in an agent workflow isn't the total volume of available text, it's the subset that still governs the present task. a stale note, an old roadmap, an outdated readme section, and a one-line user correction don't carry equal authority. once they land in the same prompt, though, they start competing as peers.

that's the core problem with context inflation: it flattens authority. the model sees everything, and it's easy to forget that not everything should count equally.

### authority matters more than recall

useful context turned out to be hierarchical:

- **highest authority**: current spec, explicit user correction, failing test, live interface contract
- **middle authority**: recent decision log, current implementation, current task brief
- **low authority**: brainstorming notes, old summaries, generic project background

most teams have this hierarchy implicitly. few encode it explicitly, which is often why an agent keeps citing outdated notes as if they still applied.

### four uses of context that held up

#### 1. state the objective

what's happening right now, not what the project is "about" in general. a concrete example:

```
task: add retry backoff to outbound webhook delivery
done_when:
  - retries use exponential backoff
  - max attempt count is configurable
  - existing webhook tests pass
  - failure metrics remain emitted
```

#### 2. state the constraints

clear constraints save tokens because they rule out branches of thought before the model wanders into them.

```
constraints:
  - do not change database schema
  - preserve public api response shape
  - prefer existing queue abstractions
  - no new dependencies
```

#### 3. show the work surface

the most valuable context was usually the artifact under change: the file, interface, failing test, log line, schema, or diff, not a summary of the repository.

#### 4. define judgment

agents behaved more predictably when the evaluation surface was present. see [reward engineering for coding agents](/research/reward-engineering/). when success is visible, less narration is needed.

### bad context smells

- long codebase overviews before a narrow task
- duplicate summaries at multiple levels of abstraction
- persona text that outranks operational facts
- old decisions with no validity window
- notes that restate what the code already says clearly
- entire browser snapshots pasted into every turn

when context starts looking like archival preservation, the workflow has usually already drifted.

### memory is not a junk drawer

persistent memory is often sold as the fix for drift. sometimes it is, often it just preserves mistakes at scale. memory helped most when it stored things that should survive task boundaries:

- stable project facts
- decisions that remain binding
- open questions that still block progress
- operator preferences that genuinely affect output

everything else tended to decay anyway, and letting it do so on purpose worked better than trying to keep it all.

### compression beats accumulation

operators who compressed state after each meaningful step did better than ones who accumulated every intermediate thought because deleting anything felt risky. compression here isn't summarization for its own sake, it means writing the smallest artifact that preserves the next valid move.

```
current_state:
  objective: ship webhook backoff without api changes
  decisions:
    - use existing retry queue
    - default max attempts stays 5
  unresolved:
    - metric name for terminal failure event
  next_step:
    - patch dispatcher and update tests
```

that's usually enough. the rest can be reconstructed from code and git history if needed.

### prompt caching doesn't solve epistemology

cheap cached context is still context. a lower price doesn't turn fluff into signal. caching helps when the same high-value substrate needs to stay present across turns, it's not a reason to keep every paragraph ever written in the loop indefinitely.

### heartbeats and checkpoints

long-running agent work benefits from small recurring checks, but the heartbeat should ask whether reality changed, not restate the entire state. a simple heartbeat pattern:

```
if nothing_changed:
  return HEARTBEAT_OK

if state_changed:
  return {
    changed_fact,
    impact_on_task,
    required_next_action
  }
```

the point is to surface deltas. a heartbeat that rehydrates the full workflow state every time is paying for its own indecision.

### the rule that held up

pass full context mainly at real boundaries: a new task class, a new artifact surface, a spec revision, or a handoff between roles. inside a narrow loop, context should shrink, not grow.

### practical consequences

1. prefer references to artifacts over pasting entire artifacts.
2. store state in versioned files, not only in conversation history.
3. expire summaries when the underlying truth changes.
4. make authority explicit: spec beats note, test beats plan, operator correction beats both.
5. measure context by decision value, not token count alone.

context is a spending decision. the useful move was spending it on facts that changed the next move and cutting the rest before it started pretending to be knowledge.

### further reading

- [agents.md effectiveness](/research/agents-md-effectiveness/): when extra repository context helps and when it doesn't
- [modular workflow stack](/workflows/modular-workflow-stack/): why context belongs in its own layer
- [reward engineering for coding agents](/research/reward-engineering/): the evaluation surface matters more than prompt bulk
