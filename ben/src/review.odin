// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

import "core:bufio"
import "core:fmt"
import "core:io"
import "core:os"
import "core:strings"

Developer_Brief :: struct {
	project_name:            string,
	audience:                string,
	must_have_outcomes:      string,
	accessibility_bar:       string,
	visual_direction:        string,
	forbidden_patterns:      string,
	persistence_expectation: string,
	success_definition:      string,
}

Rubric_Criterion :: struct {
	name:     string,
	weight:   int,
	required: bool,
	summary:  string,
}

Review_Rubric :: struct {
	name:     string,
	criteria: [dynamic]Rubric_Criterion,
}

Criterion_Score :: struct {
	name:    string,
	score:   int,
	weight:  int,
	summary: string,
}

Review_Result :: struct {
	task_id:     u64,
	passed:      bool,
	total:       int,
	possible:    int,
	criteria:    [dynamic]Criterion_Score,
	conclusion:  string,
	rubric_name: string,
}

Feature_Check :: struct {
	label:   string,
	found:   bool,
	summary: string,
}

add_rubric_criterion :: proc(rubric: ^Review_Rubric, name: string, weight: int, required: bool, summary: string) {
	append(&rubric.criteria, Rubric_Criterion{
		name = name,
		weight = weight,
		required = required,
		summary = summary,
	})
}

add_criterion_score :: proc(result: ^Review_Result, name: string, score, weight: int, summary: string) {
	append(&result.criteria, Criterion_Score{
		name = name,
		score = score,
		weight = weight,
		summary = summary,
	})
	result.total += score
	result.possible += weight
}

ask_line :: proc(reader: ^bufio.Reader, prompt: string) -> string {
	fmt.printf("%s\n> ", prompt)
	line, err := bufio.reader_read_string(reader, '\n')
	if err != nil && err != .EOF {
		return ""
	}
	return strings.trim_space(line)
}

ask_with_fallback :: proc(reader: ^bufio.Reader, prompt, fallback: string) -> string {
	answer := ask_line(reader, prompt)
	if answer == "" {
		return fallback
	}
	return answer
}

contains_ci :: proc(text: string, needle: string) -> bool {
	if len(needle) == 0 {
		return true
	}
	if len(needle) > len(text) {
		return false
	}

	limit := len(text) - len(needle)
	for i := 0; i <= limit; i += 1 {
		if strings.equal_fold(text[i : i+len(needle)], needle) {
			return true
		}
	}
	return false
}

mentions_any :: proc(text: string, needles: []string) -> bool {
	for needle in needles {
		if contains_ci(text, needle) {
			return true
		}
	}
	return false
}

should_require_persistence :: proc(expectation: string) -> bool {
	if expectation == "" {
		return true
	}
	return !mentions_any(expectation, []string{"none", "stateless", "no persistence", "ephemeral", "memory only"})
}

print_plan :: proc(brief: Developer_Brief) {
	fmt.println("\nBen Brainstorm")
	fmt.printf("- project: %s\n", brief.project_name)
	fmt.printf("- audience: %s\n", brief.audience)
	fmt.printf("- outcomes: %s\n", brief.must_have_outcomes)
	fmt.printf("- accessibility: %s\n", brief.accessibility_bar)
	fmt.printf("- visual direction: %s\n", brief.visual_direction)
	fmt.printf("- forbidden: %s\n", brief.forbidden_patterns)
	fmt.printf("- persistence: %s\n", brief.persistence_expectation)
	fmt.printf("- success: %s\n", brief.success_definition)

	fmt.println("\nBen Plan")
	fmt.println("1. turn the brief into explicit review axes before touching the artifact")
	fmt.println("2. keep the stack plain HTML, CSS, and JavaScript unless the brief says otherwise")
	fmt.println("3. front-load semantic structure and accessibility because that is easier to verify than retrofits")
	fmt.println("4. check requested behavior, persistence, and forbidden patterns with file-based evidence")
	fmt.println("5. fail completion when required criteria miss or the overall score falls below the acceptance bar")
}

