// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

Event_Kind :: enum {
	Kernel_Booted,
	Task_Submitted,
	Task_Scheduled,
	Task_Attempted,
	Artifact_Created,
	Review_Completed,
	Task_Completed,
	Task_Failed,
	Kernel_Shutdown,
}

Event :: struct {
	kind:    Event_Kind,
	task_id: u64,
	message: string,
}

publish_event :: proc(kernel: ^Kernel, kind: Event_Kind, task_id: u64, message: string) {
	event := Event{
		kind = kind,
		task_id = task_id,
		message = message,
	}
	append(&kernel.events, event)
}
