// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package kernel

import "../types"

Artifact_Store :: struct {
	items: []types.Artifact,
}

record_artifact :: proc(store: ^Artifact_Store, artifact: types.Artifact) {
	store.items = append(store.items, artifact)
}
