---
title: persona anchors
description: character-based instruction patterns for consistent agent behavior.
section: research
date: 2026-04-13
tags: [personas, prompting, style, patterns]
draft: false
---

**pattern**: agents were directed to emulate specific engineering styles and values by anchoring to recognized names in the field.

### the core idea

llms had absorbed the public writing, talks, and code of well-known engineers. that training signal could be probed and used, without web access, to shape agent behavior toward specific styles and quality standards.

### how it worked

1. **a practitioner got named** whose style matched the desired output.
2. **the agent got told to emulate their values and craft.**
3. **the agent drew on training data** to approximate that style.

this worked because llms encoded patterns from public artifacts (blog posts, conference talks, open-source contributions) associated with named individuals.

### domain-specific anchors

#### react native projects

```
Emulate the craft and values of React Native product engineers like
Evan Bacon and Fernando Rojo. Prioritize developer experience,
practical abstractions, and polished user interactions.
```

#### generic react native (no specific product)

```
Emulate the taste and architectural decisions of the Callstack crew.
Focus on maintainability, clear module boundaries, and patterns that
scale across teams.
```

#### backend systems

```
Emulate the operational discipline of engineers like Kelsey Hightower.
Infrastructure as code, explicit configuration, no snowflakes.
```

#### distributed systems

```
Emulate the rigor of the FoundationDB or CockroachDB teams. Correctness
first, performance second, explicit handling of edge cases.
```

### checking for recognition

to check which names an agent recognized without web access:

```
Without using web search, describe the engineering values and style
associated with [Name]. What patterns would you expect in their work?
```

if the agent produced a coherent description, that name was usable as an anchor. if the response stayed vague or generic, a different anchor worked better.

### when persona anchors held up

| situation | effectiveness |
|---|---|
| greenfield project, no established patterns | high, provided default direction |
| codebase with strong existing conventions | low, existing patterns dominated |
| team with shared style idols | high, aligned agent with team taste |
| generic/scaffold code | medium, added polish without over-engineering |

### failure modes

- **over-specifying**: listing too many names created confusion.
- **contradictory anchors**: "like [minimalist] and [enterprise architect]" fought itself.
- **unknown names**: if the model didn't know them, the anchor was noise.
- **using for factual questions**: anchors shaped style, not correctness.

### the trick underneath

persona anchors were a controlled hallucination. the model wasn't actually those engineers, but output improved when it was directed toward a coherent style. specific names carried more signal than "act as a senior engineer" because they encoded real patterns from training data.

### template used

```
## Style Anchor

For this project, emulate the values and craft of [Domain] practitioners
like [Name 1] and [Name 2].

Key characteristics:
- [Value 1]
- [Value 2]
- [Value 3]

When in doubt, ask: "Would [Name] approach it this way?"
```
