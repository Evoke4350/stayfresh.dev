// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

Artifact_Kind :: enum {
	HTML,
	CSS,
	JavaScript,
}

Artifact :: struct {
	task_id: u64,
	kind:    Artifact_Kind,
	path:    string,
}

register_artifact :: proc(kernel: ^Kernel, task_id: u64, kind: Artifact_Kind, path: string) {
	artifact := Artifact{
		task_id = task_id,
		kind = kind,
		path = path,
	}
	append(&kernel.artifacts, artifact)
	publish_event(kernel, .Artifact_Created, task_id, path)
}

register_fake_todo_artifacts :: proc(kernel: ^Kernel, task_id: u64) {
	register_artifact(kernel, task_id, .HTML, resolve_example_path(kernel.config.workspace_root, "index.html"))
	register_artifact(kernel, task_id, .CSS, resolve_example_path(kernel.config.workspace_root, "styles.css"))
	register_artifact(kernel, task_id, .JavaScript, resolve_example_path(kernel.config.workspace_root, "app.js"))
}
