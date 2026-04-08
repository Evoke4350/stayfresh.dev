// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package types

Task_Status :: enum {
	Pending,
	Scheduled,
	Running,
	Reviewing,
	Completed,
	Failed,
	Blocked,
	Canceled,
}

Task_Spec :: struct {
	name:        string,
	objective:   string,
	workspace:   string,
	rubric_id:   string,
	policy_name: string,
}

Task :: struct {
	id:         Task_ID,
	status:     Task_Status,
	spec:       Task_Spec,
	thread_id:  Thread_ID,
	agent_id:   Agent_ID,
	attempts:   int,
	last_error: string,
}
