const STORAGE_KEY = "ben-todo-app-v1";
const DEFAULT_TASKS = [
  { id: crypto.randomUUID(), text: "Ship the task scheduler", done: false, createdAt: Date.now() - 86400000 },
  { id: crypto.randomUUID(), text: "Wire Codex App Server transport", done: true, createdAt: Date.now() - 43200000 },
  { id: crypto.randomUUID(), text: "Review output against the rubric", done: false, createdAt: Date.now() - 1800000 },
];

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const list = document.querySelector("#todo-list");
const emptyState = document.querySelector("#empty-state");
const status = document.querySelector("#status");
const taskCount = document.querySelector("#task-count");
const doneCount = document.querySelector("#done-count");
const completeAllButton = document.querySelector("#complete-all");
const clearCompletedButton = document.querySelector("#clear-completed");
const filterButtons = Array.from(document.querySelectorAll(".filter"));
const FILTER_LABELS = {
  all: "All",
  active: "Active",
  completed: "Completed",
};

let tasks = loadTasks();
let filter = "all";

render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();

  if (!text) {
    announce("Task text is required.");
    return;
  }

  tasks = [
    {
      id: crypto.randomUUID(),
      text,
      done: false,
      createdAt: Date.now(),
    },
    ...tasks,
  ];

  input.value = "";
  persist();
  render();
  announce(`Added task: ${text}`);
  input.focus();
});

completeAllButton.addEventListener("click", () => {
  if (!tasks.length) return;
  tasks = tasks.map((task) => ({ ...task, done: true }));
  persist();
  render();
  announce("All tasks completed.");
});

clearCompletedButton.addEventListener("click", () => {
  const removed = tasks.filter((task) => task.done).length;
  if (!removed) return;

  tasks = tasks.filter((task) => !task.done);
  persist();
  render();
  announce(`Cleared ${removed} completed task${removed === 1 ? "" : "s"}.`);
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filter = button.dataset.filter;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    render();
    announce(`${FILTER_LABELS[filter]} filter selected.`);
  });
});

list.addEventListener("change", (event) => {
  const checkbox = event.target.closest('input[type="checkbox"][data-id]');
  if (!checkbox) return;

  const task = tasks.find((item) => item.id === checkbox.dataset.id);
  if (!task) return;

  task.done = checkbox.checked;
  persist();
  render();
  announce(`${task.text} marked ${task.done ? "completed" : "active"}.`);
});

list.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-id]");
  if (!deleteButton) return;

  const id = deleteButton.dataset.deleteId;
  const task = tasks.find((item) => item.id === id);
  tasks = tasks.filter((item) => item.id !== id);
  persist();
  render();
  announce(`Deleted task: ${task ? task.text : "task"}.`);
});

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TASKS;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_TASKS;

    return parsed.filter(isValidTask);
  } catch {
    return DEFAULT_TASKS;
  }
}

function isValidTask(task) {
  return (
    task &&
    typeof task.id === "string" &&
    typeof task.text === "string" &&
    typeof task.done === "boolean" &&
    typeof task.createdAt === "number"
  );
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function render() {
  const visibleTasks = tasks.filter((task) => {
    if (filter === "active") return !task.done;
    if (filter === "completed") return task.done;
    return true;
  });

  const openCount = tasks.filter((task) => !task.done).length;
  const completedCount = tasks.length - openCount;

  taskCount.textContent = String(openCount);
  doneCount.textContent = String(completedCount);
  clearCompletedButton.disabled = completedCount === 0;
  completeAllButton.disabled = tasks.length === 0 || completedCount === tasks.length;
  list.setAttribute("aria-label", `${FILTER_LABELS[filter]} tasks`);

  list.innerHTML = "";
  emptyState.hidden = visibleTasks.length !== 0;

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `todo-item${task.done ? " is-done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-item__check";
    checkbox.checked = task.done;
    checkbox.dataset.id = task.id;
    checkbox.id = `task-${task.id}`;
    checkbox.setAttribute("aria-describedby", `task-meta-${task.id}`);

    const content = document.createElement("div");
    content.className = "todo-item__content";

    const label = document.createElement("label");
    label.className = "todo-item__label";
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    const meta = document.createElement("p");
    meta.className = "todo-item__meta";
    meta.id = `task-meta-${task.id}`;
    meta.textContent = task.done ? "Completed" : "Active";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "todo-item__delete";
    deleteButton.dataset.deleteId = task.id;
    deleteButton.setAttribute("aria-label", `Delete task: ${task.text}`);
    deleteButton.textContent = "Delete";

    content.append(label, meta);
    item.append(checkbox, content, deleteButton);
    list.append(item);
  });

  if (!visibleTasks.length) {
    emptyState.textContent =
      filter === "all" ? "No tasks yet. Add one to start the queue." : "No tasks in this filter. Switch views or add more work.";
  }
}

function announce(message) {
  status.textContent = "";
  requestAnimationFrame(() => {
    status.textContent = message;
  });
}
