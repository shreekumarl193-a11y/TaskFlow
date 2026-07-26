import { useEffect, useMemo, useState } from "react";
import "./App.css";

const priorityRank = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("taskflow-tasks")) || [];
    } catch {
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("taskflow-theme") === "dark";
  });

  const [taskText, setTaskText] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState("");

  const [editId, setEditId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    localStorage.setItem("taskflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "taskflow-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  const resetForm = () => {
    setTaskText("");
    setPriority("Medium");
    setCategory("Personal");
    setDueDate("");
    setEditId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const text = taskText.trim();

    if (!text) {
      return;
    }

    if (editId !== null) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editId
            ? {
                ...task,
                text,
                priority,
                category,
                dueDate,
              }
            : task
        )
      );
    } else {
      const newTask = {
        id: crypto.randomUUID(),
        text,
        priority,
        category,
        dueDate,
        completed: false,
        createdAt: Date.now(),
      };

      setTasks((currentTasks) => [newTask, ...currentTasks]);
    }

    resetForm();
  };

  const toggleComplete = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );

    if (editId === id) {
      resetForm();
    }
  };

  const startEdit = (task) => {
    setTaskText(task.text);
    setPriority(task.priority || "Medium");
    setCategory(task.category || "Personal");
    setDueDate(task.dueDate || "");
    setEditId(task.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearCompleted = () => {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => !task.completed)
    );
  };

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const activeTasks = totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : Math.round((completedTasks / totalTasks) * 100);

  const displayedTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === "active") {
      result = result.filter((task) => !task.completed);
    }

    if (filter === "completed") {
      result = result.filter((task) => task.completed);
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter(
        (task) =>
          task.text.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query) ||
          task.priority?.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "oldest") {
        return (a.createdAt || 0) - (b.createdAt || 0);
      }

      if (sortBy === "priority") {
        return (
          (priorityRank[b.priority] || 0) -
          (priorityRank[a.priority] || 0)
        );
      }

      if (sortBy === "due") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;

        return (
          new Date(a.dueDate).getTime() -
          new Date(b.dueDate).getTime()
        );
      }

      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return result;
  }, [tasks, filter, search, sortBy]);

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const isOverdue = (task) => {
    if (!task.dueDate || task.completed) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return new Date(`${task.dueDate}T00:00:00`) < today;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <main className="dashboard">

        {/* Header */}
        <header className="header">
          <div className="brand">
            <div className="logo">✓</div>

            <div>
              <h1>TaskFlow</h1>
              <p>Plan smarter. Work better.</p>
            </div>
          </div>

          <button
            className="theme-btn"
            onClick={() => setDarkMode((mode) => !mode)}
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </header>

        {/* Statistics */}
        <section className="stats">
          <div className="stat-card">
            <span>Total Tasks</span>
            <strong>{totalTasks}</strong>
            <small>Everything you've planned</small>
          </div>

          <div className="stat-card active-stat">
            <span>Active</span>
            <strong>{activeTasks}</strong>
            <small>Tasks waiting for you</small>
          </div>

          <div className="stat-card completed-stat">
            <span>Completed</span>
            <strong>{completedTasks}</strong>
            <small>Great work so far</small>
          </div>

          <div className="stat-card progress-stat">
            <span>Progress</span>
            <strong>{progress}%</strong>
            <small>Overall completion</small>
          </div>
        </section>

        {/* Progress */}
        <section className="progress-section">
          <div className="progress-info">
            <span>Today's productivity</span>
            <strong>{progress}% completed</strong>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </section>

        {/* Add/Edit Form */}
        <section className="task-form-card">
          <div className="section-heading">
            <div>
              <h2>
                {editId !== null
                  ? "Edit Task"
                  : "Create New Task"}
              </h2>

              <p>
                {editId !== null
                  ? "Update your task information."
                  : "Add something you want to accomplish."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="task-input-row">
              <input
                className="task-input"
                type="text"
                placeholder="What needs to be done?"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
              />

              <button className="add-btn" type="submit">
                {editId !== null ? "Save Changes" : "+ Add Task"}
              </button>
            </div>

            <div className="options-row">
              <div className="field">
                <label>Category</label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>Personal</option>
                  <option>Study</option>
                  <option>Work</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="field">
                <label>Priority</label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="field">
                <label>Due Date</label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {editId !== null && (
                <button
                  className="cancel-btn"
                  type="button"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Controls */}
        <section className="controls">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search your tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="due">Due Date</option>
          </select>
        </section>

        {/* Filter Tabs */}
        <section className="filter-section">
          <div className="filters">
            <button
              className={filter === "all" ? "selected" : ""}
              onClick={() => setFilter("all")}
            >
              All
              <span>{totalTasks}</span>
            </button>

            <button
              className={filter === "active" ? "selected" : ""}
              onClick={() => setFilter("active")}
            >
              Active
              <span>{activeTasks}</span>
            </button>

            <button
              className={
                filter === "completed" ? "selected" : ""
              }
              onClick={() => setFilter("completed")}
            >
              Completed
              <span>{completedTasks}</span>
            </button>
          </div>

          {completedTasks > 0 && (
            <button
              className="clear-btn"
              onClick={clearCompleted}
            >
              Clear Completed
            </button>
          )}
        </section>

        {/* Tasks */}
        <section className="task-list">
          {displayedTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-circle">✓</div>
              <h3>No tasks found</h3>
              <p>
                {search
                  ? "Try searching for something else."
                  : "Create your first task and start being productive."}
              </p>
            </div>
          ) : (
            displayedTasks.map((task) => (
              <article
                className={`task-card ${
                  task.completed ? "task-completed" : ""
                }`}
                key={task.id}
              >
                <button
                  className={
                    task.completed
                      ? "check-btn checked"
                      : "check-btn"
                  }
                  onClick={() => toggleComplete(task.id)}
                  aria-label="Toggle task"
                >
                  {task.completed ? "✓" : ""}
                </button>

                <div className="task-content">
                  <h3>{task.text}</h3>

                  <div className="task-meta">
                    <span className="category-badge">
                      {task.category || "Personal"}
                    </span>

                    <span
                      className={`priority-badge ${
                        task.priority || "Medium"
                      }`}
                    >
                      ● {task.priority || "Medium"} Priority
                    </span>

                    {task.dueDate && (
                      <span
                        className={
                          isOverdue(task)
                            ? "date-badge overdue"
                            : "date-badge"
                        }
                      >
                        📅 {formatDate(task.dueDate)}
                        {isOverdue(task) && " • Overdue"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="task-actions">
                  <button
                    className="edit-btn"
                    onClick={() => startEdit(task)}
                  >
                    ✎ Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => deleteTask(task.id)}
                  >
                    🗑 Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <footer>
          <p>
            TaskFlow • Stay focused, stay productive.
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;