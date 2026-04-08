// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

IPC_Frame :: struct {
	id:      u64,
	payload: string,
}

Transport :: struct {
	connected: bool,
}

send_frame :: proc(transport: ^Transport, frame: IPC_Frame) -> bool {
	_ = frame
	return transport.connected
}
