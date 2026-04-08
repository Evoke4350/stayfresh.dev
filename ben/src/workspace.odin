// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

import "core:os"

join_path_or_empty :: proc(elems: []string) -> string {
	return os.join_path(elems, context.allocator) or_else ""
}

find_artifact_root_from :: proc(start_dir: string) -> string {
	dir := os.clean_path(start_dir, context.allocator) or_else start_dir

	for dir != "" {
		bundle_example := join_path_or_empty([]string{dir, "examples", "todo-app", "index.html"})
		if os.exists(bundle_example) {
			return dir
		}

		repo_example := join_path_or_empty([]string{dir, "ben", "examples", "todo-app", "index.html"})
		if os.exists(repo_example) {
			return join_path_or_empty([]string{dir, "ben"})
		}

		parent, _ := os.split_path(dir)
		if parent == "" || parent == dir {
			break
		}
		dir = parent
	}

	return ""
}

resolve_artifact_root :: proc() -> string {
	cwd, cwd_err := os.getwd(context.allocator)
	if cwd_err == nil {
		root := find_artifact_root_from(cwd)
		if root != "" {
			return root
		}
	}

	exe_dir, exe_err := os.get_executable_directory(context.allocator)
	if exe_err == nil {
		root := find_artifact_root_from(exe_dir)
		if root != "" {
			return root
		}
	}

	if cwd_err == nil && cwd != "" {
		return cwd
	}

	return "."
}

resolve_example_path :: proc(root, filename: string) -> string {
	return join_path_or_empty([]string{root, "examples", "todo-app", filename})
}
