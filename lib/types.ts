export type Priority = "low" | "medium" | "high";
export type Category = "work" | "personal" | "shopping" | "health" | "other";
export type FilterType = "all" | "active" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskStats {
  total: number;
  active: number;
  completed: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<Category, number>;
  completionRate: number;
}
