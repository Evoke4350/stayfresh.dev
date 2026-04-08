// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

Worker_Process :: struct {
	pid:       int,
	binary:    string,
	arguments: []string,
	running:   bool,
}

spawn_worker :: proc(binary: string, arguments: []string) -> Worker_Process {
	return Worker_Process{binary = binary, arguments = arguments}
}

stop_worker :: proc(worker: ^Worker_Process) {
	worker.running = false
}
