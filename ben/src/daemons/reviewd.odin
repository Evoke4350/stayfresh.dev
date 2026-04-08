// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package daemons

Review_Daemon :: struct {
	running: bool,
}

run_review_cycle :: proc(reviewd: ^Review_Daemon) {
	reviewd.running = true
}