build_rubric :: proc(brief: Developer_Brief) -> Review_Rubric {
	rubric := Review_Rubric{name = "developer-approved-todo-rubric"}

	add_rubric_criterion(&rubric, "semantic_html", 5, true, "semantic landmarks and form controls")
	add_rubric_criterion(&rubric, "feature_fit", 6, true, brief.must_have_outcomes)
	add_rubric_criterion(&rubric, "accessibility", 6, true, brief.accessibility_bar)
	add_rubric_criterion(&rubric, "plain_web_stack", 5, true, "plain HTML, CSS, and JavaScript only")
	add_rubric_criterion(&rubric, "visual_design", 4, false, brief.visual_direction)
	add_rubric_criterion(&rubric, "success_fit", 4, false, brief.success_definition)

	if should_require_persistence(brief.persistence_expectation) {
		add_rubric_criterion(&rubric, "persistence", 4, false, brief.persistence_expectation)
	}

	add_rubric_criterion(&rubric, "forbidden_patterns", 5, true, brief.forbidden_patterns)
	return rubric
}

print_rubric :: proc(rubric: Review_Rubric) {
	fmt.printf("\nBen Rubric: %s\n", rubric.name)
	for criterion in rubric.criteria {
		fmt.printf("- %s (weight=%d required=%v): %s\n", criterion.name, criterion.weight, criterion.required, criterion.summary)
	}
}

build_rubric_with_developer :: proc() -> (Developer_Brief, Review_Rubric, bool) {
	reader: bufio.Reader
	bufio.reader_init(&reader, os.to_reader(os.stdin))
	defer bufio.reader_destroy(&reader)

	fmt.println("Ben rubric builder")
	fmt.println("Answer one question at a time. Ben will brainstorm, plan, and then review.")

	brief := Developer_Brief{
		project_name = ask_with_fallback(&reader, "1. What is the project or artifact called?", "Accessible todo app"),
		audience = ask_with_fallback(&reader, "2. Who is this for?", "Developers who want a fast keyboard-first task list"),
		must_have_outcomes = ask_with_fallback(&reader, "3. What must the artifact absolutely do?", "Let people add, complete, filter, and delete tasks"),
		accessibility_bar = ask_with_fallback(&reader, "4. What accessibility bar is non-negotiable?", "Semantic HTML, visible focus states, labels, and screen-reader feedback"),
		visual_direction = ask_with_fallback(&reader, "5. What visual tone or design direction should it hit?", "Warm editorial interface with intentional contrast and motion restraint"),
		forbidden_patterns = ask_with_fallback(&reader, "6. What should Ben reject immediately?", "Frameworks, inline styles, and unsafe DOM injection"),
		persistence_expectation = ask_with_fallback(&reader, "7. What persistence or state behavior is required?", "Persist tasks locally between refreshes"),
		success_definition = ask_with_fallback(&reader, "8. What would make this a success?", "A polished accessible app that passes review without hand-waving"),
	}

	print_plan(brief)
	rubric := build_rubric(brief)
	print_rubric(rubric)
	approval := strings.to_lower(ask_line(&reader, "\nApprove this plan and rubric? (yes/no)"))

	return brief, rubric, approval == "yes" || approval == "y"
}

read_file_string :: proc(path: string) -> string {
	data, err := os.read_entire_file(path, context.allocator)
	if err != nil {
		return ""
	}
	return string(data)
}

score_ratio :: proc(found, total, weight: int) -> int {
	if total <= 0 {
		return weight
	}
	return (found * weight) / total
}

count_hits :: proc(texts: []string, needles: []string) -> int {
	found := 0
	for needle in needles {
		for text in texts {
			if contains_ci(text, needle) {
				found += 1
				break
			}
		}
	}
	return found
}

