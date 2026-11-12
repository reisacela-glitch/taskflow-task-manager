
// ===================================
// TASKFLOW - TASK MANAGEMENT APP
// ===================================

// GET HTML ELEMENTS

const taskList = document.getElementById("taskList");
const addTaskBtn = document.getElementById("addTaskBtn");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const filterButtons = document.querySelectorAll(".filter");
const searchInput = document.getElementById("searchInput");
const completedNav = document.getElementById("completedNav");


// EDIT MODAL ELEMENTS

const editTaskModal = document.getElementById("editTaskModal");
const editTaskForm = document.getElementById("editTaskForm");

const editTaskTitle = document.getElementById("editTaskTitle");
const editTaskPriority = document.getElementById("editTaskPriority");
const editTaskDate = document.getElementById("editTaskDate");

const closeModalBtn = document.getElementById("closeModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editingTaskId = null;


// ===================================
// LOAD DATA FROM LOCAL STORAGE
// ===================================

let tasks = [];

try {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));
    tasks = Array.isArray(savedTasks) ? savedTasks : [];
} catch (error) {
    tasks = [];
}

let currentFilter = "all";

// ===================================
// SAVE TASKS
// ===================================

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// ===================================
// VALIDATE DATE (DD-MM-YYYY)
// ===================================

function isValidDate(date) {

    if (!/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        return false;
    }

    const [day, month, year] = date.split("-").map(Number);

    const parsedDate = new Date(year, month - 1, day);

    return (
        parsedDate.getDate() === day &&
        parsedDate.getMonth() === month - 1 &&
        parsedDate.getFullYear() === year
    );
}

// ===================================
// ADD NEW TASK
// ===================================

function addTask() {

    const title = prompt("Enter your task:");

    if (!title || title.trim() === "") {
        return;
    }

    const priority = prompt(
        "Choose priority: low, medium or high",
        "medium"
    );

    if (priority === null) {
        return;
    }

    const selectedPriority = priority.toLowerCase().trim();

    const validPriorities = ["low", "medium", "high"];

    if (!validPriorities.includes(selectedPriority)) {
        alert("Please enter low, medium or high.");
        return;
    }

    const dueDate = prompt(
        "Enter due date (DD-MM-YYYY), or leave empty:"
    );

    if (dueDate === null) {
        return;
    }

    const selectedDate = dueDate.trim();

    if (selectedDate !== "" && !isValidDate(selectedDate)) {
        alert("Please enter a valid date in DD-MM-YYYY format.");
        return;
    }

    const newTask = {
        id: Date.now() + Math.random(),
        title: title.trim(),
        completed: false,
        priority: selectedPriority,
        dueDate: selectedDate
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();
}

// ===================================
// EDIT TASK
// ===================================


// ===================================
// EDIT TASK
// ===================================

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) {
        return;
    }

    editingTaskId = id;

    editTaskTitle.value = task.title;
    editTaskPriority.value = task.priority || "medium";
    editTaskDate.value = task.dueDate || "";

    editTaskModal.classList.add("active");
}

// ===================================
// CLOSE EDIT MODAL
// ===================================

function closeEditModal() {

    editTaskModal.classList.remove("active");

    editingTaskId = null;

    editTaskForm.reset();
}

// ===================================
// SAVE EDITED TASK
// ===================================

editTaskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    if (editingTaskId === null) {
        return;
    }

    const task = tasks.find(task => task.id === editingTaskId);

    if (!task) {
        closeEditModal();
        return;
    }

    const newTitle = editTaskTitle.value.trim();
    const newPriority = editTaskPriority.value;
    const newDate = editTaskDate.value.trim();

    if (newTitle === "") {
        alert("Task name cannot be empty.");
        return;
    }

    if (!["low", "medium", "high"].includes(newPriority)) {
        alert("Please select a valid priority.");
        return;
    }

    if (newDate !== "" && !isValidDate(newDate)) {
        alert("Please enter a valid date in DD-MM-YYYY format.");
        return;
    }

    task.title = newTitle;
    task.priority = newPriority;
    task.dueDate = newDate;

    saveTasks();

    closeEditModal();

    renderTasks();

});

