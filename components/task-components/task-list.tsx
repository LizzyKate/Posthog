"use client";

import { useSyncExternalStore } from "react";
import { TaskItem } from "./task-item";
import { CheckCircle2 } from "lucide-react";
import { useTasks } from "@/hook/use-task";

export function TaskList() {
  const { tasks } = useTasks();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Show nothing during SSR
  if (!mounted) {
    return (
      <div className="space-y-3">
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
        <p className="text-sm text-muted-foreground">
          Create your first task to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
