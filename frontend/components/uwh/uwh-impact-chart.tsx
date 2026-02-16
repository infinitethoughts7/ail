"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUWHDistrictProgress } from "@/hooks/use-uwh-data";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

export function UWHImpactChart() {
  const { data: districts, isLoading } = useUWHDistrictProgress();

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (!districts || districts.length === 0) {
    return null;
  }

  const chartData = districts.map((d) => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + "..." : d.name,
    completed: d.completed,
    inProgress: d.in_progress,
    remaining: Math.max(0, d.total_schools - d.completed - d.in_progress),
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold sm:text-base">
            Impact by District
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                className="text-xs"
                tick={{ fontSize: 11 }}
              />
              <YAxis className="text-xs" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="completed"
                fill="#10b981"
                name="Completed"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="inProgress"
                fill="#3b82f6"
                name="In Progress"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="remaining"
                fill="#e5e7eb"
                name="Remaining"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
