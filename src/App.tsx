import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  CloudSun,
  Coffee,
  Flame,
  Heart,
  LayoutDashboard,
  Leaf,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Star,
  Sun,
  Target,
  Trash2,
  X,
} from "lucide-react";

type Priority = "high" | "medium" | "low";
type Task = {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  done: boolean;
  date: string;
};
type Habit = { id: string; title: string; emoji: string; completed: string[] };
type View = "dashboard" | "tasks" | "habits";
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const today = dateKey(new Date());
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Plan out my week",
    category: "Personal",
    priority: "high",
    done: false,
    date: today,
  },
  {
    id: "2",
    title: "Work on portfolio project",
    category: "Work",
    priority: "high",
    done: false,
    date: today,
  },
  {
    id: "3",
    title: "Go for an afternoon walk",
    category: "Wellness",
    priority: "medium",
    done: true,
    date: today,
  },
  {
    id: "4",
    title: "Read for 20 minutes",
    category: "Personal",
    priority: "low",
    done: false,
    date: today,
  },
  {
    id: "5",
    title: "Organize my workspace",
    category: "Work",
    priority: "medium",
    done: false,
    date: today,
  },
];
const initialHabits: Habit[] = [
  { id: "1", title: "Drink water", emoji: "💧", completed: [today] },
  { id: "2", title: "Move my body", emoji: "🌷", completed: [] },
  { id: "3", title: "Read a little", emoji: "📖", completed: [] },
  { id: "4", title: "Take a mindful break", emoji: "🧘", completed: [today] },
];
function useStored<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}
const formatDate = (d: Date) =>
  d.toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
