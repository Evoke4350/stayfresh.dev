// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Kernel_State :: struct {
	tasks:   []types.Task,
	threads: []types.Thread,
}

load_state :: proc() -> Kernel_State {
	return Kernel_State{}
}
