"use client";

import { SetStateAction, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Trash2,
  Calendar,
  AlertCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { Task } from "@/lib/types";
import { useTasks } from "@/hook/use-task";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import posthog from "posthog-js";
import { usePostHog } from "posthog-js/react";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask } = useTasks();
  const posthogClient = usePostHog();
  const [isHovered, setIsHovered] = useState(false);

  // 🎯 FEATURE FLAG CHECK - Inline Task Editing
  const canEditTasks = posthogClient.isFeatureEnabled("inline-task-editing");
  console.log("Inline Task Editing Enabled:", canEditTasks);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(
    task.description || "",
  );

  const handleToggleTask = () => {
    const willBeCompleted = !task.completed;

    // Track task completion and uncompletion
    if (willBeCompleted) {
      posthog.capture("task_completed", {
        task_id: task.id,
        priority: task.priority,
        category: task.category,
        had_due_date: !!task.dueDate,
        was_overdue: isOverdue(task.dueDate),
      });
    } else {
      posthog.capture("task_uncompleted", {
        task_id: task.id,
        priority: task.priority,
        category: task.category,
      });
    }

    toggleTask(task.id);
  };

  const handleDeleteTask = () => {
    // Track task deletion - potential churn indicator if excessive
    posthog.capture("task_deleted", {
      task_id: task.id,
      priority: task.priority,
      category: task.category,
      was_completed: task.completed,
    });
    deleteTask(task.id);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");

    // Track when user starts editing (FEATURE FLAG EVENT)
    posthog.capture("task_edit_started", {
      task_id: task.id,
      priority: task.priority,
      category: task.category,
      feature_flag: "inline-task-editing",
      has_description: !!task.description,
    });
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim()) {
      const updates: Partial<Task> = {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
      };

      updateTask(task.id, updates);

      // Track successful edit (FEATURE FLAG EVENT)
      posthog.capture("task_edited", {
        task_id: task.id,
        old_title: task.title,
        new_title: editedTitle.trim(),
        title_changed: task.title !== editedTitle.trim(),
        description_changed: task.description !== editedDescription.trim(),
        feature_flag: "inline-task-editing",
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description || "");
    setIsEditing(false);

    // Track edit cancellation (FEATURE FLAG EVENT)
    posthog.capture("task_edit_cancelled", {
      task_id: task.id,
      feature_flag: "inline-task-editing",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      // Cmd/Ctrl + Enter to save
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const categoryColors = {
    work: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    personal:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    shopping:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    health: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  const overdue = isOverdue(task.dueDate);

  return (
    <Card
      className={cn(
        "p-4 transition-all duration-200",
        isHovered && "shadow-md",
        task.completed && "opacity-60",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleTask}
          className="mt-1"
          disabled={isEditing}
        />

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            // 📝 EDIT MODE - Only visible when editing
            <div className="space-y-3">
              <div>
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Task title..."
                  className="font-medium"
                  autoFocus
                />
              </div>
              <div>
                <Textarea
                  value={editedDescription}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setEditedDescription(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Task description (optional)..."
                  className="text-sm resize-none"
                  rows={2}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveEdit} className="h-8">
                  <Check className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-8"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <span className="text-xs text-muted-foreground ml-2">
                  Press Cmd+Enter to save, Esc to cancel
                </span>
              </div>
            </div>
          ) : (
            // 👀 VIEW MODE - Default display
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3
                    className={cn(
                      "font-medium text-base",
                      task.completed && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      data-ph-capture-attribute="task-item-menu"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* 🎯 EDIT OPTION - Only shows if feature flag is enabled */}
                    {canEditTasks && (
                      <DropdownMenuItem
                        onClick={handleStartEdit}
                        data-ph-capture-attribute="task-edit-menu-item"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={handleDeleteTask}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Badges and Metadata */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge
                  className={priorityColors[task.priority]}
                  variant="secondary"
                >
                  {task.priority}
                </Badge>
                <Badge
                  className={categoryColors[task.category]}
                  variant="secondary"
                >
                  {task.category}
                </Badge>

                {task.dueDate && (
                  <Badge
                    variant={overdue ? "destructive" : "outline"}
                    className="flex items-center gap-1"
                  >
                    {overdue && <AlertCircle className="h-3 w-3" />}
                    <Calendar className="h-3 w-3" />
                    {formatDate(task.dueDate)}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
