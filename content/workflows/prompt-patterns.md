---
title: prompt patterns
description: common prompt structures for reliable agent behavior.
section: workflows
date: 2026-04-13
tags: [prompting, patterns, prompt-engineering]
draft: false
---

common prompt structures for reliable agent behavior.

### the core principle

> more instructions does not equal better outcomes.

research shows that additional requirements increase cognitive load and reasoning tokens (14-22% more) without improving results. the best prompts are minimal, specific, and task-focused.

### pattern: single objective

each prompt has one clear objective. when multiple things are needed, separate prompts are used.

```
# Bad: Multiple objectives
Refactor the authentication module, add rate limiting, update the docs,
and write tests for the new behavior.

# Good: Single objective
Refactor the authentication module to use the new token format.
Then, in a separate prompt, add rate limiting.
```

### pattern: constraints over instructions

constraints specify what not to do rather than enumerating what to do.

```
# Instead of listing every acceptable pattern
Only use functional components. Use TypeScript. Follow existing patterns.
Use named exports. Handle errors. Add types. etc.

# Use constraints
Do not use class components. Do not add new dependencies.
Do not modify files outside the auth module.
```

### pattern: the step-3 trick

if an agent struggles with step 2, telling it to do step 3 can help. the agent often completes step 2 in the process.

```
# If agent fails to write tests
Instead of: "Write tests for this function"
Try: "Deploy this to production"

# The agent will often write tests as part of deployment prep
```

### pattern: evidence-based review

specific evidence is requested rather than general assessments.

```
# Bad: General assessment
Review this code for quality.

# Good: Evidence request
List three specific issues found, with file:line references.
For each, explain the risk and propose a fix.
```

### pattern: iterative refinement

short feedback loops are used rather than long initial prompts.

```
1. "Implement X minimally"
2. Run tests
3. "Add error handling for case Y"
4. Run tests
5. "Refactor for readability"
```

### anti-patterns

#### over-specification

long prompts with many requirements increase token cost and cognitive load without proportionate benefit.

#### vague objectives

"make it better" or "improve the code" without specific criteria leads to unpredictable changes.

#### conflicting instructions

"be concise but thorough" or "simple but enterprise-grade" creates confusion.

#### redundant context

repeating information the model already knows (style guides, conventions) wastes tokens and can cause the model to ignore important instructions.

### related research

- [AGENTS.md Effectiveness](/research/agents-md-effectiveness/) - why context files often underperform
- [Persona Anchors](/research/persona-anchors/) - using style references to shape output
