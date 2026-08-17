---
title: what is prompting: operational constraints
description: prompting is a constrained pipeline where tokenization, max tokens, and control tokens form the operational boundaries that determine agent behavior.
section: research
date: 2026-04-07
tags: [prompting, tokenization, context-windows, agent-design]
draft: false
---

prompting wasn't abstract instruction-writing. it was a constrained pipeline where tokenization mechanics, token budgets, and control structures formed the actual boundaries within which agent behavior operated.

agents didn't see "prompts." they saw token sequences. understanding prompting meant understanding the mechanics that governed those sequences.

### the pipeline

prompts followed a deterministic 7-stage process:

1. **human input**: raw text (words, images, other media)
2. **tokenization**: conversion to numerical token ids (model-specific)
3. **token ids**: numerical representation ready for processing
4. **llm processing**: core computation phase
5. **output token ids**: numerical response
6. **detokenization**: conversion back to text tokens
7. **human-readable output**: final agent response

this pipeline was the mechanism. everything that happened to the prompt happened within this process.

### three hard constraints

#### 1. tokenization

tokenization was the compilation step. code gets compiled to machine instructions, and prompts got tokenized to numerical sequences the same way.

this had three practical implications:

- **token count varied by provider.** the same text tokenized differently in gpt-3, gpt-4, and gemini due to different tokenization algorithms.
- **token counting was budgetable.** usage could be measured with libraries (tiktoken for openai) or api feedback (gemini).
- **token efficiency mattered.** more concise prompts left room for agent responses without hitting max token limits.

for agent specification: tokenization meant agents didn't see structural hints in formatting. they saw token sequences. decomposing specifications into structured sequences, not prose, matched how agents actually processed input.

#### 2. max tokens

every llm had a context window limit: the maximum tokens it could process in a single interaction. this was a fixed architectural constraint, not a soft preference.

examples:

- gpt-3: 4,096 tokens
- gpt-4: 8,192 or 32,768 tokens (version-dependent)
- gemini 3: 1,048,576 tokens

how it constrained agents: if max_tokens = 8,192 and the prompt used 1,000 tokens, only 7,192 tokens remained for reasoning and output. agents couldn't reason deeper than the token budget allowed. token limits forced agents to compress reasoning or fail requests that exceeded capacity.

from a cost perspective: token limits translated directly to billing. most llm services charged (input_tokens + output_tokens) x price_per_token. larger context windows meant higher costs when fully used.

the context window functioned as the agent's working memory. a 4k token limit was fundamentally more constrained than a 1m token limit, and that affected what agents could hold in mind, what context they could reference, and what reasoning chains they could execute.

#### 3. control tokens

control tokens were special tokens that organized prompt regions and guided llm processing phases.

examples:

- `<|startoftext|>`: begin sequence
- `<|endoftext|>`: end sequence
- `<|user|>`: mark user message
- `<|assistant|>`: mark assistant message

these tokens were handled internally by modern apis (they weren't written explicitly in openai calls), but understanding them showed how prompts were actually structured. control tokens segmented reasoning phases and marked where one phase ended and another began, which explained why conversation state was preserved in message-based prompts but not in basic text prompts.

### prompt types as architectural choices

how prompts were structured directly affected agent capability.

#### basic text prompts

```
"Translate 'Hello' to French"
```

- single-turn only
- no conversation state
- no access to prior messages
- worked best for: one-off queries

#### messages prompts

```
[
  { role: "user", content: "Translate 'Hello' to French" },
  { role: "assistant", content: "Bonjour" },
  { role: "user", content: "And 'goodbye'?" }
]
```

- multi-turn with state
- prior messages available for context
- more token-expensive (full history included)
- worked best for: conversation, agents with memory

#### system prompts

```
system: "You are a French translator. Be concise."
user: "Translate 'Hello'"
```

- set operational boundaries
- persisted across conversation
- defined agent persona and constraints
- worked best for: defining agent behavior globally

the choice between basic and message-based prompts determined whether an agent could maintain reasoning continuity across multiple requests. it was an architectural constraint, not a minor implementation detail.

### prompt management

as prompts evolved, they needed versioning:

```
translation_openai_v1.0.0  # Initial version
translation_openai_v1.1.0  # Enhancement (minor version)
translation_openai_v2.0.0  # Major refactor (major version)
```

why versioning mattered:

- **a/b testing**: different prompt versions could be run against the same llm to measure effectiveness
- **rollback**: a previous version could be restored if a new one underperformed
- **provider-specific optimization**: the same task sometimes needed different prompts for gpt-4 vs gemini
- **performance tracking**: changes could be measured against output quality and token efficiency

### what this meant for design

agents couldn't be understood independently of their prompting mechanism. the tokenization pipeline, token limits, and control structures weren't implementation details. they were the operational constraints that determined what agents could do.

when specifications got designed with this in mind:

- tokenization got respected: specs were structured as token sequences, not prose
- tokens got budgeted: output space stayed reserved within context window limits
- system prompts defined agent boundaries globally, not per-request
- prompt type got chosen deliberately: messages-based for agents with memory, basic for stateless operations
- prompts got versioned, tracking which versions produced which behaviors

agents didn't follow instructions abstractly. they operated within tokenized, token-budgeted, control-structured pipelines. that's what "prompting" meant underneath the word.

### related notes

- [context is a budget](/research/context-is-a-budget/): token limits as a cognitive constraint
- [specs as shared reality](/research/specs-as-shared-reality/): how specification structure shaped agent behavior
- [protocol before personality](/research/protocol-before-personality/): structure ahead of persona
