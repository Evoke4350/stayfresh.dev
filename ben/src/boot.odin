// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

Boot_Config :: struct {
	workspace_root: string,
	policy_name:    string,
	rubric_id:      string,
}

Kernel :: struct {
	config:       Boot_Config,
	running:      bool,
	next_task_id: u64,
	tasks:        [dynamic]Task,
	events:       [dynamic]Event,
	artifacts:    [dynamic]Artifact,
	reviews:      [dynamic]Review_Result,
}

boot :: proc(config: Boot_Config) -> Kernel {
	kernel := Kernel{
		config = config,
		running = true,
		next_task_id = 1,
	}
	publish_event(&kernel, .Kernel_Booted, 0, "kernel booted")
	return kernel
}

shutdown :: proc(kernel: ^Kernel) {
	publish_event(kernel, .Kernel_Shutdown, 0, "kernel shutdown")
	kernel.running = false
}
