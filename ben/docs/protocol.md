# Ben Protocol

The initial transport model is stdio JSON-RPC to a Codex App Server child
process.

## Transport

- `Ben` spawns App Server as a subprocess.
- Requests are sent over stdin.
- Responses and events are read from stdout.
- stderr is captured as diagnostics.

## Message Classes

- request
- response
- event
- error

## Requirements

- monotonically increasing request IDs
- event timestamps assigned by `Ben`
- bounded buffers and backpressure handling
- worker heartbeat or liveness checks
- protocol version handshake before scheduling work

## Error Model

Errors are classified before policy decisions or retries:

- transport error
- protocol error
- worker crash
- policy block
- evaluation failure
- storage failure

Transport and worker failures are retry candidates. Policy blocks are not.
