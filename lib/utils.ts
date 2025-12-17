import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task, TaskStats } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateStats(tasks: Task[]): TaskStats {
  const total = tasks.length;
  const active = tasks.filter((t) => !t.completed).length;
  const completed = tasks.filter((t) => t.completed).length;

  const byPriority = {
    low: tasks.filter((t) => t.priority === "low").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    high: tasks.filter((t) => t.priority === "high").length,
  };

  const byCategory = {
    work: tasks.filter((t) => t.category === "work").length,
    personal: tasks.filter((t) => t.category === "personal").length,
    shopping: tasks.filter((t) => t.category === "shopping").length,
    health: tasks.filter((t) => t.category === "health").length,
    other: tasks.filter((t) => t.category === "other").length,
  };

  const completionRate = total > 0 ? (completed / total) * 100 : 0;

  return { total, active, completed, byPriority, byCategory, completionRate };
}

export function formatDate(date: Date | string | undefined): string {
  if (!date) return "No date";

  // Convert string to Date if needed
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(dateObj);
}

export function isOverdue(date?: Date | string): boolean {
  if (!date) return false;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(dateObj);
  compareDate.setHours(0, 0, 0, 0);

  return compareDate < today;
}
