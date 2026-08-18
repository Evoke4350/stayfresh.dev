---
title: preference toml
description: use rlhf-shaped semantics in a simple config dsl for agent evaluation loops.
section: workflows
date: 2026-04-13
tags: [config, evaluation, dsl]
draft: false
---

the config format is one the model already knows.

more importantly, the semantics are ones the model has already seen in alignment, evaluation, and critique papers.

### The Basic Idea

toml is not magical. it is just readable.

the useful part is that keys like `reward`, `criterion`, `preference`, `critique`, `revision`, and `accept_if` map onto concepts that recur in rlhf, rlaif, rubric judging, and self-refinement work.

this remains an inference: models likely respond well to these names because they appear throughout pretraining and post-training corpora. the direct ablation on field names is still missing.

### Why This Works Better Than Random DSL Flavor

cute nouns are avoided when standard ones exist.

if a score bucket is called `vibes`, the model has to infer what is meant. if it is called `criterion` with a `weight`, it already knows the shape of the task.

that matters because empirical work keeps landing on the same pattern: explicit principles, rubrics, critique steps, and structured scoring improve control.

### TOML Example

```
task = "add retry support to api client"
objective = "retry 429 and 503 with bounded exponential backoff"

[reward]
style = "weighted_rubric"

[[criterion]]
name = "correctness"
weight = 5
required = true

[[criterion]]
name = "tests"
weight = 5
required = true

[[criterion]]
name = "edge_cases"
weight = 5

[[criterion]]
name = "error_handling"
weight = 5

[[criterion]]
name = "readability"
weight = 5

[[criterion]]
name = "architecture_fit"
weight = 5

[feedback]
mode = "critique_then_revision"
evidence_required = true
focus_low_scores_only = true

[accept_if]
total_gte = 24
correctness_gte = 4
tests_gte = 4
architecture_fit_gte = 4

[reject_on]
silent_failure = true
hardcoded_fixture_logic = true
new_dependency = true
```

this gives the agent a familiar contract.

it can fill the criteria, explain failures, revise weak spots, and check acceptance conditions without guessing what success means.

### Real Workflow

the loop below is the practical version.

```
1. load toml spec
2. generate patch against the stated objective
3. score each criterion
4. emit critique for scores below threshold
5. revise only weak criteria
6. rescore
7. accept or reject via explicit gates
```

the first pass can return a structured result like this.

```
[score]
correctness = 4
tests = 3
edge_cases = 2
error_handling = 2
readability = 4
architecture_fit = 5

[critique]
tests = "missing max-retry coverage"
edge_cases = "503 exhaustion path not covered"
error_handling = "final upstream exception is swallowed"
```

that output is already actionable. no prose detective work required.

### Why the Semantics Matter

the names match concepts from real alignment and evaluation workflows.

| DSL Term | Empirical Concept | Why It Helps |
| --- | --- | --- |
| `criterion` | rubric dimension | breaks one fuzzy target into scoreable axes |
| `weight` | reward shaping | makes tradeoffs explicit |
| `feedback` | verbal reinforcement | turns scores into revision targets |
| `preference` | pairwise comparison | lets the agent rank alternatives when scalar scoring is weak |
| `accept_if` | policy gate | prevents high total scores from masking critical failures |
| `reject_on` | hard constraint | blocks known reward-hacking patterns |
| `evidence_required` | evidence-anchored judging | forces the model to point at code or tests |

### Preference Mode

sometimes scalar scoring is not enough.

if two patches are both plausible, a pairwise preference block can work better because rlhf systems are often trained from ranked comparisons.

```
[preference]
mode = "pairwise"
prompt = "choose the patch that better satisfies the rubric"
require_rationale = true

[choose_if]
correctness = "higher"
architecture_fit = "higher"
readability = "higher"
new_complexity = "lower"
```

this is especially useful when the agent has two candidate implementations and the better one is more obvious in comparison than in isolation.

