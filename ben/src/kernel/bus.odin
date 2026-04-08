// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Event_Bus :: struct {
	events: []types.Event,
}

publish :: proc(bus: ^Event_Bus, event: types.Event) {
	bus.events = append(bus.events, event)
}