const uid = () => crypto.randomUUID();
function App() {
  const [tasks, setTasks] = useStored<Task[]>(
    "daydream-tasks-v1",
    initialTasks,
  );
  const [habits, setHabits] = useStored<Habit[]>(
    "daydream-habits-v1",
    initialHabits,
  );
  const [view, setView] = useState<View>("dashboard");
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [modal, setModal] = useState<"task" | "habit" | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<Priority>("medium");
  const [emoji, setEmoji] = useState("🌸");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [mobileNav, setMobileNav] = useState(false);
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const completed = dayTasks.filter((t) => t.done).length;
  const progress = dayTasks.length
    ? Math.round((completed / dayTasks.length) * 100)
    : 0;
  const habitCount = habits.filter((h) =>
    h.completed.includes(selectedDate),
  ).length;
  const visibleTasks = dayTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || (filter === "completed" ? t.done : !t.done)),
  );
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate + "T12:00:00");
    const weekday = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - weekday);
    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(d);
      x.setDate(d.getDate() + i);
      return x;
    });
  }, [selectedDate]);
  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);
    return Array.from(
      {
        length:
          35 +
          (offset +
            new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate() >
          35
            ? 7
            : 0),
      },
      (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
      },
    );
  }, [month]);
  function save() {
    if (!title.trim()) return;
    if (modal === "task")
      setTasks((prev) => [
        ...prev,
        {
          id: uid(),
          title: title.trim(),
          category,
          priority,
          done: false,
          date: selectedDate,
        },
      ]);
    else
      setHabits((prev) => [
        ...prev,
        { id: uid(), title: title.trim(), emoji, completed: [] },
      ]);
    setTitle("");
    setModal(null);
  }
  function toggleTask(id: string) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }
  function toggleHabit(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completed: h.completed.includes(selectedDate)
                ? h.completed.filter((d) => d !== selectedDate)
                : [...h.completed, selectedDate],
            }
          : h,
      ),
    );
  }
  const weekCompleted = weekDays.map(
    (d) => tasks.filter((t) => t.date === dateKey(d) && t.done).length,
  );
  const maxWeek = Math.max(1, ...weekCompleted);
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "show" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Sparkles size={22} />
          </div>
          <span>
            daydream<span className="brand-dot">.</span>
          </span>
        </div>
        <div className="side-caption">YOUR SPACE</div>
        <nav className="nav">
          <button
            className={view === "dashboard" ? "active" : ""}
            onClick={() => {
              setView("dashboard");
              setMobileNav(false);
            }}
          >
            <LayoutDashboard size={19} /> Overview
          </button>
          <button
            className={view === "tasks" ? "active" : ""}
            onClick={() => {
              setView("tasks");
              setMobileNav(false);
            }}
          >
            <CheckCircle2 size={19} /> My tasks{" "}
            <span className="nav-count">
              {tasks.filter((t) => !t.done).length}
            </span>
          </button>
          <button
            className={view === "habits" ? "active" : ""}
            onClick={() => {
              setView("habits");
              setMobileNav(false);
            }}
          >
            <Heart size={19} /> My habits
          </button>
        </nav>
        <div className="side-caption second">LITTLE REMINDERS</div>
        <div className="quote">
          <div className="quote-icon">✿</div>
          <p>Progress, not perfection. Every little step counts.</p>
          <span>YOU'VE GOT THIS ♡</span>
        </div>
        <div className="side-bottom">
          <div className="avatar">Y</div>
          <div>
            <strong>Your cozy space</strong>
            <small>One day at a time ✨</small>
          </div>
          <MoreHorizontal size={20} />
        </div>
      </aside>
      {mobileNav && (
        <button
          className="scrim"
          onClick={() => setMobileNav(false)}
          aria-label="Close navigation"
        />
      )}
      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileNav(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>
          <div className="breadcrumb">
            My workspace <span>/</span>{" "}
            <strong>
              {view === "dashboard"
                ? "Overview"
                : view === "tasks"
                  ? "My tasks"
                  : "My habits"}
            </strong>
          </div>
          <div className="top-actions">
            <span className="date-top">
              <CalendarDays size={16} />
              {new Date().toLocaleDateString("en-CA", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <div className="top-avatar">Y</div>
          </div>
        </header>
        <div className="content">
          <section className="greeting">
            <div>
              <div className="eyebrow">
                <Sun size={16} /> A FRESH START, EVERY DAY
              </div>
              <h1>
                {view === "dashboard"
                  ? "Make today a lovely one"
                  : view === "tasks"
                    ? "Your little to-do list"
                    : "Little habits, big changes"}{" "}
                <span className="flower">✿</span>
              </h1>
              <p>
                {view === "dashboard"
                  ? "Here's your cozy corner to get things done, at your own pace."
                  : view === "tasks"
                    ? "One task at a time. You’re doing great!"
                    : "Show up for yourself in the little ways that matter."}
              </p>
            </div>
            <div className="greeting-art">
              <span className="sun-art">☀</span>
              <span className="plant-art">🌿</span>
              <span className="spark-art">✧</span>
            </div>
          </section>
          {view === "dashboard" && (
            <>
              <section className="stats-grid">
                <div className="stat-card pink">
                  <div className="stat-icon">
                    <CheckCircle2 size={21} />
                  </div>
                  <span>Tasks completed</span>
                  <div className="stat-value">
                    {completed}
                    <small> / {dayTasks.length}</small>
                  </div>
                  <div className="stat-note">
                    One thing at a time <ArrowUpRight size={15} />
                  </div>
                </div>
                <div className="stat-card lavender">
                  <div className="stat-icon">
                    <Target size={21} />
                  </div>
                  <span>Daily progress</span>
                  <div className="stat-value">
                    {progress}
                    <small>%</small>
                  </div>
                  <div className="mini-progress">
                    <div style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="stat-card peach">
                  <div className="stat-icon">
                    <Flame size={21} />
                  </div>
                  <span>Habits checked</span>
                  <div className="stat-value">
                    {habitCount}
                    <small> / {habits.length}</small>
                  </div>
                  <div className="stat-note">
                    Keep your rhythm <Star size={15} />
                  </div>
                </div>
              </section>
              <div className="dashboard-grid">
                <section className="panel tasks-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        Today's priorities <span>✦</span>
                      </h2>
                      <p>A little progress goes a long way</p>
                    </div>
                    <button
                      className="subtle-button"
                      onClick={() => setView("tasks")}
                    >
                      View all <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="task-list">
                    {dayTasks.slice(0, 5).map((t) => (
                      <TaskRow
                        key={t.id}
                        task={t}
                        onToggle={() => toggleTask(t.id)}
                      />
                    ))}
                    {dayTasks.length === 0 && (
                      <p className="empty">
                        No tasks for this day. A fresh start! 🌸
                      </p>
                    )}
                  </div>
                  <button className="add-line" onClick={() => setModal("task")}>
                    <Plus size={17} /> Add a new task
                  </button>
                </section>
                <section className="panel habits-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        Daily rituals <span>♡</span>
                      </h2>
                      <p>Small habits, happy days</p>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => setView("habits")}
                      aria-label="View habits"
                    >
                      <ArrowUpRight size={18} />
                    </button>
                  </div>
                  <div className="habits-list">
                    {habits.slice(0, 5).map((h) => (
                      <HabitRow
                        key={h.id}
                        habit={h}
                        checked={h.completed.includes(selectedDate)}
                        onToggle={() => toggleHabit(h.id)}
                      />
                    ))}
                  </div>
                  <button
                    className="add-line"
                    onClick={() => setModal("habit")}
                  >
                    <Plus size={17} /> Add a new habit
                  </button>
                </section>
              </div>
              <div className="bottom-grid">
                <section className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        This week's flow <span>✧</span>
                      </h2>
                      <p>Look at all the things you've done</p>
                    </div>
                    <span className="soft-tag">
                      This week <ChevronDown size={14} />
                    </span>
                  </div>
                  <div className="bars">
                    {weekDays.map((d, i) => (
                      <div className="bar-col" key={i}>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${Math.max(weekCompleted[i] ? 15 : 5, (weekCompleted[i] / maxWeek) * 100)}%`,
                            }}
                          />
                        </div>
                        <span>
                          {d.toLocaleDateString("en-CA", { weekday: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="panel calendar-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>
                        Calendar <span>✿</span>
                      </h2>
                      <p>Find your rhythm</p>
                    </div>
                    <div className="month-nav">
                      <button
                        onClick={() =>
                          setMonth(
                            new Date(
                              month.getFullYear(),
                              month.getMonth() - 1,
                              1,
                            ),
                          )
                        }
                        aria-label="Previous month"
                      >
                        <ArrowLeft size={15} />
                      </button>
                      <strong>
                        {month.toLocaleDateString("en-CA", {
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                      <button
                        onClick={() =>
                          setMonth(
                            new Date(
                              month.getFullYear(),
                              month.getMonth() + 1,
                              1,
                            ),
                          )
                        }
                        aria-label="Next month"
                      >
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                  <CalendarGrid
                    days={calendarDays}
                    month={month}
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    tasks={tasks}
                  />
                </section>
              </div>
            </>
          )}
          {view === "tasks" && (
            <section className="panel full-panel">
              <div className="panel-heading">
                <div>
                  <h2>
                    Tasks for{" "}
                    {new Date(selectedDate + "T12:00:00").toLocaleDateString(
                      "en-CA",
                      { month: "long", day: "numeric" },
                    )}
                  </h2>
                  <p>
                    {completed} of {dayTasks.length} completed
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setModal("task")}
                >
                  <Plus size={17} /> New task
                </button>
              </div>
              <div className="task-toolbar">
                <div className="search-box">
                  <Search size={17} />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search your tasks..."
                    aria-label="Search tasks"
                  />
                </div>
                <div className="filters">
                  {(["all", "active", "completed"] as const).map((f) => (
                    <button
                      key={f}
                      className={filter === f ? "selected" : ""}
                      onClick={() => setFilter(f)}
                    >
                      {f[0].toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="task-list">
                {visibleTasks.map((t) => (
                  <div className="removable" key={t.id}>
                    <TaskRow task={t} onToggle={() => toggleTask(t.id)} />
                    <button
                      className="delete-button"
                      onClick={() =>
                        setTasks((prev) => prev.filter((x) => x.id !== t.id))
                      }
                      aria-label={`Delete ${t.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {visibleTasks.length === 0 && (
                  <p className="empty">
                    Nothing here yet. Add a task to get started! ✨
                  </p>
                )}
              </div>
              <div className="date-selector">
                <button
                  onClick={() => {
                    const d = new Date(selectedDate + "T12:00:00");
                    d.setDate(d.getDate() - 1);
                    setSelectedDate(dateKey(d));
                  }}
                >
                  <ArrowLeft size={15} /> Previous day
                </button>
                <button onClick={() => setSelectedDate(today)}>Today</button>
                <button
                  onClick={() => {
                    const d = new Date(selectedDate + "T12:00:00");
                    d.setDate(d.getDate() + 1);
                    setSelectedDate(dateKey(d));
                  }}
                >
                  Next day <ArrowRight size={15} />
                </button>
              </div>
            </section>
          )}
          {view === "habits" && (
            <section className="panel full-panel">
              <div className="panel-heading">
                <div>
                  <h2>Your daily rituals</h2>
                  <p>
                    {habitCount} of {habits.length} completed on{" "}
                    {formatDate(new Date(selectedDate + "T12:00:00"))}
                  </p>
                </div>
                <button
                  className="primary-button"
                  onClick={() => setModal("habit")}
                >
                  <Plus size={17} /> New habit
                </button>
              </div>
              <div className="habit-grid">
                {habits.map((h) => (
                  <div className="habit-card" key={h.id}>
                    <div className="habit-big-emoji">{h.emoji}</div>
                    <h3>{h.title}</h3>
                    <p>{h.completed.length} total check-ins</p>
                    <button
                      className={
                        h.completed.includes(selectedDate)
                          ? "habit-action checked"
                          : "habit-action"
                      }
                      onClick={() => toggleHabit(h.id)}
                    >
                      {h.completed.includes(selectedDate) ? (
                        <>
                          <Check size={16} /> Done today
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Mark as done
                        </>
                      )}
                    </button>
                    <button
                      className="habit-delete"
                      aria-label={`Delete ${h.title}`}
                      onClick={() =>
                        setHabits((prev) => prev.filter((x) => x.id !== h.id))
                      }
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="date-selector">
                <button onClick={() => setSelectedDate(today)}>
                  Back to today
                </button>
              </div>
            </section>
          )}
          <footer>
            Made with <Heart size={13} fill="currentColor" /> and a little bit
            of magic ✨
          </footer>
        </div>
      </main>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={modal === "task" ? "Add task" : "Add habit"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <h2>
                {modal === "task"
                  ? "Add a little task ✨"
                  : "Start a new ritual 🌸"}
              </h2>
              <button onClick={() => setModal(null)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <label>
              {modal === "task" ? "Task name" : "Habit name"}
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && save()}
                placeholder={
                  modal === "task"
                    ? "What would you like to do?"
                    : "What would you like to practice?"
                }
              />
            </label>
            {modal === "task" ? (
              <>
                <label>
                  Category
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option>Personal</option>
                    <option>Work</option>
                    <option>Wellness</option>
                    <option>Learning</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </>
            ) : (
              <label>
                Choose an emoji
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                >
                  {[
                    "🌸",
                    "💧",
                    "📖",
                    "🧘",
                    "☀️",
                    "🏃",
                    "🪴",
                    "🎨",
                    "💤",
                    "☕",
                  ].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="modal-actions">
              <button onClick={() => setModal(null)}>Cancel</button>
              <button
                className="primary-button"
                onClick={save}
                disabled={!title.trim()}
              >
                <Plus size={16} /> Add {modal === "task" ? "task" : "habit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <div className={`task-row ${task.done ? "done" : ""}`}>
      <button
        className={`task-check ${task.done ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={`${task.done ? "Uncomplete" : "Complete"} ${task.title}`}
      >
        {task.done ? <Check size={15} /> : null}
      </button>
      <div className="task-detail">
        <strong>{task.title}</strong>
        <span>
          <span className={`category-dot ${task.category.toLowerCase()}`} />
          {task.category}
        </span>
      </div>
      <span className={`priority ${task.priority}`}>{task.priority}</span>
    </div>
  );
}
function HabitRow({
  habit,
  checked,
  onToggle,
}: {
  habit: Habit;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="habit-row">
      <span className="habit-emoji">{habit.emoji}</span>
      <span>{habit.title}</span>
      <button
        className={`habit-check ${checked ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={`${checked ? "Uncheck" : "Check"} ${habit.title}`}
      >
        {checked ? <Check size={16} /> : <Circle size={21} />}
      </button>
    </div>
  );
}
function CalendarGrid({
  days,
  month,
  selected,
  onSelect,
  tasks,
}: {
  days: Date[];
  month: Date;
  selected: string;
  onSelect: (d: string) => void;
  tasks: Task[];
}) {
  return (
    <div className="calendar">
      <div className="calendar-head">
        {["M", "T", "W", "T", "F", "S", "S"].map((x, i) => (
          <span key={i}>{x}</span>
        ))}
      </div>
      <div className="calendar-days">
        {days.map((d) => {
          const key = dateKey(d);
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`${d.getMonth() !== month.getMonth() ? "muted" : ""} ${selected === key ? "selected" : ""} ${today === key ? "today" : ""}`}
              aria-label={formatDate(d)}
            >
              {d.getDate()}
              {tasks.some((t) => t.date === key) && <i />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
export default App;
