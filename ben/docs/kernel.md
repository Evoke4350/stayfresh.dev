# Ben Kernel

`Ben` is a user-space microkernel-like layer over Codex.

It treats Codex as the execution engine and keeps orchestration concerns
outside the model runtime.

## Responsibilities

- spawn and supervise Codex App Server workers
- schedule tasks and map them to Codex threads
- enforce policy before unsafe actions
- build review rubrics with the developer before accepting output
- persist task state and artifacts
- run rubric scoring and review after each attempt
- emit a normalized event stream for future clients

## Core Subsystems

- `kernel/proc` - worker lifecycle and restart policy
- `kernel/ipc` - stdio transport, framing, and backpressure
- `kernel/rpc` - request/response envelopes and method dispatch
- `kernel/sched` - task queue, leases, retries, and cancellation
- `kernel/threads` - Codex thread lifecycle
- `kernel/policy` - approval gates and workspace/tool restrictions
- `kernel/eval` - rubric scoring and critique hooks
- `kernel/state` - persisted kernel state
- `kernel/artifacts` - diffs, logs, summaries, and outputs
- `kernel/bus` - normalized event publication

## Boot Sequence

1. Load config, workspace roots, and policy profile.
2. Open state storage and replay unfinished tasks.
3. Start the event bus.
4. Spawn one Codex App Server worker.
5. Handshake protocol version and capabilities.
6. Start the scheduler loop.
7. Start `reviewd`.
8. Accept tasks and map them to Codex threads.
9. Persist events, artifacts, and scores.
10. Finalize accepted or rejected tasks.

## Deferred Work

- multi-host execution
- network API server
- web UI
- plugin system
- long-term semantic memory
- multi-agent tournaments
