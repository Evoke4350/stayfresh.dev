// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Rubric_Criterion :: struct {
	name:     string,
	weight:   int,
	required: bool,
}

Rubric :: struct {
	id:        string,
	criteria:  []Rubric_Criterion,
	total_min: int,
}

Score_Result :: struct {
	task_id: types.Task_ID,
	total:   int,
	passed:  bool,
}

score_task :: proc(task_id: types.Task_ID, rubric: Rubric) -> Score_Result {
	_ = rubric
	return Score_Result{task_id = task_id}
}
