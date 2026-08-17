---
title: formal verification with agents
description: property-based testing and specification generation.
section: research
date: 2026-04-13
tags: [verification, testing, specifications, agent-design]
draft: false
---

**references:**

- [ai and the future of formal verification](https://martin.kleppmann.com/2025/12/08/ai-formal-verification.html) (martin kleppmann, december 2025)
- [property-based testing](https://red.anthropic.com/2026/property-based-testing/) (anthropic red, 2026)
- [property-based testing in practice](https://kiro.dev/blog/property-based-testing/) (kiro)

### the core argument

kleppmann's argument:

> llms are bad at formal verification, but they're excellent at writing specifications that humans can verify.

the economics of formal verification have always been brutal:

- sel4: ~23 lines of proof per line of code
- compcert: ~10+ years of effort for a verified c compiler
- most teams can't afford this

llms change the equation in a different way. they can:

1. **generate specifications** - natural language or semi-formal descriptions of intended behavior
2. **suggest invariants** - properties that should always hold
3. **write property tests** - executable checks that verify behavior
4. **translate between levels** - informal to formal, code to spec, spec to test

### property-based testing: the practical middle ground

formal verification proves correctness. property-based testing (pbt) *finds incorrectness*.

#### how pbt works

```
// Example: fast-check property test
fc.assert(
  fc.property(
    fc.string(),                    // Any string as input
    (s) => {
      const encoded = base64Encode(s);
      const decoded = base64Decode(encoded);
      return decoded === s;         // Round-trip invariant
    }
  )
)
```

the framework generates hundreds or thousands of random inputs automatically. properties (invariants) get defined, not specific test cases.

#### common property shapes

| property type | description | example |
|---|---|---|
| round-trip | encode/decode returns original | `JSON.parse(JSON.stringify(x))` |
| idempotence | f(f(x)) == f(x) | `Math.abs(Math.abs(x))` |
| commutativity | f(a, b) == f(b, a) | `a + b` |
| associativity | f(f(a, b), c) == f(a, f(b, c)) | `(a + b) + c` |
| identity | f(x, identity) == x | `x + 0` |
| invariance | property p holds before and after | list length after sort equals before |
| no exceptions | never crashes on valid input | parser handles any input |

### agent patterns for verification

#### pattern 1: specification generation

```
Agent Task: Given this code, generate a specification

Input: Source code
Output: Natural-language specification of behavior

Use when: Code exists but documentation is missing
```

#### pattern 2: invariant discovery

```
Agent Task: Identify invariants that should hold for this system

Input: Code + specification
Output: List of properties that should always be true

Use when: You need to understand what to test
```

#### pattern 3: property test generation

```
Agent Task: Generate property-based tests from this specification

Input: Specification
Output: Executable property tests (fast-check, Hypothesis, etc.)

Use when: You have a spec but no tests
```

### the "vericoding" workflow

traditional development: write code, write tests, hope it works.

**vericoding**: write spec, generate properties, generate tests, write code, verify.

```
Intention (What should this do?)
    |
    v
Spec (Formal or semi-formal description)
    |
    v
Properties (Invariants that should hold)
    |
    v
Tests (PBT or example-based)
    |
    v
Code (Implementation)
    |
    v
Verify (Run tests, check properties)
```

### tools and frameworks

#### property-based testing

| language | framework | link |
|---|---|---|
| javascript/typescript | fast-check | github.com/dubzzz/fast-check |
| python | hypothesis | hypothesis.works |
| rust | proptest | github.com/altsysrq/proptest |
| go | gopter | github.com/leanovate/gopter |
| java | jqwik | jqwik.net |

### what worked in practice

- pbt got prioritized over formal verification; the roi was higher
- agents got used for spec generation rather than proof, which fit what they were better at
- specs got human review before use, since agents could produce plausible-but-wrong specifications on their own
- properties won out over examples; one well-chosen property covered more ground than a hundred example tests
- round-trip tests caught a wide class of bugs on their own

### the ceiling

current agents could not:

- reliably prove mathematical theorems
- verify concurrent systems without human guidance
- replace formal methods for safety-critical systems

they could:

- generate specifications that humans could verify
- write property tests that caught real bugs
- explore state spaces faster than manual testing
- act as semantic oracles for non-deterministic output

human review, agent-generated specs, and property testing covered more ground together than any one of the three did alone.
