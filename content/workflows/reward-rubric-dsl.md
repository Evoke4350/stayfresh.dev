---
title: reward rubric dsl
description: a small machine-readable format for scoring coding agent output.
section: workflows
date: 2026-04-13
tags: [rubrics, evaluation, dsl]
draft: false
---

agents behave more predictably when success criteria are explicit and machine-readable.

a small rubric dsl is often enough. no fancy rl stack required.

### the dsl

the goal is to define evaluation criteria in a format that both agents and automation can parse.

```
reward_rubric {
  criterion correctness weight=5
  criterion tests weight=5
  criterion edge_cases weight=5
  criterion readability weight=5
  criterion naming weight=5
  criterion architecture weight=5
  criterion docs weight=5
}
```

this is intentionally small.

the useful part is not syntax purity. it is that the evaluation surface becomes visible, stable, and reusable.

### why it helps

plain-language prompts drift. rubrics do not.

if the agent can read the criteria before writing code, it can aim for the right target on the first attempt.

if the evaluator can read the same criteria after the attempt, scoring becomes consistent across runs.

### typical loop

```
task
→ agent attempt
→ rubric evaluation
→ critique
→ revision
→ rescore
```

this loop is simple enough to run in a shell script, ci job, or agent harness.

### use cases

#### autonomous coding agents

the rubric gives the agent a fixed target instead of a vague quality request.

#### ci evaluation pipelines

the same rubric can drive test gates, lint thresholds, reviewer prompts, and release checks.

#### agent self-grading

an agent can score its own patch criterion by criterion, explain the weak points, then revise.

#### review automation

review bots are less noisy when they have named criteria instead of free-form opinions.

#### multi-agent critique loops

one agent writes. another scores. a third summarizes deltas between revisions. the rubric keeps the whole thing from turning into abstract nonsense.

### example evaluation pass

```
reward_rubric {
  criterion correctness weight=5
  criterion tests weight=5
  criterion error_handling weight=5
  criterion architecture weight=5
}

score {
  correctness 4 "behavior matches task, one edge path missing"
  tests 5 "new tests cover primary branch and regression case"
  error_handling 2 "invalid input path still throws raw exception"
  architecture 4 "fits existing module boundaries"
}
```

the critique step now has something concrete to act on. it can target the `error_handling` gap instead of waving its hands about code quality.

### real workflow example

a common use case is a small bug fix with one visible failing test and several likely hidden edge cases.

```
task {
  title "fix retry logic in api client"
  objective "retry 429 and 503 responses with backoff"
  constraints "do not add dependencies"
}
```

```
reward_rubric {
  criterion correctness weight=5
  criterion tests weight=5
  criterion edge_cases weight=5
  criterion readability weight=5
  criterion error_handling weight=5
  criterion architecture weight=5
}
```

the first agent attempt usually fixes the happy path and adds one regression test.

```
score {
  correctness 4 "429 retry works, 503 path incomplete"
  tests 3 "covers retry once, no max-retry test"
  edge_cases 2 "timeout and retry exhaustion not handled"
  readability 4 "patch is easy to follow"
  error_handling 2 "last failure reason is discarded"
  architecture 5 "fits existing client abstraction"
}
```

that score gives the critique loop something specific to do.

```
critique {
  revise edge_cases "handle retry exhaustion and timeout path"
  revise tests "add max-retry and 503 coverage"
  revise error_handling "preserve final upstream failure"
}
```

the second attempt is narrower. it is not "improve the patch." it is "raise the weak criteria."

```
rescore {
  correctness 5
  tests 5
  edge_cases 4
  readability 4
  error_handling 4
  architecture 5
}
```

at that point the pipeline can accept the patch with a simple rule.

```
accept_if {
  total_gte 27
  minimum correctness 4
  minimum tests 4
  minimum architecture 4
}
```

this is the practical advantage of the dsl. the loop is inspectable.

the loop makes it visible why a patch passed, why it failed, and which criteria drove the next revision.

### when the agent sees the reward

the timing matters.

direct coding-agent studies that compare "rubric shown up front" versus "revealed mid-task" versus "revealed only at the end" are still thin.

but adjacent evidence points in one direction: earlier reward visibility usually produces less backtracking and more stable behavior.

#### reward up front

if the agent sees the rubric before it starts, it can plan around the real target instead of reverse-engineering it from failures.

this matches openai's deliberative alignment results: models that read an explicit specification before acting referenced those principles in reasoning, and out-of-distribution scheming rates dropped sharply after that training setup.

for coding workflows, the practical implication is simple. first-pass behavior tracks the evaluation surface when the rubric is shown before generation.

#### reward mid-task

mid-task rubric feedback is usually the next best option.

it lets the agent redirect before the whole attempt hardens into a bad patch.

this pattern shows up in anticipatory and proactive reflection work. devil's advocate reports better efficiency by reflecting before each action instead of after a full trial. pasr reports that proactive refinement during generation improved accuracy while reducing token use by 41.6 percent on qwen3-8b.

the inference for coding agents is straightforward: if a criterion becomes visible halfway through the task, the agent can still salvage the run, but it will usually pay in backtracking.

#### reward only at the end

end-only feedback still helps. it is just more expensive.

self-refine improved performance by about 20 percent absolute on average over one-step generation, and reflexion improved coding pass@1 on humaneval from 80 percent to 91 percent by learning from trial feedback.

but this is reactive. the agent has already spent tokens on a full attempt before learning what mattered.

#### a practical take

the cleanest first draft comes from showing the rubric up front.

the cheapest repair path comes from surfacing low-scoring criteria as soon as they are detectable.

waiting until the end brings more revision loops and more opportunities for the agent to optimize appearances instead of intent.

there is also a catch: end-only self-grading can amplify self-bias. separate work on self-refinement found that models tend to favor their own outputs, and that external feedback with accurate assessment reduces that bias.

### why this is usually cheaper than full rl

most coding-agent teams do not need full reinforcement learning infrastructure.

they need repeatable evaluation.

a rubric dsl is cheaper because it uses components most teams already have: prompts, scripts, tests, and ci.

it also fails more transparently. when the rubric is wrong, the damn thing can be read and fixed.

### design notes

criteria are kept operational. "good code" is useless. "error handling" is testable.

weights are kept small and roughly balanced. large single weights invite reward hacking.

the rubric is kept short enough to survive repeated use. if scoring it is annoying, nobody will keep using it.

### connection to reward engineering

this dsl is just a serialization of reward engineering principles.

the research point is simple: prompts shape language, but rubrics shape incentives.

a machine-readable rubric makes those incentives explicit, which is why it works well for self-grading, critique loops, and ci evaluation.

### minimal implementation pattern

```
1. define rubric
2. generate attempt
3. score each criterion
4. revise lowest scores
5. accept only if total and critical criteria pass
```

this is enough to get most of the value.

### related research

- [reward engineering for coding agents](/research/reward-engineering/) - why the rubric is the real control surface
- [reward hacking in coding agents](/research/reward-hacking/) - how narrow metrics get exploited
- [self-refine](https://arxiv.org/abs/2303.17651) - post-hoc iterative feedback improves over one-shot generation
- [reflexion](https://arxiv.org/abs/2303.11366) - trial feedback improves coding-agent performance
- [pasr](https://arxiv.org/abs/2508.12903) - proactive refinement during generation improves accuracy and token efficiency
- [devil's advocate](https://arxiv.org/pdf/2405.16334) - reflection before action can reduce backtracking
