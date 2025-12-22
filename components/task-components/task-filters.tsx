"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Trash2 } from "lucide-react";
import { FilterType } from "@/lib/types";
import { useTasks } from "@/hook/use-task";
import posthog from "posthog-js";

export function TaskFilters() {
  const {
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    clearCompleted,
    stats,
  } = useTasks();

  const handleFilterChange = (value: string) => {
    // Track filter changes - feature usage metric
    posthog.capture("filter_changed", {
      from_filter: filter,
      to_filter: value,
    });
    setFilter(value as FilterType);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    // Track search usage when user starts typing (debounced tracking)
    if (newQuery && !searchQuery) {
      posthog.capture("task_searched", {
        has_results: stats.total > 0,
      });
    }
  };

  const handleClearCompleted = () => {
    // Track clearing completed tasks - engagement and cleanup behavior
    posthog.capture("completed_tasks_cleared", {
      tasks_cleared: stats.completed,
    });
    clearCompleted();
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs
          value={filter}
          onValueChange={handleFilterChange}
        >
          <TabsList>
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({stats.completed})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {stats.completed > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearCompleted}
            className="text-muted-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Completed
          </Button>
        )}
      </div>
    </div>
  );
}