### Alternative Syntaxes

the semantics matter more than the wrapper.

#### JSON

```
{
  "reward": { "style": "weighted_rubric" },
  "criterion": [
    { "name": "correctness", "weight": 5, "required": true },
    { "name": "tests", "weight": 5, "required": true }
  ],
  "accept_if": { "total_gte": 10, "correctness_gte": 4 }
}
```

#### XML

```
<reward style="weighted_rubric">
  <criterion name="correctness" weight="5" required="true" />
  <criterion name="tests" weight="5" required="true" />
  <accept_if total_gte="10" correctness_gte="4" />
</reward>
```

#### Ruby-ish DSL

```
reward do
  criterion :correctness, weight: 5, required: true
  criterion :tests, weight: 5, required: true
  accept_if total_gte: 10, correctness_gte: 4
end
```

toml tends to be the least annoying of the bunch for human editing.

### Empirical Mapping

several primary results line up with this pattern.

- **Constitutional AI** showed that a list of explicit principles can drive critique, revision, and preference modeling with far fewer human labels.
- **G-Eval** improved evaluator alignment with chain-of-thought and a form-filling rubric.
- **Reflexion** showed that verbal feedback can materially improve coding performance.
- **Self-Refine** showed that iterative self-feedback improves outputs without extra training.
- **RULERS** argues that executable rubrics, evidence anchoring, and calibrated scales beat loose prompt phrasing for reliable judging.

the common thread is boring and useful: explicit criteria plus explicit feedback loops.

### Practical Notes

the vocabulary stays plain.

the schema stays small enough that the agent can hold the whole thing in working memory.

hard constraints cover known failure modes. weighted criteria cover everything else.

if the model is to check all the boxes, the boxes are made literal.

### Empirical Findings (Starfish Method)

#### START

fields are named after concepts the model has probably already seen: `criterion`, `weight`, `preference`, `critique`, `revision`.

explicit acceptance gates are used for critical dimensions like correctness and architecture fit.

evidence is required in critique output when the workflow feeds into review automation.

#### STOP

cute schema names that obscure the semantics get dropped. novel wording is mostly friction.

everything does not get collapsed into one score. that just recreates the reward-hacking problem in a prettier file format.

config files do not run longer than the patch they evaluate. at that point the process is eating itself.

#### CONTINUE

toml stays in use for hand-edited workflows. it is readable and does not fight back.

weighted criteria stay separated from hard rejections. the distinction matters operationally.

pairwise preference blocks stay in use when two candidate patches are easier to compare than to score independently.

#### INVESTIGATE

whether criterion names taken directly from benchmark rubrics improve first-pass compliance further is an open question.

schema-specific drift across models is an open question. some models may parse xml more rigidly and toml more flexibly.

whether preference-mode evaluation beats scalar scoring on refactors where correctness is similar but architecture fit differs is an open question.

#### AMPLIFY

hard constraints for known bad behaviors like silent failure and fixture-specific logic get amplified. they eliminate a lot of junk early.

explicit critique and revision sections get amplified. those fields turned static specs into actual working loops.

simple semantics get amplified over fancy syntax. the useful part is the contract, not the dsl cosplay.

### Related Research

- [Reward Rubric DSL](/workflows/reward-rubric-dsl/) - A smaller rubric-first version of the same idea
- [Constitutional AI: Harmlessness from AI Feedback](https://arxiv.org/abs/2212.08073) - Explicit principles driving critique and preference modeling
- [G-Eval](https://arxiv.org/abs/2303.16634) - Form-filling rubric evaluation with chain-of-thought
- [Reflexion](https://arxiv.org/abs/2303.11366) - Verbal reinforcement for agents, including coding
- [Self-Refine](https://arxiv.org/abs/2303.17651) - Iterative feedback and revision at inference time
- [RULERS](https://arxiv.org/abs/2601.08654) - Executable rubrics and evidence-anchored scoring
