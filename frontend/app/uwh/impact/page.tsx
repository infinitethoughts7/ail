"use client";

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

const COLORS = ["#C9A84C", "#5C4A2E", "#E8E4DA"];

export default function ImpactPage() {
  const { data: summary, isLoading } = useUWHSummary();
  const { data: districts } = useUWHDistrictProgress();

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <Skeleton className="h-64 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
        <Skeleton className="h-64 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
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
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Impact & Outcomes
        </h1>
        <p className="mt-1 text-sm text-[#718096]">
          Measuring the real effectiveness of the AI Literacy Program
        </p>
      </div>

      {/* Headline metrics */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-4xl font-bold text-[#C9A84C]">{completionRate}%</p>
          <p className="uwh-label mt-2">Completion Rate</p>
        </div>
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-4xl font-bold text-[#0F1A2E]">
            {summary?.kpis.total_students_trained || 0}
          </p>
          <p className="uwh-label mt-2">Students Reached</p>
        </div>
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-4xl font-bold text-[#0F1A2E]">
            {summary?.kpis.total_sessions || 0}
          </p>
          <p className="uwh-label mt-2">Sessions Delivered</p>
        </div>
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-4xl font-bold text-[#0F1A2E]">
            {summary?.kpis.total_districts || 0}
          </p>
          <p className="uwh-label mt-2">Districts Covered</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Program Completion Pie */}
        <div className="uwh-card overflow-hidden" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: "var(--uwh-border-card)" }}>
            <Target className="h-4 w-4 text-[#C9A84C]" />
            <h2 className="uwh-heading text-base font-semibold">Program Completion</h2>
          </div>
          <div className="p-5">
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
                      style={{ fontFamily: "var(--font-geist-sans)", fontSize: 12 }}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #EDE9E0",
                        boxShadow: "0 4px 14px rgba(15,26,46,0.06)",
                        fontFamily: "var(--font-geist-sans)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-[#718096]">No data yet.</p>
            )}
          </div>
        </div>

        {/* District Bar Chart */}
        <div className="uwh-card overflow-hidden" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: "var(--uwh-border-card)" }}>
            <TrendingUp className="h-4 w-4 text-[#C9A84C]" />
            <h2 className="uwh-heading text-base font-semibold">Impact by District</h2>
          </div>
          <div className="p-5">
            {barData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DA" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)", fill: "#718096" }}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontFamily: "var(--font-geist-sans)", fill: "#718096" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #EDE9E0",
                        boxShadow: "0 4px 14px rgba(15,26,46,0.06)",
                        fontFamily: "var(--font-geist-sans)",
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", fontFamily: "var(--font-geist-sans)" }}
                    />
                    <Bar dataKey="completed" fill="#C9A84C" name="Completed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="inProgress" fill="#5C4A2E" name="In Progress" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="remaining" fill="#E8E4DA" name="Remaining" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-12 text-center text-sm text-[#718096]">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
