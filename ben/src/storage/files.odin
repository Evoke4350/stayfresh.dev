// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package storage

File_Store :: struct {
	root: string,
}

open_file_store :: proc(root: string) -> File_Store {
	return File_Store{root = root}
}
