---
title: modular workflow stack
description: right tool, right job, right time: layered orchestration, typed agent delegation, human-in-the-loop gates, parallelism, and loops with real halting conditions.
section: workflows
date: 2026-04-07
tags: [orchestration, workflows, architecture]
draft: false
---

layers run in sequence, with deliberate hand-offs and human checkpoints between them.

the skills stack pattern (role-based orchestration via gstack, context stability via gsd, execution via superpowers) makes this concrete. each layer has a job. each layer hands off cleanly. none of them run simultaneously from a single monolithic prompt.

### the three layers

every durable workflow decomposes into three concerns:

| layer | job | failure mode when missing |
|---|---|---|
| orchestration | decide what to do next, route to the right agent, gate on human input | agents start work before the goal is clear; you debug outputs instead of inputs |
| context | keep specifications stable across a long chain of steps | context drift: later steps contradict earlier decisions; agents re-argue closed questions |
| execution | do one narrow task well with minimal context | bloated prompts, multi-objective confusion, unpredictable output |

the layers must be physically separate. an orchestration prompt that also does execution collapses both failure modes into one.

### layer 1: orchestration

the orchestrator is the conductor, not a performer. its only job is to route: given the current state and user input, which agent runs next, with what context, and who reviews the result?

#### orchestrator responsibilities

- accept structured user input at each decision point
- choose agent type based on the task class
- decide whether steps run sequentially or in parallel
- insert human-in-the-loop gates before irreversible actions
- decide when to loop (retry, refine, escalate)
- decide when to halt

#### role-based routing

gstack formalizes what most effective teams do informally: different decisions belong to different roles. the same principle applies to agents.

| decision type | route to | why |
|---|---|---|
| product scope, priority | product/ceo agent | avoids over-engineering at the execution layer |
| architecture, interfaces | engineering manager agent | separates design from implementation concerns |
| ux, component structure | designer agent | keeps visual decisions out of backend prompts |
| implementation | execution agent | single-objective, narrow context, fast |
| correctness, edge cases | qa agent | fresh context; no sunk-cost bias from implementation |
| security, injection, auth | security agent | adversarial lens requires explicit framing |
| merge, deploy, release | release agent | separate concern; human gate before irreversible push |

the orchestrator does not implement any of these roles. it knows which role applies and routes accordingly.

### layer 2: context stability

long chains of agents fail from context drift. the specification decided in step 2 is forgotten by step 8. the gsd pattern addresses this by treating the spec as a first-class artifact, not a conversation thread.

#### what context stability requires

- a written, versioned spec that agents load, not reconstruct from history
- explicit update steps when the spec changes (not implicit drift)
- a human gate before the spec changes mid-chain
- agents that confirm spec alignment before proceeding

```
# Context handoff pattern
# At each agent boundary, pass the spec explicitly:

SPEC: See SPEC.md at commit abc123
TASK: Implement the authentication module as defined in section 3.2
CONSTRAINTS: Do not modify the user model schema
OUTPUT: PR ready for QA agent review

# The spec is not in the prompt. It is referenced by the prompt.
```

this separates context (stable, versioned) from instructions (per-task, ephemeral). token cost drops. drift disappears. disputes resolve against the written spec, not conversation history.

### layer 3: execution

execution agents are narrow by design. they receive a single objective, minimal context, and a verifiable exit condition. width is the orchestrator's job. depth is the execution agent's job.

```
# Good execution prompt
ROLE: QA agent
CONTEXT: See SPEC.md §3.2, auth module PR #47
TASK: Find edge cases not covered by the current test suite
OUTPUT: Numbered list of uncovered cases with reproduction steps
HALT: When list is complete or you have checked all spec assertions

# Bad execution prompt (orchestration collapsed into execution)
You are a full-stack engineer. Review the spec, implement auth,
write tests, check security, prepare the PR, and make sure
it matches the design. Be thorough.
```

### human-in-the-loop

human gates are part of the architecture. the workflow is designed around them.

#### where to insert gates

| step | gate type | question to the human |
|---|---|---|
| before spec is finalized | approval | does this spec match your intent? |
| after architecture decision | approval | does this design fit constraints not yet given to the agent? |
| after qa report | triage | which findings are blockers vs. accepted risk? |
| before any push/deploy | hard gate | explicit approval; no default proceed |
| when agent signals uncertainty | escalation | agent surfaces ambiguity; human resolves it |

gates must be explicit in the workflow definition. an implicit assumption that the human will "just notice" when to intervene is an absence of architecture, not a gate.

#### designing for interruption

a workflow that cannot be interrupted mid-chain is fragile. every long chain should support:

- **checkpoint saves**: state is written to disk at each gate so the chain can resume
- **step-back**: human can reject a step and re-run from the previous checkpoint
- **override**: human can inject context or change direction at any gate

### parallelism

independent tasks should not run sequentially. the constraint is dependency, not caution.

#### when to parallelize

```
# Sequential (correct: B depends on A's output)
A: Finalize spec
B: Implement auth module per spec

# Parallel (correct: no dependency between B and C)
A: Finalize spec
B: Implement auth module per spec     ← launch together
C: Write E2E test scaffold per spec   ← launch together
D: Security review of spec            ← launch together
E: Merge B+C+D results, resolve conflicts
```

#### parallelism boundaries

