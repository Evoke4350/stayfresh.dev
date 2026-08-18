---
title: agents.md effectiveness
description: evaluating repository-level context files for coding agents.
section: research
date: 2026-04-13
tags: [context, evaluation, benchmarks]
draft: false
---

**reference:** [evaluating agents.md: are repository-level context files helpful for coding agents?](https://arxiv.org/pdf/2602.11988) (gloaguen et al., eth zurich / logicstar.ai, february 2026)

### the finding

context files like `AGENTS.md` and `CLAUDE.md` are widely recommended, and over 60,000 repositories include them. the evaluation in this reference found:

| context type | success rate change | cost change |
|---|---|---|
| none | baseline | baseline |
| llm-generated | -3% | +20% |
| developer-written | +4% | +19% |

llm-generated context files made agents worse and more expensive in this evaluation.

### why context files underperformed

#### redundant documentation

when researchers removed all existing documentation (readmes, docs folders), llm-generated context files became useful (+2.7% improvement). that suggests the context files were mostly redundant with what was already in the repository.

#### no effective overview

one recommended use of context files is providing a codebase overview, but agents with context files didn't find relevant files faster. they often took more steps because they:

1. issued multiple commands to find the context file
2. read it multiple times despite it already being in context
3. explored more broadly without better targeting

#### unnecessary requirements make tasks harder

context files add instructions, and agents follow them. but additional requirements, even well-intentioned ones, increased cognitive load and reasoning tokens (14-22% more reasoning with context files). more instructions did not translate to better outcomes here.

### what context files did well

#### agents follow instructions

if a tool is mentioned in the context file, agents use it:

- `uv`: 1.6 uses/instance when mentioned vs. <0.01 when not
- repository-specific tools: 2.5 uses/instance when mentioned vs. <0.05 when not

agents followed instructions reliably. the problem was that the instructions often didn't help.

#### more exploration, more testing

context files increased test execution frequency, file traversal (grep, read, glob), and repository-specific tool usage. that's the "thoroughness" that drove up costs without improving outcomes.

### practical recommendations

#### when to skip agents.md

- well-documented repositories with readme, docs, examples
- popular repositories with strong conventions the model already knows
- simple tasks that don't require extra context

#### when agents.md helps

- niche repositories with no documentation
- custom tooling that differs from standard conventions
- team-specific patterns that aren't otherwise discoverable

#### what to include, if writing one

based on this research, a context file works best with minimal requirements:

```
# build & test
- run tests: pytest tests/
- lint: ruff check .

# conventions
- use uv for dependency management
- follow existing module patterns
```

it's better not to include long codebase overviews, information already in the readme, or style rules the model already knows.

### the unexpected-behavior pattern

when agents hit something unexpected, that's worth treating as signal.

> when agents fail, fix the code, not the prompt. surprising behavior reveals architectural friction.

instead of adding more instructions to `AGENTS.md`, it's worth asking:

1. is the codebase structure confusing? rename, reorganize, add comments.
2. are conventions unclear? add type hints, improve names, add docstrings.
3. is the task underspecified? improve the issue description, not the context file.

### the step-3 trick

one counterintuitive but effective pattern: if an agent struggles with step 2, tell it to do step 3. the agent often completes step 2 in the process. this seems to work because agents reason forward from instructions, and changing the target reframes the problem, a small deliberate misdirection that produced better outcomes in practice.

### token economics

context files consume tokens in every request. for a 600-word `AGENTS.md`, that's roughly 800 tokens of context per request, multiplied by every step in every task. it compounds quickly in long-running sessions.

the open question is whether that token budget is better spent on task-specific context (the actual code being modified) or on generic repository context. the research here points toward task-specific context.

### further reading

- [agentbench harness](https://github.com/eth-sri/agentbench): benchmark used to evaluate context files
