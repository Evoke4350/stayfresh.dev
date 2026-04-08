// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

Task_Status :: enum {
	Pending,
	Scheduled,
	Reviewing,
	Completed,
	Failed,
}

Task :: struct {
	id:        u64,
	name:      string,
	objective: string,
	status:    Task_Status,
}

submit_task :: proc(kernel: ^Kernel, name, objective: string) -> Task {
	task := Task{
		id = kernel.next_task_id,
		name = name,
		objective = objective,
		status = .Pending,
	}
	kernel.next_task_id += 1
	append(&kernel.tasks, task)
	publish_event(kernel, .Task_Submitted, task.id, "task submitted")
	return task
}

schedule_task :: proc(kernel: ^Kernel, task_id: u64) {
	for i in 0 ..< len(kernel.tasks) {
		if kernel.tasks[i].id == task_id {
			kernel.tasks[i].status = .Scheduled
			publish_event(kernel, .Task_Scheduled, task_id, "task scheduled")
			return
		}
	}
}

mark_task_reviewing :: proc(kernel: ^Kernel, task_id: u64) {
	for i in 0 ..< len(kernel.tasks) {
		if kernel.tasks[i].id == task_id {
			kernel.tasks[i].status = .Reviewing
			return
		}
	}
}

complete_task :: proc(kernel: ^Kernel, task_id: u64) {
	for i in 0 ..< len(kernel.tasks) {
		if kernel.tasks[i].id == task_id {
			kernel.tasks[i].status = .Completed
			publish_event(kernel, .Task_Completed, task_id, "task completed")
			return
		}
	}
}

fail_task :: proc(kernel: ^Kernel, task_id: u64, reason: string) {
	for i in 0 ..< len(kernel.tasks) {
		if kernel.tasks[i].id == task_id {
			kernel.tasks[i].status = .Failed
			publish_event(kernel, .Task_Failed, task_id, reason)
			return
		}
	}
}
