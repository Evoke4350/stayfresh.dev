// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

import "core:fmt"
import "core:os"

main :: proc() {
	config := Boot_Config{
		workspace_root = resolve_artifact_root(),
		policy_name = "default",
		rubric_id = "reward-rubric-v1",
	}

	brief, rubric, approved := build_rubric_with_developer()
	if !approved {
		fmt.println("Ben aborted: rubric not approved.")
		os.exit(1)
	}

	kernel := boot(config)
	task := submit_task(&kernel, brief.project_name, brief.must_have_outcomes)
	schedule_task(&kernel, task.id)
	register_fake_todo_artifacts(&kernel, task.id)
	attempt := run_codex_attempt(&kernel, task.id, brief, rubric)
	mark_task_reviewing(&kernel, task.id)
	review := review_todo_task(&kernel, task.id, brief, rubric)
	if review.passed {
		complete_task(&kernel, task.id)
	} else {
		fail_task(&kernel, task.id, "rubric review failed")
	}

	fmt.println("Ben booted")
	fmt.printf("workspace: %s\n", kernel.config.workspace_root)
	fmt.printf("tasks: %d\n", len(kernel.tasks))
	fmt.printf("artifacts: %d\n", len(kernel.artifacts))
	fmt.printf("codex exit: %d\n", attempt.exit_code)
	if attempt.last_message != "" {
		fmt.printf("codex: %s\n", trim_for_event(attempt.last_message))
	}
	fmt.printf("review: %d/%d\n", review.total, review.possible)
	fmt.printf("rubric: %s\n", review.rubric_name)
	for criterion in review.criteria {
		fmt.printf("- %s: %d/%d %s\n", criterion.name, criterion.score, criterion.weight, criterion.summary)
	}
	fmt.printf("events: %d\n", len(kernel.events))

	for event in kernel.events {
		fmt.printf("[%d] task=%d %s\n", int(event.kind), event.task_id, event.message)
	}

	shutdown(&kernel)
	fmt.printf("running: %v\n", kernel.running)
}
