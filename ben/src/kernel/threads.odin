// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Thread_Table :: struct {
	items: []types.Thread,
}

open_thread :: proc(task_id: types.Task_ID) -> types.Thread {
	return types.Thread{task_id = task_id, state = .Open}
}
