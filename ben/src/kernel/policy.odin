// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Policy_Result :: struct {
	allowed: bool,
	reason:  string,
}

check_task_policy :: proc(profile: types.Policy_Profile, task: types.Task) -> Policy_Result {
	_ = profile
	_ = task
	return Policy_Result{allowed = true}
}
