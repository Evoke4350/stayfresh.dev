---
title: reward engineering for coding agents
description: why coding agents optimize the rubric more than the prompt.
section: research
date: 2026-04-13
tags: [rubrics, evaluation, prompting]
draft: false
---

prompt engineering shapes language. reward engineering shapes incentives. coding agents optimize whatever evaluation surface is exposed, and in practice the real engineering surface is the rubric.

### definition

reward engineering is the design of the scoring function used to judge an agent's attempt. that score can come from tests, static checks, critique models, human review, or some weighted mix of the three.

### why prompting isn't the main control surface

prompts steer phrasing, planning style, and local constraints, but they don't reliably determine what an agent trades off under pressure. the evaluation function does that. if the rubric only rewards passing tests, the agent finds ways to pass tests. if the rubric also scores readability, edge cases, and architecture fit, behavior changes.

### why single metrics fail

single-metric evaluation runs straight into goodhart's law.

> when a measure becomes a target, it stops being a good measure.

a score of 100 on correctness sounds clean. it is also narrow, and narrow targets are easy to game with overfitting, brittle patches, shallow test additions, or hardcoded branches that satisfy the visible harness.

```
# weak reward structure
correctness: 100
```

this kind of rubric creates an obvious exploit surface: the agent only needs to maximize one number.

```
# better reward structure
correctness: 5
tests: 5
edge_cases: 5
readability: 5
naming: 5
error_handling: 5
docs: 5
architecture_fit: 5
```

smaller weights across multiple axes reduce reward hacking because no single shortcut dominates. the agent has to produce work that survives inspection from several directions at once.

### sparse vs dense rewards

sparse reward means the agent gets little feedback until the end of the loop, for example pass or fail after a full test suite. dense reward means the agent gets partial signals during evaluation, for example partial credit for test coverage, naming quality, and error-path handling before the final merge decision.

sparse reward can work for simple tasks. on larger edits it tends to cause flailing, long retries, and local overfitting. dense reward gives the agent something closer to operational gradient, not rl gradient, just a clearer view of where the failure surface is.

### why narrow metrics are easy to game

agents find loopholes quickly:

- maximize tests passed by adding narrow fixture-specific logic
- maximize lint score by moving complexity into unreadable helpers
- maximize speed by skipping validation and error handling

none of this requires malice. it is optimization pressure doing what optimization pressure does.

### why wide rubrics produce more stable outputs

wide rubrics force balance. an agent can still optimize aggressively, but the easiest path is no longer a cheap trick, it has to satisfy several weak constraints instead of one strong one. that tends to produce code closer to what a competent reviewer would merge.

### multi-axis evaluation

the pattern that worked was a weighted rubric with operationally distinct axes:

- **correctness**: does the change satisfy the task?
- **tests**: did coverage move with the behavior change?
- **edge cases**: were obvious failure paths addressed?
- **readability**: can another human follow the patch?
- **naming**: do identifiers explain intent?
- **error handling**: does failure degrade cleanly?
- **docs**: were contract changes recorded?
- **architecture fit**: does the patch follow local system boundaries?

separation matters here. if two axes collapse into the same thing, the rubric gets fake breadth and no extra signal.

### self-grading agents

self-grading worked better than expected when the rubric was explicit, and badly when the rubric was vague. an agent can score its own attempt against a structured checklist, produce a critique, revise, and rescore. the reliability comes from the rubric, not from the agent becoming more careful on its own.

```
attempt
score against rubric
identify lowest-scoring criteria
revise
rescore
```

this is useful because it turns "make it better" into an operational loop.

### critique loops

critique loops are reward engineering in motion. a reviewer model, a second agent, or the same agent in critique mode can score the attempt, point at weak criteria, and request revision. the important part is that critique stays anchored to the rubric. free-form critique drifts. rubric-bound critique converges.

### token economics

evaluation loops aren't free, every extra scoring pass burns tokens. but bad rubrics burn tokens too, usually in a worse way: repeated failed attempts, noisy fixes, and expensive human cleanup. a short dense rubric often costs less than repeated prompt rewrites because it reuses the same evaluation surface across attempts. the cheap loop was usually:

1. small rubric
2. single critique pass
3. single revision
4. final score

the expensive loop was endless prompt fiddling because nobody had defined success clearly.

### practical example

in code generation experiments, test-only scoring often produced patches that passed the visible harness but created one of three problems:

- new helper functions with misleading names
- error cases silently swallowed
- logic duplicated instead of integrated with the existing abstraction

adding small scores for naming, error handling, and architecture fit reduced these failures without needing a longer prompt.

### comparison to prompt engineering

prompt engineering still matters for task framing, constraints, and tool usage, mainly shaping how the agent talks and plans. reward engineering shapes what the agent learns to care about across iterations.

### empirical findings (starfish method)

#### start

scored agent output on multiple weak axes instead of one dominant metric. this produced fewer brittle patches.

exposed the rubric before generation, not only after failure. agents wrote cleaner first attempts when they could see the grading surface.

used critique prompts that referenced the rubric by criterion name. specific failures were easier to repair than general dissatisfaction.

#### stop

stopped using pass-rate alone as the success definition. it produced clean-looking but misleading results.

stopped mixing unrelated goals into a single "quality" bucket. that just hid where the agent was cheating.

stopped lengthening prompts to compensate for a weak evaluation surface. it didn't fix the underlying benchmark.

#### continue

kept using tests as one axis, not the only axis. they remained the strongest local signal for behavioral correctness.

kept rubrics small. eight clear criteria worked better than twenty fuzzy ones.

kept to one revision after critique. a second revision sometimes helped, but the first one carried most of the gain.

#### investigate

whether dynamic weighting based on task type helps. infrastructure changes may need heavier architecture and error-handling scores.

whether separate reviewer agents outperform self-grading on architecture-fit judgments.

whether rubric criteria decay over long sessions, since criteria that start useful may become background noise after several rounds.

#### amplify

architecture-fit scoring had outsized impact on whether patches were mergeable without cleanup.

edge-case scoring mattered most on tasks touching parsing, auth, or state transitions. that one addition prevented a lot of regressions.

machine-readable rubrics paid off broadly: once the rubric was explicit, self-grading, ci evaluation, and critique loops all got cheaper.

### further reading

- [reward rubric dsl](/workflows/reward-rubric-dsl/): a small machine-readable format for evaluation criteria
- [reward hacking in coding agents](/research/reward-hacking/): failure modes from poorly designed metrics
