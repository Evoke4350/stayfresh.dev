// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package app_server

Client :: struct {
	endpoint: string,
	online:   bool,
}

connect :: proc(endpoint: string) -> Client {
	return Client{endpoint = endpoint, online = true}
}