make_feature_check :: proc(label: string, found: bool, summary: string) -> Feature_Check {
	return Feature_Check{
		label = label,
		found = found,
		summary = summary,
	}
}

expected_feature_checks :: proc(brief: Developer_Brief, html, js: string) -> [dynamic]Feature_Check {
	text := strings.concatenate([]string{brief.must_have_outcomes, "\n", brief.success_definition})
	checks: [dynamic]Feature_Check

	if mentions_any(text, []string{"add", "create", "new task", "capture"}) {
		append(&checks, make_feature_check("add", contains_ci(html, "todo-form") && contains_ci(js, "submit"), "add tasks"))
	}
	if mentions_any(text, []string{"complete", "toggle", "done", "check"}) {
		append(&checks, make_feature_check("complete", contains_ci(js, "checkbox") && contains_ci(js, "task.done"), "toggle completion"))
	}
	if mentions_any(text, []string{"delete", "remove", "clear"}) {
		append(&checks, make_feature_check("delete", contains_ci(js, "data-delete-id"), "delete tasks"))
	}
	if mentions_any(text, []string{"filter", "view", "segment"}) {
		append(&checks, make_feature_check("filter", contains_ci(html, "data-filter") && contains_ci(js, "filter ="), "filter tasks"))
	}
	if mentions_any(text, []string{"bulk", "all tasks", "clear completed"}) {
		append(&checks, make_feature_check("bulk actions", contains_ci(html, "complete-all") || contains_ci(html, "clear-completed"), "bulk task actions"))
	}

	if len(checks) == 0 {
		append(&checks, make_feature_check("add", contains_ci(html, "todo-form") && contains_ci(js, "submit"), "add tasks"))
		append(&checks, make_feature_check("complete", contains_ci(js, "checkbox") && contains_ci(js, "task.done"), "toggle completion"))
		append(&checks, make_feature_check("delete", contains_ci(js, "data-delete-id"), "delete tasks"))
	}

	return checks
}

feature_score :: proc(brief: Developer_Brief, html, js: string, weight: int) -> (int, string) {
	checks := expected_feature_checks(brief, html, js)
	if len(checks) == 0 {
		return weight, "no explicit feature asks, treated as satisfied"
	}

	found := 0
	missing: [dynamic]string
	for check in checks {
		if check.found {
			found += 1
		} else {
			append(&missing, check.summary)
		}
	}

	if len(missing) == 0 {
		return weight, "requested behavior is present"
	}

	return score_ratio(found, len(checks), weight), strings.concatenate([]string{"missing: ", strings.join(missing[:], ", ")})
}

score_accessibility :: proc(brief: Developer_Brief, html, css: string, weight: int) -> (int, string) {
	text := brief.accessibility_bar
	needles: [dynamic]string
	append(&needles, "<label", "aria-live", "aria-label", ":focus-visible")
	if mentions_any(text, []string{"screen reader", "screen-reader", "assistive"}) {
		append(&needles, "sr-only", "aria-atomic")
	}
	if mentions_any(text, []string{"keyboard", "focus"}) {
		append(&needles, "aria-pressed")
	}
	texts := []string{html, css}
	summary := "a11y evidence from labels, live regions, and focus handling"
	if mentions_any(text, []string{"vim", "hjkl", "hotkey", "keybinding", "keyboard-first"}) {
		append(&needles, "keydown", "event.key", "focus(")
		summary = "a11y evidence from labels, focus handling, and keyboard navigation hooks"
	}
	found := count_hits(texts, needles[:])
	if contains_ci(html, "role=\"tablist\"") && contains_ci(html, "aria-pressed") {
		found = max(found-1, 0)
		summary = "a11y evidence is present, but the filter controls mix tablist and toggle-button semantics"
	}
	return score_ratio(found, len(needles), weight), summary
}

