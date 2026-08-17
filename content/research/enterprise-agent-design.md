---
title: enterprise agent design
description: bcg framework for production-grade agents.
section: research
date: 2026-04-13
tags: [enterprise, agent-design, architecture, governance]
draft: false
---

**reference:** [building effective enterprise agents](https://www.bcg.com/assets/2025/building-effective-enterprise-agents.pdf) (bcg, november 2025)

bcg's ai platforms group published a framework for building production-grade enterprise agents.

### agent design cards (adcs)

agent design cards are bcg's standardized blueprint for documenting agent requirements. an adc covers:

1. **define purpose** - clearly describe what the agent is designed to achieve
2. **clarify boundaries** - specify the agent's role, scope, and points of human oversight
3. **detail inputs and outputs** - make data sources, dependencies, and deliverables explicit
4. **describe capabilities** - outline tools and capabilities needed for the agent's success
5. **anticipate failure** - define fallback behavior, escalation paths, and guardrails

#### example agent design card

```
Agent Goal: Reduce processing time for loan applications

Metrics:
  - 30% reduction in manual exception handling time

Skills, Tools & Capabilities:
  - Document parsing and field validation
  - Cross-system data reconciliation (CRM, Credit Bureau)
  - Policy-based reasoning for exception routing

Agent Trigger: System-led

Input(s) & Output(s):
  - Inputs: Loan application data, validation rules from policy database
  - Outputs: Audit log of actions and corrections performed, exceptions

Fallback:
  - Notify loan officer via workflow system for manual intervention

Priority: 1
```

### agent suitability framework

not every problem needs an agent. this framework maps the decision:

| | low risk/governance | high risk/governance |
|---|---|---|
| **high complexity** | agent-led with human oversight | human-led with agent support |
| **low complexity** | agent-led (full autonomy) | traditional automation |

if clear rules and basic automation deliver the desired outcome, building an agent adds little.

### agent maturity horizons

| horizon | type | description |
|---|---|---|
| 0 | constrained agents | predefined rules, single repetitive task |
| 1 | single agents | multi-step tasks in set environment, plans and acts alone |
| 2 | deep agents | orchestrator splits tasks for specialist agents |
| 3 | role-based agents | team of agents collaborate, distinct roles, handoffs |
| 4 | agent mesh | network of autonomous agents that self-organize |

bcg's own recommendation was to build toward horizon 2 (deep agents) rather than further out; fully autonomous mesh agents require reasoning and evaluation systems that were not yet mature.

### human oversight patterns

| pattern | description |
|---|---|
| agent-assisted | agent provides output to normal user workflow |
| human-in-the-loop | agent makes decision, awaits human approval |
| human-on-the-loop | user observes outputs, can intervene if issues flagged |
| human-out-of-the-loop | agent acts without explicit human oversight |

### design principles

#### start simple, iterate with evals

1. begin with a single observe-reason-act loop
2. introduce sub-flows only when complexity causes brittleness
3. add specialized agents only when domain-specific tasks require them

#### outcome-first design

design started from business outcomes ("what are we trying to achieve?"), then decomposed from there:

```
Outcome: 30% faster loan approvals
  -> Dependencies: document verification, exception handling, fewer manual handoffs
  -> Agent opportunities: automated resolutions, remediation suggestions
```

#### context engineering

strategies for keeping context from degrading:

| strategy | description |
|---|---|
| compression | summarize context as window nears limit |
| pruning | remove old or irrelevant content |
| ranking | ensure most relevant information is visible |
| isolation | split task/context across sub-agents |
| notes | let agents take structured notes during sessions |

### memory architecture

| type | description | duration |
|---|---|---|
| short-term (stm) | context window: instructions, knowledge, tools | single session |
| semantic (ltm) | abstract, factual, domain-specific knowledge | persistent |
| procedural (ltm) | how to perform tasks or skills | persistent |
| episodic (ltm) | past events as example behaviors | persistent |

### failure modes

| category | examples | mitigations |
|---|---|---|
| identity/auth | agent impersonated, unintended actions | unique identifiers, granular permissions, audit trails |
| data supply-chain | prompt injection, harmful content | input validation, xpia protection, monitor data flows |
| orchestration | tool failures, agent deadlocks | control flow guardrails, scoped environments |
| reasoning | hallucinations, task drift | monitor reasoning patterns, granular roles |
| operations | resource overuse, cost explosion | rate limits, timeouts, isolation |

### what this framework emphasized

- outcomes over outputs: measurable business outcomes anchored the design, not raw agent activity
- starting simple: a single observe-reason-act loop came before any multi-agent structure
- shared foundations: runtimes, gateways, and guardrails got standardized rather than rebuilt per agent
- platform choice driven by data gravity, governance, and where differentiation actually mattered
- trust engineered by default: identity, access control, monitoring, and evaluation built in rather than added later
