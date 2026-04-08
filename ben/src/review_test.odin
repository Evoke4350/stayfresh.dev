// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

import "core:testing"

@(test)
test_should_require_persistence :: proc(t: ^testing.T) {
	testing.expect(t, should_require_persistence("Persist tasks locally between refreshes"))
	testing.expect(t, !should_require_persistence("Stateless preview only"))
}

@(test)
test_mentions_any_is_case_insensitive :: proc(t: ^testing.T) {
	testing.expect(t, mentions_any("Semantic HTML and SCREEN-READER feedback", []string{"screen-reader"}))
	testing.expect(t, !mentions_any("plain html", []string{"react", "vue"}))
}

@(test)
test_score_forbidden_patterns_allows_safe_dom_reset :: proc(t: ^testing.T) {
	score, summary := score_forbidden_patterns(
		Developer_Brief{
			forbidden_patterns = "Frameworks, inline styles, and unsafe DOM injection",
		},
		"<main></main>",
		"list.innerHTML = \"\"",
		5,
	)

	testing.expect_value(t, score, 5)
	testing.expect_value(t, summary, "no forbidden patterns found")
}

@(test)
test_score_forbidden_patterns_rejects_insert_adjacent_html :: proc(t: ^testing.T) {
	score, summary := score_forbidden_patterns(
		Developer_Brief{
			forbidden_patterns = "Unsafe DOM injection",
		},
		"<main></main>",
		"list.insertAdjacentHTML('beforeend', user_input)",
		5,
	)

	testing.expect_value(t, score, 0)
	testing.expect_value(t, summary, "forbidden pattern detected")
}

@(test)
test_score_persistence_requires_sqlite_when_requested :: proc(t: ^testing.T) {
	score, _ := score_persistence("sqlite", "localStorage.setItem('x', 'y')", 4)
	testing.expect_value(t, score, 0)
}

@(test)
test_score_persistence_accepts_local_storage_when_requested :: proc(t: ^testing.T) {
	score, _ := score_persistence("persist locally between refreshes", "localStorage.setItem('x', JSON.stringify(tasks)); JSON.parse(raw)", 4)
	testing.expect_value(t, score, 4)
}
