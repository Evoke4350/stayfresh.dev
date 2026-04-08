// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package storage

SQLite_Store :: struct {
	path: string,
}

open_sqlite_store :: proc(path: string) -> SQLite_Store {
	return SQLite_Store{path = path}
}
