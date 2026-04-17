const state = {
  title: "Build a testable todo app with HTML, CSS, and JavaScript",
  description:
    "Do your best to complete this task in a way that is testable and maintainable.",
  priority: "High",
  status: "In Progress",
  dueDate: new Date("2026-03-01T18:00:00Z"),
  isExpanded: false,
};

const COLLAPSE_THRESHOLD = 120;

const el = {
  card: document.querySelector('[data-testid="test-todo-card"]'),
  title: document.querySelector('[data-testid="test-todo-title"]'),
  description: document.querySelector('[data-testid="test-todo-description"]'),
  priorityBadge: document.querySelector('[data-testid="test-todo-priority"]'),
  priorityIndicator: document.querySelector(
    '[data-testid="test-todo-priority-indicator"]',
  ),
  statusDisplay: document.querySelector('[data-testid="test-todo-status"]'),
  statusControl: document.querySelector(
    '[data-testid="test-todo-status-control"]',
  ),
  timeRemaining: document.querySelector(
    '[data-testid="test-todo-time-remaining"]',
  ),
  overdueIndicator: document.querySelector(
    '[data-testid="test-todo-overdue-indicator"]',
  ),
  checkbox: document.querySelector('[data-testid="test-todo-complete-toggle"]'),
  editBtn: document.querySelector('[data-testid="test-todo-edit-button"]'),
  deleteBtn: document.querySelector('[data-testid="test-todo-delete-button"]'),
  saveBtn: document.querySelector('[data-testid="test-todo-save-button"]'),
  cancelBtn: document.querySelector('[data-testid="test-todo-cancel-button"]'),
  editForm: document.querySelector('[data-testid="test-todo-edit-form"]'),
  viewMode: document.getElementById("view-mode"),
  editTitle: document.querySelector(
    '[data-testid="test-todo-edit-title-input"]',
  ),
  editDesc: document.querySelector(
    '[data-testid="test-todo-edit-description-input"]',
  ),
  editPriority: document.querySelector(
    '[data-testid="test-todo-edit-priority-select"]',
  ),
  editDueDate: document.querySelector(
    '[data-testid="test-todo-edit-due-date-input"]',
  ),
  expandToggle: document.querySelector(
    '[data-testid="test-todo-expand-toggle"]',
  ),
  collapsible: document.querySelector(
    '[data-testid="test-todo-collapsible-section"]',
  ),
};

/**
 * Returns human-readable time remaining and whether the task is overdue.
 * @param {Date} targetDate
 * @returns {{ text: string, overdue: boolean }}
 */
function getTimeRemaining(targetDate) {
  const now = new Date();
  const diffMs = targetDate - now;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMs < 0) {
    const absMin = Math.abs(diffMin);
    const absHours = Math.abs(diffHours);
    const absDays = Math.abs(diffDays);
    if (absMin < 60)
      return {
        text: `Overdue by ${absMin} minute${absMin !== 1 ? "s" : ""}`,
        overdue: true,
      };
    if (absDays < 1)
      return {
        text: `Overdue by ${absHours} hour${absHours !== 1 ? "s" : ""}`,
        overdue: true,
      };
    return {
      text: `Overdue by ${absDays} day${absDays !== 1 ? "s" : ""}`,
      overdue: true,
    };
  }

  if (diffMin <= 5) return { text: "Due now!", overdue: false };
  if (diffMin < 60)
    return { text: `Due in ${diffMin} minutes`, overdue: false };
  if (diffHours < 24)
    return { text: `Due in ${diffHours} hours`, overdue: false };
  if (diffDays === 1) return { text: "Due tomorrow", overdue: false };
  return { text: `Due in ${diffDays} days`, overdue: false };
}

/**
 * Updates the time remaining display.
 * Stops updating and shows "Completed" when status is Done.
 */
function updateTimeDisplay() {
  if (state.status === "Done") {
    el.timeRemaining.textContent = "Completed";
    el.timeRemaining.className = "time-remaining completed";
    el.overdueIndicator.style.display = "none";
    el.card.classList.remove("is-overdue");
    return;
  }

  const { text, overdue } = getTimeRemaining(state.dueDate);
  el.timeRemaining.textContent = text;
  el.timeRemaining.className = "time-remaining" + (overdue ? "" : " ok");
  el.overdueIndicator.style.display = overdue ? "inline-block" : "none";
  el.card.classList.toggle("is-overdue", overdue);
}

