// SPDX-License-Identifier: LicenseRef-Proprietary
// Copyright (c) 2026 Nathaniel Bennett

package main

import "core:fmt"
import "core:io"
import "core:os"
import "core:strings"

Codex_Run_Result :: struct {
	success:      bool,
	exit_code:    int,
	stdout:       string,
	stderr:       string,
	last_message: string,
}

trim_for_event :: proc(text: string) -> string {
	if text == "" {
		return ""
	}

	compact := strings.trim_space(text)
	compact, _ = strings.replace_all(compact, "\n", " ")
	compact, _ = strings.replace_all(compact, "\r", " ")
	if len(compact) > 160 {
		return compact[:160]
	}
	return compact
}

build_rubric_prompt :: proc(rubric: Review_Rubric) -> string {
	lines: [dynamic]string
	for criterion in rubric.criteria {
		line := fmt.aprintf(
			"- %s weight=%d required=%v :: %s",
			criterion.name,
			criterion.weight,
			criterion.required,
			criterion.summary,
		)
		append(&lines, line)
	}
	return strings.join(lines[:], "\n")
}

build_codex_prompt :: proc(root: string, brief: Developer_Brief, rubric: Review_Rubric) -> string {
	return strings.concatenate([]string{
		"Update the bundled todo app in place.\n\n",
		"Target files:\n",
		"- examples/todo-app/index.html\n",
		"- examples/todo-app/styles.css\n",
		"- examples/todo-app/app.js\n\n",
		"Rules:\n",
		"- edit only those files unless absolutely necessary\n",
		"- keep the stack plain HTML, CSS, and JavaScript\n",
		"- preserve semantic HTML and accessibility\n",
		"- make the smallest set of changes that satisfies the brief and rubric\n",
		"- if a requirement cannot be fully satisfied, implement the closest honest version and say exactly what is still unmet in the final message\n\n",
		"Developer brief:\n",
		"- project: ", brief.project_name, "\n",
		"- audience: ", brief.audience, "\n",
		"- outcomes: ", brief.must_have_outcomes, "\n",
		"- accessibility: ", brief.accessibility_bar, "\n",
		"- visual direction: ", brief.visual_direction, "\n",
		"- forbidden: ", brief.forbidden_patterns, "\n",
		"- persistence: ", brief.persistence_expectation, "\n",
		"- success: ", brief.success_definition, "\n\n",
		"Rubric:\n",
		build_rubric_prompt(rubric),
		"\n\n",
		"Workspace root: ", root, "\n",
		"Modify the files now and finish with a short summary of what changed, what passed, and what remains missing.",
	})
}

find_codex_auth_path :: proc() -> string {
	codex_home := os.get_env("CODEX_HOME", context.allocator)
	if codex_home != "" {
		auth_path := join_path_or_empty([]string{codex_home, "auth.json"})
		if os.exists(auth_path) {
			return auth_path
		}
	}

	home_dir, home_err := os.user_home_dir(context.allocator)
	if home_err == nil && home_dir != "" {
		auth_path := join_path_or_empty([]string{home_dir, ".codex", "auth.json"})
		if os.exists(auth_path) {
			return auth_path
		}
	}

	return ""
}

write_codex_config :: proc(temp_home: string) -> os.Error {
	config_path := join_path_or_empty([]string{temp_home, "config.toml"})
	config := strings.concatenate([]string{
		"model = \"gpt-5.4\"\n",
		"personality = \"pragmatic\"\n",
		"model_reasoning_effort = \"medium\"\n",
	})
	return os.write_entire_file(config_path, config)
}

prepare_codex_home :: proc() -> (string, os.Error) {
	temp_home, temp_err := os.make_directory_temp("", "ben-codex-home-*", context.allocator)
	if temp_err != nil {
		return "", temp_err
	}

	auth_src := find_codex_auth_path()
	if auth_src == "" {
		_ = os.remove_all(temp_home)
		return "", os.Error(.Not_Exist)
	}

	auth_dst := join_path_or_empty([]string{temp_home, "auth.json"})
	if copy_err := os.copy_file(auth_dst, auth_src); copy_err != nil {
		_ = os.remove_all(temp_home)
		return "", copy_err
	}

	if config_err := write_codex_config(temp_home); config_err != nil {
		_ = os.remove_all(temp_home)
		return "", config_err
	}

	return temp_home, nil
}

