// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Queue_Item :: struct {
	task:     types.Task,
	priority: int,
	lease_ms: i64,
}

Scheduler :: struct {
	queue: []Queue_Item,
}

enqueue :: proc(scheduler: ^Scheduler, item: Queue_Item) {
	scheduler.queue = append(scheduler.queue, item)
}
