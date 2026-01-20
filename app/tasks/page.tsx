"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskFilters } from "@/components/task-components/task-filters";
import { TaskForm } from "@/components/task-components/task-form";
import { TaskList } from "@/components/task-components/task-list";
import { TaskStats } from "@/components/task-components/task-stats";
import { LogoutButton } from "@/components/auth/logout-button";
import { Separator } from "@/components/ui/separator";
import { CheckSquare } from "lucide-react";
import { auth, type User } from "@/lib/auth";

export default function TasksPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    return auth.getUser();
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <CheckSquare className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight">TaskFlow</h1>
              </div>
              <p className="text-muted-foreground">
                Organize your work and life, finally.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Logged in as: <span className="font-medium">{user.email}</span>
              </p>
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Statistics Dashboard */}
        <div className="mb-8">
          <TaskStats />
        </div>

        <Separator className="my-8" />

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar: Filters & Actions */}
          <div className="lg:col-span-1 space-y-6">
            <TaskForm />
            <TaskFilters />
          </div>

          {/* Main: Task List */}
          <div className="lg:col-span-2">
            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
}
