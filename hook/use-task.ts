import { useTaskStore } from "@/lib/store";
import { calculateStats } from "@/lib/utils";

export function useTasks() {
  const store = useTaskStore();
  const filteredTasks = store.getFilteredTasks();
  const stats = calculateStats(store.tasks);

  return {
    tasks: filteredTasks,
    allTasks: store.tasks,
    stats,
    filter: store.filter,
    searchQuery: store.searchQuery,
    addTask: store.addTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    toggleTask: store.toggleTask,
    setFilter: store.setFilter,
    setSearchQuery: store.setSearchQuery,
    clearCompleted: store.clearCompleted,
  };
}