score_visual_design :: proc(css: string, weight: int) -> (int, string) {
	needles := []string{":root", "@font-face", "radial-gradient", "linear-gradient", "box-shadow", "@media", "animation:"}
	found := count_hits([]string{css}, needles)
	return score_ratio(found, len(needles), weight), "design evidence from tokens, typography, gradients, layout, and motion"
}

score_persistence :: proc(expectation, js: string, weight: int) -> (int, string) {
	if mentions_any(expectation, []string{"sqlite", "sql", "database", "db"}) {
		needles := []string{"sqlite", "sql.js", "wa-sqlite", "better-sqlite", "database"}
		found := count_hits([]string{js}, needles)
		return score_ratio(found, len(needles), weight), "requested durable storage was checked against database markers"
	}

	needles := []string{"localStorage", "JSON.stringify", "JSON.parse"}
	found := count_hits([]string{js}, needles)
	return score_ratio(found, len(needles), weight), "local persistence hooks found"
}

score_success_fit :: proc(brief: Developer_Brief, html, css, js: string, weight: int) -> (int, string) {
	text := brief.success_definition
	checks: [dynamic]Feature_Check

	if mentions_any(text, []string{"accessible", "a11y", "screen reader", "keyboard"}) {
		append(&checks, make_feature_check("accessible", count_hits([]string{html, css}, []string{"<label", "aria-live", ":focus-visible"}) >= 3, "accessibility evidence"))
	}
	if mentions_any(text, []string{"polished", "beautiful", "visual", "nice", "editorial"}) {
		append(&checks, make_feature_check("polished", count_hits([]string{css}, []string{":root", "@font-face", "linear-gradient", "box-shadow"}) >= 3, "visual polish"))
	}
	if mentions_any(text, []string{"persist", "remember", "saved"}) {
		append(&checks, make_feature_check("persistent", count_hits([]string{js}, []string{"localStorage", "JSON.stringify", "JSON.parse"}) >= 3, "persistent state"))
	}
	if mentions_any(text, []string{"semantic"}) {
		append(&checks, make_feature_check("semantic", count_hits([]string{html}, []string{"<main", "<section", "<form", "<label"}) >= 4, "semantic HTML"))
	}

	if len(checks) == 0 {
		checks = expected_feature_checks(brief, html, js)
	}

	found := 0
	for check in checks {
		if check.found {
			found += 1
		}
	}
	return score_ratio(found, len(checks), weight), "success definition mapped to artifact evidence"
}

score_forbidden_patterns :: proc(brief: Developer_Brief, html, js: string, weight: int) -> (int, string) {
	bad := false
	summary := "no forbidden patterns found"

	if mentions_any(brief.forbidden_patterns, []string{"framework", "react", "vue", "svelte", "next", "astro"}) {
		bad = bad || contains_ci(html, "react") || contains_ci(html, "vue") || contains_ci(html, "svelte") || contains_ci(js, "from \"react\"")
	}
	if mentions_any(brief.forbidden_patterns, []string{"inline style", "style="}) {
		bad = bad || contains_ci(html, "style=")
	}
	if mentions_any(brief.forbidden_patterns, []string{"innerhtml", "unsafe dom", "unsafe injection"}) {
		unsafe_html_injection := contains_ci(js, "dangerouslySetInnerHTML") || contains_ci(js, "insertAdjacentHTML")
		if contains_ci(js, "innerHTML =") && !contains_ci(js, "innerHTML = \"\"") {
			unsafe_html_injection = true
		}
		bad = bad || unsafe_html_injection
	}
	if mentions_any(brief.forbidden_patterns, []string{"dangerouslysetinnerhtml"}) {
		bad = bad || contains_ci(js, "dangerouslySetInnerHTML")
	}

	if bad {
		summary = "forbidden pattern detected"
		return 0, summary
	}
	return weight, summary
}

criterion_required :: proc(name: string, rubric: Review_Rubric) -> bool {
	for criterion in rubric.criteria {
		if criterion.name == name {
			return criterion.required
		}
	}
	return false
}

