"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Trash2 } from "lucide-react";
import { FilterType } from "@/lib/types";
import { useTasks } from "@/hook/use-task";

export function TaskFilters() {
  const {
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    clearCompleted,
    stats,
  } = useTasks();

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs
          value={filter}
          onValueChange={(value) => setFilter(value as FilterType)}
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
            onClick={clearCompleted}
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
