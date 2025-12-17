import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Task, Priority, Category, FilterType } from "./types";

interface TaskStore {
  tasks: Task[];
  filter: FilterType;
  searchQuery: string;

  // Actions
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  setFilter: (filter: FilterType) => void;
  setSearchQuery: (query: string) => void;
  clearCompleted: () => void;

  // Getters
  getFilteredTasks: () => Task[];
}

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Set up PostHog account",
    description: "Create account and get API key",
    completed: false,
    priority: "high",
    category: "work",
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "2",
    title: "Review PostHog documentation",
    completed: false,
    priority: "medium",
    category: "work",
    createdAt: new Date("2025-01-15"),
  },
  {
    id: "3",
    title: "Install PostHog SDK",
    completed: true,
    priority: "high",
    category: "work",
    createdAt: new Date("2025-01-14"),
    completedAt: new Date("2025-01-15"),
  },
  {
    id: "4",
    title: "Buy groceries",
    completed: false,
    priority: "low",
    category: "shopping",
    dueDate: new Date("2025-01-20"),
    createdAt: new Date("2025-01-16"),
  },
  {
    id: "5",
    title: "Morning workout",
    completed: true,
    priority: "medium",
    category: "health",
    createdAt: new Date("2025-01-16"),
    completedAt: new Date("2025-01-16"),
  },
];

// Custom storage with date serialization
const dateAwareStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;

    const data = JSON.parse(str);

    // Convert date strings back to Date objects
    if (data.state && data.state.tasks) {
      data.state.tasks = data.state.tasks.map(
        (
          task: Omit<Task, "createdAt" | "completedAt" | "dueDate"> & {
            createdAt: string | Date;
            completedAt?: string | Date;
            dueDate?: string | Date;
          }
        ) => ({
          ...task,
          createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
          completedAt: task.completedAt
            ? new Date(task.completedAt)
            : undefined,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        })
      );
    }

    return JSON.stringify(data);
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: initialTasks,
      filter: "all",
      searchQuery: "",

      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date() : undefined,
                }
              : task
          ),
        }));
      },

      setFilter: (filter) => set({ filter }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      clearCompleted: () => {
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed),
        }));
      },

      getFilteredTasks: () => {
        const { tasks, filter, searchQuery } = get();

        let filtered = tasks;

        // Apply status filter
        if (filter === "active") {
          filtered = filtered.filter((task) => !task.completed);
        } else if (filter === "completed") {
          filtered = filtered.filter((task) => task.completed);
        }

        // Apply search
        if (searchQuery) {
          filtered = filtered.filter(
            (task) =>
              task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              task.description
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
          );
        }

        // Sort: incomplete first, then by priority, then by date
        return filtered.sort((a, b) => {
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }

          const priorityOrder = { high: 0, medium: 1, low: 2 };
          if (a.priority !== b.priority) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }

          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      },
    }),
    {
      name: "taskflow-storage",
      storage: createJSONStorage(() => dateAwareStorage),
    }
  )
);