review_todo_task :: proc(kernel: ^Kernel, task_id: u64, brief: Developer_Brief, rubric: Review_Rubric) -> Review_Result {
	html_path := resolve_example_path(kernel.config.workspace_root, "index.html")
	css_path := resolve_example_path(kernel.config.workspace_root, "styles.css")
	js_path := resolve_example_path(kernel.config.workspace_root, "app.js")
	framework_markers := []string{
		"from \"react\"",
		"from 'react'",
		"react-dom",
		"createRoot(",
		"createApp(",
		"new Vue(",
		"svelte/internal",
		"__NEXT_DATA__",
		"astro-island",
	}

	result := Review_Result{
		task_id = task_id,
		passed = true,
		conclusion = "developer rubric review completed",
		rubric_name = rubric.name,
	}

	if !os.exists(html_path) || !os.exists(css_path) || !os.exists(js_path) {
		result.passed = false
		result.conclusion = strings.concatenate([]string{"artifact files not found under ", kernel.config.workspace_root})
		append(&kernel.reviews, result)
		publish_event(kernel, .Review_Completed, task_id, result.conclusion)
		return result
	}

	html := read_file_string(html_path)
	css := read_file_string(css_path)
	js := read_file_string(js_path)

	for criterion in rubric.criteria {
		switch criterion.name {
		case "semantic_html":
			needles := []string{"<main", "<section", "<form", "<label", "<button", "<ul", "<h1", "<h2"}
			found := count_hits([]string{html}, needles)
			add_criterion_score(&result, criterion.name, score_ratio(found, len(needles), criterion.weight), criterion.weight, "semantic landmarks are present")
		case "feature_fit":
			score, summary := feature_score(brief, html, js, criterion.weight)
			add_criterion_score(&result, criterion.name, score, criterion.weight, summary)
		case "accessibility":
			score, summary := score_accessibility(brief, html, css, criterion.weight)
			add_criterion_score(&result, criterion.name, score, criterion.weight, summary)
		case "plain_web_stack":
			bad := count_hits([]string{html, js}, framework_markers) > 0
			score := criterion.weight
			if bad {
				score = 0
			}
			if contains_ci(html, "styles.css") && contains_ci(html, "app.js") && !bad {
				add_criterion_score(&result, criterion.name, score, criterion.weight, "plain linked assets with no framework markers")
			} else {
				add_criterion_score(&result, criterion.name, score, criterion.weight, "framework or bundler marker detected")
			}
		case "visual_design":
			score, summary := score_visual_design(css, criterion.weight)
			add_criterion_score(&result, criterion.name, score, criterion.weight, summary)
		case "success_fit":
			score, summary := score_success_fit(brief, html, css, js, criterion.weight)
			add_criterion_score(&result, criterion.name, score, criterion.weight, summary)
		case "persistence":
			score, summary := score_persistence(brief.persistence_expectation, js, criterion.weight)
			add_criterion_score(&result, criterion.name, score, criterion.weight, summary)
		case "forbidden_patterns":
			score, summary := score_forbidden_patterns(brief, html, js, criterion.weight)
			add_criterion_score(&result, criterion.name, score, criterion.weight, summary)
		}
	}

	required_failed := false
	weak_spots: [dynamic]string
	for score in result.criteria {
		if criterion_required(score.name, rubric) && score.score < max(score.weight-1, 1) {
			required_failed = true
		}
		if score.score < score.weight {
			append(&weak_spots, score.name)
		}
	}

	result.passed = !required_failed && result.total * 100 >= result.possible * 80
	if len(weak_spots) == 0 {
		result.conclusion = "developer rubric review completed with no visible weak spots"
	} else {
		result.conclusion = strings.concatenate([]string{"developer rubric review completed; weak spots: ", strings.join(weak_spots[:], ", ")})
	}
	append(&kernel.reviews, result)
	publish_event(kernel, .Review_Completed, task_id, result.conclusion)
	return result
}
