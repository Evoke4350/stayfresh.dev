// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package types

Workspace_Rule :: struct {
	root:     string,
	readable: bool,
	writable: bool,
}

Tool_Rule :: struct {
	name:    string,
	allowed: bool,
}

Policy_Profile :: struct {
	name:            string,
	workspace_rules: []Workspace_Rule,
	tool_rules:      []Tool_Rule,
	require_review:  bool,
}