/**
 * Sets the task status and keeps checkbox, status display, and status control in sync.
 * @param {string} newStatus - "Pending" | "In Progress" | "Done"
 * @param {string} source    - "control" | "checkbox" | "edit"
 */
function setStatus(newStatus, source) {
  state.status = newStatus;
  el.statusDisplay.textContent = newStatus;
  el.statusDisplay.setAttribute("data-status", newStatus);
  if (source !== "control") el.statusControl.value = newStatus;
  if (source !== "checkbox") el.checkbox.checked = newStatus === "Done";
  el.card.classList.toggle("is-done", newStatus === "Done");
  updateTimeDisplay();
}

/**
 * Updates the priority badge and indicator dot.
 * @param {string} priority - "Low" | "Medium" | "High"
 */
function updatePriority(priority) {
  state.priority = priority;
  el.priorityBadge.textContent = priority;
  el.priorityBadge.setAttribute("data-priority", priority);
  el.priorityBadge.setAttribute("aria-label", `Priority: ${priority}`);
  el.priorityIndicator.setAttribute("data-priority", priority);
  el.priorityIndicator.title = `${priority} Priority`;
}

/**
 * Handles expand/collapse state for the description section.
 */
function updateExpandCollapse() {
  const needsToggle = state.description.length > COLLAPSE_THRESHOLD;
  el.expandToggle.style.display = needsToggle ? "inline-block" : "none";

  if (!needsToggle) {
    el.collapsible.classList.remove("collapsed");
    return;
  }

  el.collapsible.classList.toggle("collapsed", !state.isExpanded);
  el.expandToggle.textContent = state.isExpanded ? "Show less" : "Show more";
  el.expandToggle.setAttribute("aria-expanded", String(state.isExpanded));
}

/**
 * Switches the card into edit mode, .
 */
function enterEditMode() {
  const dueDateLocal = new Date(
    state.dueDate.getTime() - state.dueDate.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);

  el.editTitle.value = state.title;
  el.editDesc.value = state.description;
  el.editPriority.value = state.priority;
  el.editDueDate.value = dueDateLocal;

  el.viewMode.classList.add("hidden");
  el.editForm.classList.add("active");
  el.editTitle.focus();
}

/**
 * Exits edit mode. If save=true, applies changes to state and DOM.
 * Returns focus to the Edit button.
 * @param {boolean} save
 */
function exitEditMode(save) {
  if (save) {
    state.title = el.editTitle.value.trim() || state.title;
    state.description = el.editDesc.value.trim() || state.description;
    state.dueDate = el.editDueDate.value
      ? new Date(el.editDueDate.value)
      : state.dueDate;

    el.title.textContent = state.title;
    el.description.textContent = state.description;

    updatePriority(el.editPriority.value);
    updateExpandCollapse();
    updateTimeDisplay();
  }

  el.editForm.classList.remove("active");
  el.viewMode.classList.remove("hidden");
  el.editBtn.focus();
}

// Event Listeners

el.expandToggle.addEventListener("click", () => {
  state.isExpanded = !state.isExpanded;
  updateExpandCollapse();
});

el.statusControl.addEventListener("change", () => {
  setStatus(el.statusControl.value, "control");
});

el.checkbox.addEventListener("change", () => {
  setStatus(el.checkbox.checked ? "Done" : "Pending", "checkbox");
});

el.editBtn.addEventListener("click", enterEditMode);
el.saveBtn.addEventListener("click", () => exitEditMode(true));
el.cancelBtn.addEventListener("click", () => exitEditMode(false));

el.deleteBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to delete this task?")) {
    resetCard();
  }
});
el.editForm.addEventListener("keydown", (e) => {
  if (e.key === "Escape") exitEditMode(false);
});

updateExpandCollapse();
updateTimeDisplay();
setInterval(updateTimeDisplay, 30000);
