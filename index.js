/**
 * Configuration for the Todo Card
 * Target Date: March 1, 2026, 18:00 UTC
 */
const TODO_CONFIG = {
  dueDate: new Date("2026-03-01T18:00:00Z"),
  updateInterval: 60000, // Update every 60 seconds
};

/**
 * Calculates the human-readable time remaining
 * @param {Date} targetDate
 * @returns {string}
 */
function getTimeRemaining(targetDate) {
  const now = new Date();
  const diffInMs = targetDate - now;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  // Overdue logic
  if (diffInMs < 0) {
    const absHours = Math.abs(diffInHours);
    if (absHours < 1) return "Overdue by minutes";
    return `Overdue by ${absHours} hours`;
  }

  // Due Now logic (within 5 minutes)
  if (diffInMinutes <= 5) return "Due now!";

  // Future logic
  if (diffInDays >= 1) {
    return diffInDays === 1 ? "Due tomorrow" : `Due in ${diffInDays} days`;
  }

  return `Due in ${diffInHours} hours`;
}

/**
 * Updates the DOM elements for the Todo Card
 */
function updateTodoDisplay() {
  const timeRemainingEl = document.querySelector(
    '[data-testid="test-todo-time-remaining"]',
  );
  const statusEl = document.querySelector('[data-testid="test-todo-status"]');
  const checkbox = document.querySelector(
    '[data-testid="test-todo-complete-toggle"]',
  );

  if (timeRemainingEl) {
    timeRemainingEl.textContent = getTimeRemaining(TODO_CONFIG.dueDate);
  }

  // Handle Status Text based on checkbox
  if (checkbox && statusEl) {
    statusEl.textContent = checkbox.checked ? "Done" : "In Progress";
  }
}

function initTodoCard() {
  const checkbox = document.querySelector(
    '[data-testid="test-todo-complete-toggle"]',
  );
  const editBtn = document.querySelector(
    '[data-testid="test-todo-edit-button"]',
  );
  const deleteBtn = document.querySelector(
    '[data-testid="test-todo-delete-button"]',
  );

  // Completion Toggle
  checkbox?.addEventListener("change", () => {
    updateTodoDisplay();
    console.log(`Task completion status: ${checkbox.checked}`);
  });

  // Edit Button Action
  editBtn?.addEventListener("click", () => {
    console.log("edit clicked");
  });

  // Delete Button Action
  deleteBtn?.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this task?")) {
      alert("Delete clicked");
    }
  });

  // Start the timer for "Time Remaining" updates
  setInterval(updateTodoDisplay, TODO_CONFIG.updateInterval);

  // Initial run
  updateTodoDisplay();
}

// Run once the DOM is ready
document.addEventListener("DOMContentLoaded", initTodoCard);
