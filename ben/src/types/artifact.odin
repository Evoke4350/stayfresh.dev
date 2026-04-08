// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package types

Artifact_Kind :: enum {
	Diff,
	Log,
	Summary,
	Review,
	Score,
}

Artifact :: struct {
	id:      Artifact_ID,
	task_id: Task_ID,
	kind:    Artifact_Kind,
	path:    string,
}