// ===================================
// MODAL BUTTON EVENTS
// ===================================

closeModalBtn.addEventListener("click", closeEditModal);

cancelEditBtn.addEventListener("click", closeEditModal);

// Close modal when clicking outside

editTaskModal.addEventListener("click", function(event) {

    if (event.target === editTaskModal) {
        closeEditModal();
    }

});

// Close modal with Escape key

document.addEventListener("keydown", function(event) {

    if (
        event.key === "Escape" &&
        editTaskModal.classList.contains("active")
    ) {
        closeEditModal();
    }

});

// ===================================
// COMPLETE TASK
// ===================================

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// ===================================
// DELETE TASK
// ===================================

function deleteTask(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
        return;
    }

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}

// ===================================
// FILTER TASKS
// ===================================

function filterTasks(filter) {

    currentFilter = filter;

    filterButtons.forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.filter === filter
        );

    });

    renderTasks();
}

// ===================================
// UPDATE STATISTICS
// ===================================

function updateStatistics() {

    totalTasks.textContent = tasks.length;

    pendingTasks.textContent =
        tasks.filter(task => !task.completed).length;

    completedTasks.textContent =
        tasks.filter(task => task.completed).length;
}

// ===================================
// PREVENT HTML INJECTION
// ===================================

function escapeHTML(text) {

    return String(text).replace(/[&<>"']/g, character => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"

    })[character]);

}

// ===================================
// DISPLAY TASKS
// ===================================

function renderTasks() {

    taskList.innerHTML = "";

    const searchTerm = searchInput.value.toLowerCase().trim();

    const filteredTasks = tasks.filter(task => {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "pending" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch =
            String(task.title || "").toLowerCase().includes(searchTerm);

        return matchesFilter && matchesSearch;

    });

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <p class="empty-message">
                No tasks found. Add your first task!
            </p>
        `;

    }

    filteredTasks.forEach(task => {

        const taskElement = document.createElement("div");

        taskElement.className = "task-item";

        const priority = ["low", "medium", "high"].includes(task.priority)
            ? task.priority
            : "medium";

        const dueDate = task.dueDate || "";

        taskElement.innerHTML = `

            <div class="task-info">

                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    aria-label="Complete task"
                >

                <div class="task-details">

                    <span class="${task.completed ? "completed" : ""}">
                        ${escapeHTML(task.title || "")}
                    </span>

                    <div class="task-meta">

                        <span class="priority ${priority}">
                            ${priority.toUpperCase()}
                        </span>

                        <small>
                            ${dueDate
                                ? "Due: " + escapeHTML(dueDate)
                                : "No deadline"}
                        </small>

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button class="edit-btn" type="button">
                    Edit
                </button>

                <button class="delete-btn" type="button">
                    Delete
                </button>

            </div>

        `;

        // CHECKBOX EVENT

        taskElement.querySelector("input").addEventListener(
            "change",
            () => toggleTask(task.id)
        );

        // EDIT EVENT

        taskElement.querySelector(".edit-btn").addEventListener(
            "click",
            () => editTask(task.id)
        );

        // DELETE EVENT

        taskElement.querySelector(".delete-btn").addEventListener(
            "click",
            () => deleteTask(task.id)
        );

        taskList.appendChild(taskElement);

    });

    updateStatistics();

}

// ===================================
// EVENT LISTENERS
// ===================================

// ADD TASK

addTaskBtn.addEventListener("click", addTask);

// SEARCH TASKS

searchInput.addEventListener("input", renderTasks);

// FILTER BUTTONS

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterTasks(button.dataset.filter);

    });

});

// COMPLETED NAVIGATION

completedNav.addEventListener("click", () => {

    filterTasks("completed");

});

// ===================================
// INITIALIZE APP
// ===================================

renderTasks();
