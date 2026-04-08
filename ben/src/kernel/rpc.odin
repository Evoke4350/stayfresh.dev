// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

RPC_Request :: struct {
	id:     u64,
	method: string,
	params: string,
}

RPC_Response :: struct {
	id:     u64,
	result: string,
	error:  string,
}
