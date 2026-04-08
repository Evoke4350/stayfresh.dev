# Ben Syscalls

The initial syscall surface is small on purpose.

## Task

- `task.submit(spec)`
- `task.cancel(task_id)`
- `task.status(task_id)`

## Thread

- `thread.open(task_id)`
- `thread.resume(thread_id)`
- `thread.fork(thread_id)`

## Agent

- `agent.spawn(profile)`
- `agent.kill(agent_id)`

## Evaluation

- `eval.score(task_id, rubric_id)`
- `review.request(task_id)`

## Artifacts

- `artifact.list(task_id)`
- `artifact.read(artifact_id)`

## Event Kinds

- `task.submitted`
- `task.scheduled`
- `agent.spawned`
- `agent.exited`
- `thread.opened`
- `thread.updated`
- `rpc.request`
- `rpc.response`
- `tool.started`
- `tool.completed`
- `eval.completed`
- `review.completed`
- `artifact.created`
- `policy.blocked`
- `task.completed`
- `task.failed`