| safe to parallelize | must be sequential |
|---|---|
| independent feature branches | spec finalization → implementation |
| qa + security review of same pr | implementation → qa |
| multiple execution agents on different modules | architecture → any implementation |
| competing design proposals | human gate → next phase |
| background context refresh | merge + conflict resolution |

parallelism multiplies throughput only when the merge step is cheap. if parallel outputs require substantial reconciliation, the cost is hidden, not eliminated. design merge steps explicitly; they are not free.

### loops

loops are the mechanism for refinement. they require halting conditions, not just goals.

#### loop anatomy

```
LOOP:
  INPUT:  Current state + failure signal
  TASK:   Fix one thing
  VERIFY: Run oracle (tests, lint, typecheck)
  HALT:   Oracle passes OR loop count exceeds N
  ON HALT EXCEEDED: Escalate to human, do not auto-proceed
```

#### loop types

| loop type | trigger | halting condition |
|---|---|---|
| fix-ci loop | test/lint failure | all checks pass |
| review loop | qa or human feedback | all blockers addressed |
| refinement loop | output quality below rubric threshold | score exceeds threshold or max iterations |
| exploration loop | unknown solution space | n candidates generated; human selects |
| context-refresh loop | spec version mismatch | agent confirms spec alignment |

a loop without a halting condition is a runaway. a loop that halts on "done" is a loop that never halts on time. halting conditions must be machine-verifiable.

### composing many steps

a 30-step workflow is not a 30-prompt workflow. most prompts are small. the complexity is in the graph, not the nodes.

#### step graph properties

- **acyclic by default**: loops are explicit subgraphs, not accidental cycles
- **typed edges**: each edge carries a type (sequential, parallel, gate, loop-back)
- **named steps**: steps have ids. checkpoints reference ids. humans refer to steps by name, not by memory
- **explicit merge nodes**: parallel branches always converge at a named merge step

#### workflow definition pattern

```
# Minimal workflow definition
workflow: auth-feature
spec: specs/auth-v2.md

steps:
  - id: scope
    agent: product
    input: user_request
    gate: human_approval

  - id: design
    agent: eng-manager
    input: scope.output
    gate: human_approval

  - id: implement
    agent: execution
    parallel:
      - id: impl-backend
        input: design.output
      - id: impl-tests
        input: design.output
      - id: security-review
        input: design.output

  - id: merge
    agent: eng-manager
    input: [impl-backend.output, impl-tests.output, security-review.output]

  - id: qa
    agent: qa
    input: merge.output
    loop:
      on: qa_findings
      until: no_blockers
      max: 3

  - id: release
    agent: release
    input: qa.output
    gate: human_approval  # hard gate; no default proceed
```

this is not a prompt. it is a schema. the prompts are inside the agent definitions, kept separate from the workflow graph. when a step fails, you debug the step definition, not the entire chain.

### token economics at scale

long workflows amplify token decisions made early. a 600-token context file loaded at every step of a 30-step workflow is 18,000 tokens spent on generic context. task-specific context passed only to the relevant step costs a fraction of that.

rules of thumb:

- the spec is passed by reference (path + version), not by value (full text), except at the context layer
- execution agents get the minimum context required for their single task
- orchestration agents get workflow state, not file contents
- human gates are the correct place to surface summaries, not inside agent prompts

### anti-patterns

#### the monolith prompt

a single prompt that asks an agent to plan, implement, review, and ship. all three layers collapsed into one. when it fails, there is nowhere to debug.

#### implicit sequencing

running steps in order without documenting why. when a step needs to move or be parallelized, the dependency is unknown. the sequence breaks silently.

#### unbounded loops

loops without maximum iterations or without escalation on failure. the agent retries indefinitely. the human discovers it hours later.

#### framework stacking without layer separation

running gstack, gsd, and skills from a single prompt collapses all three layers into one context. the frameworks are complements because they operate at different layers; running them in parallel from one context eliminates the benefit of any of them.

#### parallelism without merge design

launching parallel agents without planning how their outputs reconcile. merge conflicts in parallel agent output are harder to resolve than sequential conflicts because neither agent knows about the other's decisions.

#### missing human gates

automating past a decision point that requires human judgment. the workflow moves fast and lands in the wrong place. the issue is irreversibility, not speed.

### the compounding effect

garry tan's reported output (10,000 lines of code and 100 pull requests per week over 50 days) is the compounding product of clean layer separation applied consistently, not any single tool or prompt.

each layer running at its level of abstraction means:

- orchestration is never re-litigating implementation details
- execution is never making architectural decisions
- context is never reconstructed from memory
- humans are never reviewing work that hasn't passed its own layer's gate

the workflow does not scale because it runs faster. it scales because it fails locally. failures in execution do not corrupt orchestration. failures in orchestration do not corrupt the spec. each layer's failure mode is contained to that layer.

### related workflows

- [ci automation](/workflows/ci-automation/): loop patterns, halting conditions, and ci integration
- [reward rubric dsl](/workflows/reward-rubric-dsl/): machine-verifiable halting conditions for refinement loops
- [prompt patterns](/workflows/prompt-patterns/): single-objective execution prompt structure
- [agent psychology](/workflows/agent-psychology/): how agents reason within a step; why narrow context wins
- [enterprise agent design](/research/enterprise-agent-design/): production-grade agent architecture patterns
