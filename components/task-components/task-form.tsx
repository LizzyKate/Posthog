"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Priority, Category } from "@/lib/types";
import { useTasks } from "@/hook/use-task";

export function TaskForm() {
  const { addTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("work");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
      category,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategory("work");
    setDueDate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-800 border-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl text-slate-900 dark:text-white">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300">
            Add a new task to your list. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-slate-900 dark:text-white">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="description"
                className="text-slate-900 dark:text-white"
              >
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details (optional)..."
                className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor="priority"
                  className="text-slate-900 dark:text-white"
                >
                  Priority
                </Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value as Priority)}
                >
                  <SelectTrigger
                    id="priority"
                    className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-2">
                    <SelectItem
                      value="low"
                      className="text-slate-900 dark:text-white"
                    >
                      Low
                    </SelectItem>
                    <SelectItem
                      value="medium"
                      className="text-slate-900 dark:text-white"
                    >
                      Medium
                    </SelectItem>
                    <SelectItem
                      value="high"
                      className="text-slate-900 dark:text-white"
                    >
                      High
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor="category"
                  className="text-slate-900 dark:text-white"
                >
                  Category
                </Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as Category)}
                >
                  <SelectTrigger
                    id="category"
                    className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-2">
                    <SelectItem
                      value="work"
                      className="text-slate-900 dark:text-white"
                    >
                      Work
                    </SelectItem>
                    <SelectItem
                      value="personal"
                      className="text-slate-900 dark:text-white"
                    >
                      Personal
                    </SelectItem>
                    <SelectItem
                      value="shopping"
                      className="text-slate-900 dark:text-white"
                    >
                      Shopping
                    </SelectItem>
                    <SelectItem
                      value="health"
                      className="text-slate-900 dark:text-white"
                    >
                      Health
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="text-slate-900 dark:text-white"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="dueDate"
                className="text-slate-900 dark:text-white"
              >
                Due Date (Optional)
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-600"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
