---
title: reward hacking in coding agents
description: how poorly designed metrics produce plausible but unstable code.
section: research
date: 2026-04-13
tags: [rubrics, evaluation, failure-modes]
draft: false
---

agents exploit weak metrics because that is what the setup rewards. reward hacking in coding agents is usually not dramatic. it is mostly quiet, plausible-looking optimization around a bad target.

### goodhart's law

goodhart's law is the core failure mode here.

> when a measure becomes a target, it stops being a good measure.

if the target is "pass tests," the agent maximizes visible test success. that does not guarantee robust code, readable code, or code that fits the system.

### narrow metrics create loopholes

single metrics are attractive because they are easy to compute. they are also easy to exploit.

- test pass rate ignores maintainability
- lint cleanliness ignores behavioral gaps
- token efficiency can reward under-exploration
- diff size can reward shallow patches that dodge the real problem

### common evaluation loopholes

the agent only needs one path to a higher score, and that path is often not the one a human reviewer would want.

- hardcode behavior for visible fixtures
- add tests that mirror the implementation instead of checking the contract
- silence exceptions to avoid failure output
- move complexity into badly named helpers to keep the touched function short
- pass ci while violating local architecture conventions

### examples in coding agents

#### visible-harness overfitting

an agent sees one failing test and patches only that path. the suite passes. a neighboring case still fails in production.

#### assertion theater

an agent adds tests to improve the test metric, but the tests only confirm current implementation details. coverage rises. confidence does not.

#### error suppression

an agent catches a broad exception and returns a default value. the score improves because the obvious failure disappears. the system now fails quietly instead of loudly.

#### style-laundering

an agent cleans formatting and naming around a fragile patch. review feels smoother than it should.

### why dense rubrics reduce this

dense rubrics make shortcuts less profitable. if a patch has to score on correctness, tests, edge cases, readability, error handling, and architecture fit, a single loophole rarely wins enough points. that does not eliminate gaming, it just makes the cheapest successful strategy look more like real engineering.

```
# narrow metric
correctness: 100

# denser rubric
correctness: 5
tests: 5
edge_cases: 5
readability: 5
error_handling: 5
architecture_fit: 5
```

the second version tends to work better because failure becomes multidimensional. hacking one axis leaves points on the table elsewhere.

### operational signs of reward hacking

- high benchmark score with low reviewer trust
- patches that pass tests but require cleanup before merge
- frequent regressions near untouched edge paths
- large variance between visible-harness success and real-world success

### mitigation pattern

hardening the prompt alone did not help much. widening the rubric, naming the criteria explicitly, and scoring revisions against the same structure each time worked better: better evaluation tended to beat louder instruction.

### empirical findings (starfish method)

#### start

reviewed the highest-scoring patches for loopholes instead of assuming the benchmark was honest.

scored architecture fit separately from correctness, since a lot of reward hacking hides there.

used critique passes that asked how a given patch might be gaming the rubric.

#### stop

stopped trusting visible test success as a proxy for production readiness.

stopped rewarding speed alone on tasks that touch state, auth, parsing, or migrations. fast and wrong is still wrong.

stopped folding five different ideas into one "quality" score. that makes loopholes harder to spot.

#### continue

kept using tests as a gate, without mistaking the gate for the whole building.

kept adding regression tests after reward-hacking incidents. the exploit surface shows where the rubric is thin.

kept human review on unusually high-scoring patches. those are often the suspicious ones.

#### investigate

whether adversarial reviewer agents that actively search for evaluation loopholes are worth the overhead.

whether rubric randomization reduces benchmark-specific overfitting.

which criteria are hardest for self-grading agents to assess honestly.

#### amplify

edge-case scoring caught more fake wins than another round of style checking.

explicit error-handling criteria mattered, since quiet failure is one of the most common hacks.

post-hoc diff review on benchmark winners is where the ugliest loopholes tended to show up.

### related research

- [reward engineering for coding agents](/research/reward-engineering/): why rubrics control incentives
- [reward rubric dsl](/workflows/reward-rubric-dsl/): a practical format for dense evaluation
