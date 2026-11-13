const API_URL = "https://jsonplaceholder.typicode.com/todos";

const state = {
  tasks: [],
  nextId: 1,
  apiTodos: [],
  filter: "all",
  search: "",
};

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const minutesInput = document.getElementById("task-minutes");
const formError = document.getElementById("form-error");
const taskList = document.getElementById("task-list");
const statTotal = document.getElementById("stat-total");
const statCompleted = document.getElementById("stat-completed");
const statPending = document.getElementById("stat-pending");

const apiList = document.getElementById("api-list");
const apiStatus = document.getElementById("api-status");
const searchInput = document.getElementById("search-input");
const refreshBtn = document.getElementById("refresh-btn");
const filterButtons = document.querySelectorAll(".filter");

function addTask(title, minutes) {
  const trimmed = title.trim();
  if (!trimmed) return false;
  const deadline = minutes > 0 ? Date.now() + minutes * 60000 : null;
  state.tasks.push({ id: state.nextId++, title: trimmed, completed: false, deadline });
  return true;
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((task) => task.id !== id);
}

function toggleTask(id) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
}

function getTaskStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  return { total, completed, pending: total - completed };
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = `item${task.completed ? " done" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;
  checkbox.dataset.action = "toggle";
  checkbox.dataset.id = task.id;
  checkbox.setAttribute("aria-label", `Mark "${task.title}" as completed`);

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = task.title;

  const del = document.createElement("button");
  del.className = "btn danger";
  del.textContent = "Delete";
  del.dataset.action = "delete";
  del.dataset.id = task.id;

  const timer = document.createElement("span");
  timer.className = "timer";
  timer.dataset.id = task.id;

  li.append(checkbox, title, timer, del);
  return li;
}

function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function updateTimers() {
  taskList.querySelectorAll(".timer").forEach((el) => {
    const task = state.tasks.find((t) => t.id === Number(el.dataset.id));
    if (!task || !task.deadline || task.completed) {
      el.textContent = "";
      el.classList.remove("expired");
      return;
    }
    const remaining = task.deadline - Date.now();
    if (remaining <= 0) {
      el.textContent = "Time's up";
      el.classList.add("expired");
    } else {
      el.textContent = formatRemaining(remaining);
      el.classList.remove("expired");
    }
  });
}

function renderTasks() {
  const fragment = document.createDocumentFragment();

  if (state.tasks.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No tasks yet. Add your first one above.";
    fragment.append(empty);
  } else {
    state.tasks.forEach((task) => fragment.append(createTaskItem(task)));
  }

  taskList.replaceChildren(fragment);

  const { total, completed, pending } = getTaskStats();
  statTotal.textContent = total;
  statCompleted.textContent = completed;
  statPending.textContent = pending;
  updateTimers();
}

function createApiItem(todo) {
  const li = document.createElement("li");
  li.className = `item${todo.completed ? " done" : ""}`;

  const id = document.createElement("span");
  id.className = "id";
  id.textContent = `#${todo.id}`;

  const title = document.createElement("span");
  title.className = "title";
  title.textContent = todo.title;

  const badge = document.createElement("span");
  badge.className = `badge ${todo.completed ? "completed" : "pending"}`;
  badge.textContent = todo.completed ? "Completed" : "Pending";

  li.append(id, title, badge);
  return li;
}

function getVisibleApiTodos() {
  const query = state.search.trim().toLowerCase();
  return state.apiTodos.filter((todo) => {
    const matchesFilter =
      state.filter === "all" ||
      (state.filter === "completed" && todo.completed) ||
      (state.filter === "pending" && !todo.completed);
    const matchesSearch = todo.title.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

function renderApiTodos() {
  const visible = getVisibleApiTodos();
  const fragment = document.createDocumentFragment();

  if (visible.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "No todos match your filter.";
    fragment.append(empty);
  } else {
    visible.forEach((todo) => fragment.append(createApiItem(todo)));
  }

  apiList.replaceChildren(fragment);

  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === state.filter);
  });
}

function setApiStatus(message, isError = false) {
  apiStatus.hidden = !message;
  apiStatus.textContent = message;
  apiStatus.classList.toggle("error", isError);
}

async function fetchTodos() {
  setApiStatus("Loading todos...");
  apiList.replaceChildren();
  refreshBtn.disabled = true;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const data = await response.json();
    state.apiTodos = data.slice(0, 50);
    setApiStatus("");
    renderApiTodos();
  } catch (error) {
    setApiStatus(`Could not load todos. ${error.message}. Check your connection and try again.`, true);
  } finally {
    refreshBtn.disabled = false;
  }
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const added = addTask(taskInput.value, Number(minutesInput.value));

  if (!added) {
    formError.textContent = "Task cannot be empty.";
    formError.hidden = false;
    return;
  }

  formError.hidden = true;
  taskInput.value = "";
  minutesInput.value = "";
  renderTasks();
});

taskList.addEventListener("click", (event) => {
  const target = event.target;
  const id = Number(target.dataset.id);

  if (target.dataset.action === "delete") {
    deleteTask(id);
    renderTasks();
  }
});

taskList.addEventListener("change", (event) => {
  const target = event.target;
  if (target.dataset.action === "toggle") {
    toggleTask(Number(target.dataset.id));
    renderTasks();
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    state.filter = btn.dataset.filter;
    renderApiTodos();
  });
});

searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  renderApiTodos();
});

refreshBtn.addEventListener("click", fetchTodos);

renderTasks();
setInterval(updateTimers, 1000);
fetchTodos();
