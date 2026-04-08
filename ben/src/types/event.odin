// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package types

Event_Kind :: enum {
	Task_Submitted,
	Task_Scheduled,
	Agent_Spawned,
	Agent_Exited,
	Thread_Opened,
	Thread_Updated,
	RPC_Request,
	RPC_Response,
	Tool_Started,
	Tool_Completed,
	Eval_Completed,
	Review_Completed,
	Artifact_Created,
	Policy_Blocked,
	Task_Completed,
	Task_Failed,
}

Event :: struct {
	kind:      Event_Kind,
	task_id:   Task_ID,
	thread_id: Thread_ID,
	message:   string,
}
