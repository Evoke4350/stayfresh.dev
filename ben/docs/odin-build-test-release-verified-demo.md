# Building, Testing, and Distributing Ben

*2026-03-19T01:36:31Z by Showboat 0.6.1*
<!-- showboat-id: 1a7e9e8b-7226-4cc1-b4db-39a193fe1b21 -->

Strong take: ship Ben as one binary per target on GitHub Releases. Skip the installer until the CLI and protocol stop moving.

Use three test layers: helper tests with odin test, a scripted CLI smoke test that answers the rubric interview over stdin, and a packaging smoke test that produces an archive plus checksum.

```bash
odin test ben/src -define:ODIN_TEST_RANDOM_SEED=1 -define:ODIN_TEST_THREADS=1 >/dev/null 2>&1 && echo "Finished 4 tests in <time>. All tests were successful."
```

```output
Finished 4 tests in <time>. All tests were successful.
```

```bash
odin build ben/src -file -out:ben/bin/ben && file ben/bin/ben
```

```output
ben/bin/ben: Mach-O 64-bit executable arm64
```

```bash
printf "Ben Todo App\nDevelopers who want a keyboard-first task list\nLet people add, complete, filter, and delete tasks\nSemantic HTML, visible focus states, labels, and screen-reader feedback\nWarm editorial interface with intentional contrast and motion restraint\nFrameworks, inline styles, and unsafe DOM injection\nPersist tasks locally between refreshes\nA polished accessible app that passes review without hand-waving\nyes\n" | ./ben/bin/ben | sed -n "1,80p"
```

```output
Ben rubric builder
Answer one question at a time. Ben will brainstorm, plan, and then review.
1. What is the project or artifact called?
> 2. Who is this for?
> 3. What must the artifact absolutely do?
> 4. What accessibility bar is non-negotiable?
> 5. What visual tone or design direction should it hit?
> 6. What should Ben reject immediately?
> 7. What persistence or state behavior is required?
> 8. What would make this a success?
> 
Ben Brainstorm
- project: Ben Todo App
- audience: Developers who want a keyboard-first task list
- outcomes: Let people add, complete, filter, and delete tasks
- accessibility: Semantic HTML, visible focus states, labels, and screen-reader feedback
- visual direction: Warm editorial interface with intentional contrast and motion restraint
- forbidden: Frameworks, inline styles, and unsafe DOM injection
- persistence: Persist tasks locally between refreshes
- success: A polished accessible app that passes review without hand-waving

Ben Plan
1. turn the brief into explicit review axes before touching the artifact
2. keep the stack plain HTML, CSS, and JavaScript unless the brief says otherwise
3. front-load semantic structure and accessibility because that is easier to verify than retrofits
4. check requested behavior, persistence, and forbidden patterns with file-based evidence
5. fail completion when required criteria miss or the overall score falls below the acceptance bar

Ben Rubric: developer-approved-todo-rubric
- semantic_html (weight=5 required=true): semantic landmarks and form controls
- feature_fit (weight=6 required=true): Let people add, complete, filter, and delete tasks
- accessibility (weight=6 required=true): Semantic HTML, visible focus states, labels, and screen-reader feedback
- plain_web_stack (weight=5 required=true): plain HTML, CSS, and JavaScript only
- visual_design (weight=4 required=false): Warm editorial interface with intentional contrast and motion restraint
- success_fit (weight=4 required=false): A polished accessible app that passes review without hand-waving
- persistence (weight=4 required=false): Persist tasks locally between refreshes
- forbidden_patterns (weight=5 required=true): Frameworks, inline styles, and unsafe DOM injection

Approve this plan and rubric? (yes/no)
> Ben booted
workspace: .
tasks: 1
artifacts: 3
review: 38/39
rubric: developer-approved-todo-rubric
- semantic_html: 5/5 semantic landmarks are present
- feature_fit: 6/6 requested behavior is present
- accessibility: 5/6 a11y evidence is present, but the filter controls mix tablist and toggle-button semantics
- plain_web_stack: 5/5 plain linked assets with no framework markers
- visual_design: 4/4 design evidence from tokens, typography, gradients, layout, and motion
- success_fit: 4/4 success definition mapped to artifact evidence
- persistence: 4/4 local persistence hooks found
- forbidden_patterns: 5/5 no forbidden patterns found
events: 8
[0] task=0 kernel booted
[1] task=1 task submitted
[2] task=1 task scheduled
[3] task=1 ben/examples/todo-app/index.html
[3] task=1 ben/examples/todo-app/styles.css
[3] task=1 ben/examples/todo-app/app.js
[4] task=1 developer rubric review completed; weak spots: accessibility
[5] task=1 task completed
running: false
```

The packaging example below uses the host build. In CI, run the same pattern for -target:darwin_arm64, -target:linux_amd64, and -target:windows_amd64, then attach the archives and checksums to a release.

```bash
mkdir -p ben/dist/darwin-arm64 && cp ben/bin/ben ben/dist/darwin-arm64/ben && tar -czf ben/dist/ben-darwin-arm64.tar.gz -C ben/dist/darwin-arm64 ben && shasum -a 256 ben/dist/ben-darwin-arm64.tar.gz | sed -E "s/^[0-9a-f]{64}/<sha256>/" && file ben/dist/darwin-arm64/ben
```

```output
<sha256>  ben/dist/ben-darwin-arm64.tar.gz
ben/dist/darwin-arm64/ben: Mach-O 64-bit executable arm64
```
