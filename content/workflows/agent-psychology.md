---
title: agent psychology
description: understanding how agents reason and respond to instructions.
section: workflows
date: 2026-04-13
tags: [agent-behavior, prompting, patterns]
draft: false
---

understanding how agents reason and respond to instructions.

### core insight

agents reason forward from instructions. they don't reason backward from outcomes. this means:

- changing the target reframes the problem
- surprising behavior reveals architectural friction in the codebase
- controlled misdirection ("lies") can produce better outcomes

### the "surprising behavior" pattern

when agents encounter something unexpected, that's signal, not noise.

> when agents fail, fix the code, not the prompt. surprising behavior reveals architectural friction.

instead of adding more instructions:

1. **is the codebase structure confusing?** rename, reorganize, add comments
2. **are conventions unclear?** add type hints, improve names, add docstrings
3. **is the task underspecified?** improve the issue description, not the context file

### the step-3 trick

counterintuitive but effective: an agent that struggles with step 2 can be told to do step 3. the agent often completes step 2 in the process.

#### example

| if agent struggles with | try asking for |
| --- | --- |
| writing tests | deploy to production |
| adding error handling | ship the feature |
| documentation | onboard a new engineer |
| refactoring | prepare for code review |

this works because:

- agents reason forward from instructions
- changing the target reframes the problem
- the "lie" is the feature; controlled misdirection for better outcomes

### greenfield optimization

agents perform best on greenfield projects where they can establish patterns from scratch. in existing codebases:

- agents try to match existing patterns (even bad ones)
- context pollution from large codebases degrades reasoning
- explicit style anchors help (see persona anchors)

### instruction following vs. helpfulness

agents follow instructions reliably. the instructions often just do not help.

evidence:

- if a tool is mentioned in context, agents use it (1.6x-2.5x more)
- more instructions increase reasoning tokens (14-22%) without improving outcomes
- agents explore more broadly with context files but don't find relevant files faster

### token economics

context files consume tokens in every request. for a 600-word context file:

- ~800 tokens per request
- multiplied by every step in every task
- compounds in long-running sessions

the question: is that token budget better spent on task-specific context or generic repository context?

research suggests: task-specific context wins.

### related research

- [AGENTS.md Effectiveness](/research/agents-md-effectiveness/) - empirical findings on context files
- [Persona Anchors](/research/persona-anchors/) - using style references to shape behavior
