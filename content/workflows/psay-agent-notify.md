---
title: psay agent notifications
description: local voice and notification center loops for agent completion, handoff, and operator recall.
section: workflows
date: 2026-04-13
tags: [notifications, ops, agents]
draft: false
---

initial reconnaissance started with kittentts and `purr`.

execution moved to piper because the python toolchain was cleaner for local automation, scripting, and reproducible agent setup.

### three solid use cases

| use case | why it matters |
| --- | --- |
| long-running builds/tests | stops terminal polling and returns focus only when work is done. |
| agent handoff points | flags when an agent needs human input so loops do not stall silently. |
| risky local operations | announces success/failure and duration for migrations, deploy scripts, and data jobs. |

### advantages

- **lower context-switch cost** - fewer manual terminal checks
- **faster human response** - immediate handoff when input is required
- **better operational visibility** - duration and exit status are surfaced at completion time

### local push notifications on macos

yes. this is straightforward with notification center and does not require a cloud service.

preferred channel is `terminal-notifier` when installed; fallback is `osascript "display notification ..."`.

### hacker news signal

- [hn 38757107](https://news.ycombinator.com/item?id=38757107) - shell `preexec/precmd` snippet with thresholded completion notifications using `terminal-notifier`.
- [hn 36491704](https://news.ycombinator.com/item?id=36491704) - lightweight `osascript` notification helper for command completion.
- [hn 46794537](https://news.ycombinator.com/item?id=46794537) - recent agent workflow discussion combining notification center, voice output, and phone push channels.

### engineering enhancement implemented

`scripts/psay-notify.sh` is the first upgrade for this setup.

it wraps any command, tracks runtime, emits local notification on completion, and speaks status through piper (or falls back to `say`).

```
# notify + speak only when runtime >= 15s
scripts/psay-notify.sh --threshold 15 --title "Agent Run" -- make test

# quiet mode: desktop notification only
scripts/psay-notify.sh --no-speak --threshold 5 -- pnpm build
```

### why this enhancement wins

it addresses delayed awareness of completion and failure first.

no retraining, no custom voice dataset, no external infra. just faster operator feedback loops with local-only primitives.
