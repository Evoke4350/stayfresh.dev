# Ben

`Ben` is an Odin microkernel-like control layer that sits above Codex.

Codex remains the execution engine. `Ben` owns scheduling, policy, memory,
evaluation, artifacts, and review.

## Scope

- one Codex App Server worker for the initial scaffold
- task scheduling and thread lifecycle
- policy checks before unsafe actions
- rubric scoring and review after task completion
- persistent state and artifact capture

## License

`Ben` source files are proprietary and carry per-file SPDX headers.

## Layout

```text
ben/
  README.md
  docs/
  src/
    main.odin
    types/
    kernel/
    app_server/
    storage/
    daemons/
    ui/
```

## MVP

The current MVP is a bootable Odin binary with a real review loop.

It now does six real things:

- asks the developer eight rubric-building questions
- prints a brainstorm summary and execution plan before review
- turns the answers into a weighted rubric with required criteria
- registers a task and its generated artifacts
- scores the artifact against file-based checks instead of a fake pass
- completes or fails the task based on rubric results

The deeper subsystem directories remain the intended kernel shape, but the
bootable root package under `src/` is now an executable proof of
developer-authored review.

## Build

```text
mkdir -p ben/bin
odin build ben/src -file -out:ben/bin/ben
./ben/bin/ben
```
