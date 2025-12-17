"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react";
import { useTasks } from "@/hook/use-task";

export function TaskStats() {
  const { stats } = useTasks();

  const statCards = [
    {
      title: "Total Tasks",
      value: stats.total,
      icon: BarChart3,
      description: "All time",
    },
    {
      title: "Active",
      value: stats.active,
      icon: Circle,
      description: "In progress",
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      description: "Done",
    },
    {
      title: "Completion Rate",
      value: `${stats.completionRate.toFixed(0)}%`,
      icon: Target,
      description: "Overall progress",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category & Priority Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">High</span>
                <Badge variant="destructive">{stats.byPriority.high}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Medium</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats.byPriority.medium}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low</span>
                <Badge variant="secondary">{stats.byPriority.low}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm capitalize">{category}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
