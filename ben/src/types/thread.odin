// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package types

Thread_State :: enum {
	Closed,
	Open,
	Paused,
	Archived,
}

Thread :: struct {
	id:         Thread_ID,
	task_id:    Task_ID,
	state:      Thread_State,
	session_id: string,
}
