"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHSummary, useUWHDistrictProgress } from "@/hooks/use-uwh-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Target } from "lucide-react";

const COLORS = ["#10b981", "#3b82f6", "#e5e7eb"];

export default function ImpactPage() {
  const { data: summary, isLoading } = useUWHSummary();
  const { data: districts } = useUWHDistrictProgress();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const barData = districts?.map((d) => ({
    name: d.name.length > 15 ? d.name.slice(0, 15) + "..." : d.name,
    completed: d.completed,
    inProgress: d.in_progress,
    remaining: Math.max(0, d.total_schools - d.completed - d.in_progress),
  })) || [];

  const totalSchools = summary?.kpis.total_schools || 0;
  const completed = summary?.kpis.schools_completed || 0;
  const inProgress = summary?.kpis.schools_in_progress || 0;
  const remaining = Math.max(0, totalSchools - completed - inProgress);

  const pieData = [
    { name: "Completed", value: completed },
    { name: "In Progress", value: inProgress },
    { name: "Not Started", value: remaining },
  ].filter((d) => d.value > 0);

  const completionRate = totalSchools > 0 ? Math.round((completed / totalSchools) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Impact & Outcomes</h1>
        <p className="text-sm text-muted-foreground">
          Is this program actually working? Can we measure it?
        </p>
      </div>

      {/* Headline metrics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="px-4 py-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 text-center">
            <p className="text-3xl font-bold">{summary?.kpis.total_students_trained || 0}</p>
            <p className="text-xs text-muted-foreground">Students Reached</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 text-center">
            <p className="text-3xl font-bold">{summary?.kpis.total_sessions || 0}</p>
            <p className="text-xs text-muted-foreground">Sessions Delivered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-4 text-center">
            <p className="text-3xl font-bold">{summary?.kpis.total_districts || 0}</p>
            <p className="text-xs text-muted-foreground">Districts Covered</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overall Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Target className="h-4 w-4" /> Program Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* District Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <TrendingUp className="h-4 w-4" /> Impact by District
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" fill="#3b82f6" name="In Progress" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" fill="#e5e7eb" name="Remaining" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