build_codex_env :: proc(temp_home: string) -> []string {
	current_env, env_err := os.environ(context.allocator)
	if env_err != nil {
		fallback: [dynamic]string
		append(&fallback, strings.concatenate([]string{"CODEX_HOME=", temp_home}))
		return fallback[:]
	}

	filtered: [dynamic]string
	for entry in current_env {
		if !strings.has_prefix(entry, "CODEX_HOME=") {
			append(&filtered, entry)
		}
	}
	append(&filtered, strings.concatenate([]string{"CODEX_HOME=", temp_home}))
	return filtered[:]
}

create_prompt_file :: proc(dir, prompt: string) -> (^os.File, string, os.Error) {
	prompt_file, prompt_err := os.create_temp_file(dir, "codex-prompt-*.txt")
	if prompt_err != nil {
		return nil, "", prompt_err
	}

	if _, write_err := os.write_string(prompt_file, prompt); write_err != nil {
		path := os.name(prompt_file)
		_ = os.close(prompt_file)
		_ = os.remove(path)
		return nil, "", write_err
	}

	if _, seek_err := os.seek(prompt_file, 0, io.Seek_From.Start); seek_err != nil {
		path := os.name(prompt_file)
		_ = os.close(prompt_file)
		_ = os.remove(path)
		return nil, "", seek_err
	}

	return prompt_file, os.name(prompt_file), nil
}

run_codex_attempt :: proc(kernel: ^Kernel, task_id: u64, brief: Developer_Brief, rubric: Review_Rubric) -> Codex_Run_Result {
	message_path := join_path_or_empty([]string{kernel.config.workspace_root, ".ben-codex-last-message.txt"})
	prompt := build_codex_prompt(kernel.config.workspace_root, brief, rubric)
	_ = os.remove(message_path)

	temp_home, temp_err := prepare_codex_home()
	if temp_err != nil {
		result := Codex_Run_Result{
			stderr = fmt.aprintf("failed to prepare isolated codex home: %v", temp_err),
		}
		publish_event(kernel, .Task_Attempted, task_id, trim_for_event(result.stderr))
		return result
	}
	defer _ = os.remove_all(temp_home)

	prompt_file, prompt_path, prompt_err := create_prompt_file(temp_home, prompt)
	if prompt_err != nil {
		result := Codex_Run_Result{
			stderr = fmt.aprintf("failed to prepare codex prompt: %v", prompt_err),
		}
		publish_event(kernel, .Task_Attempted, task_id, trim_for_event(result.stderr))
		return result
	}
	defer _ = os.close(prompt_file)
	defer _ = os.remove(prompt_path)

	command := []string{
		"codex",
		"exec",
		"-C", kernel.config.workspace_root,
		"-s", "workspace-write",
		"--skip-git-repo-check",
		"--ephemeral",
		"--json",
		"-o", message_path,
		"-",
	}

	desc := os.Process_Desc{
		working_dir = kernel.config.workspace_root,
		command = command,
		env = build_codex_env(temp_home),
		stdin = prompt_file,
	}

	state, stdout_b, stderr_b, err := os.process_exec(desc, context.allocator)
	defer delete(stdout_b)
	defer delete(stderr_b)

	result := Codex_Run_Result{
		success = err == nil && state.exited && state.exit_code == 0,
		exit_code = state.exit_code,
		stdout = string(stdout_b),
		stderr = string(stderr_b),
		last_message = read_file_string(message_path),
	}

	if err != nil {
		result.stderr = fmt.aprintf("process error: %v", err)
	}

	event_message := trim_for_event(result.last_message)
	if event_message == "" {
		if result.success {
			event_message = "codex attempt finished"
		} else {
			event_message = fmt.aprintf("codex attempt failed (exit=%d)", result.exit_code)
		}
	}
	publish_event(kernel, .Task_Attempted, task_id, event_message)
	return result
}
