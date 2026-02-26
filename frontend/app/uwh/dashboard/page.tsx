"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useUWHSummary, useUWHDistrictProgress, useUWHActivityFeed } from "@/hooks/use-uwh-data";
import { UWHCurriculumTimeline } from "@/components/uwh/uwh-curriculum-timeline";
import { Progress } from "@/components/ui/progress";
import { timeAgo } from "@/lib/utils";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import {
  School,
  CheckCircle,
  Loader,
  Users,
  BookOpen,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function UWHDashboardPage() {
  const { data: summary, isLoading } = useUWHSummary();
  const { data: districts } = useUWHDistrictProgress();
  const { data: activities } = useUWHActivityFeed();

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg bg-[#F3F4F6]" />
        <Skeleton className="h-20 rounded-xl bg-[#F3F4F6]" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl bg-[#F3F4F6]" />
          ))}
        </div>
      </div>
    );
  }

  const bannerStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    green: { bg: "bg-[#059669]/5", border: "border-[#059669]/20", text: "text-[#059669]", dot: "bg-[#059669]" },
    yellow: { bg: "bg-[#D97706]/5", border: "border-[#D97706]/20", text: "text-[#D97706]", dot: "bg-[#D97706]" },
    red: { bg: "bg-[#DC2626]/5", border: "border-[#DC2626]/20", text: "text-[#DC2626]", dot: "bg-[#DC2626]" },
  };

  const kpiItems = summary?.kpis
    ? [
        { label: "Total Schools", value: summary.kpis.total_schools, icon: School },
        { label: "Completed", value: summary.kpis.schools_completed, icon: CheckCircle },
        { label: "In Progress", value: summary.kpis.schools_in_progress, icon: Loader },
        { label: "Students Trained", value: summary.kpis.total_students_trained, icon: Users },
        { label: "Sessions", value: summary.kpis.total_sessions, icon: BookOpen },
        { label: "Districts", value: summary.kpis.total_districts, icon: MapPin },
      ]
    : [];

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Program Dashboard
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Real-time overview of the AI Literacy Program
        </p>
      </div>

      {/* Status Banner */}
      {summary?.status_banner && (() => {
        const style = bannerStyles[summary.status_banner.color] || bannerStyles.green;
        return (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl border px-5 py-4 ${style.bg} ${style.border}`}
          >
            <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${style.dot}`} />
            <span className={`text-sm font-medium ${style.text}`}>
              {summary.status_banner.message}
            </span>
            <Badge
              className={`ml-auto border ${style.border} ${style.bg} ${style.text} text-[10px] font-semibold uppercase tracking-wider`}
            >
              {summary.status_banner.status}
            </Badge>
          </div>
        );
      })()}

      {/* Curriculum Timeline */}
      <div className="mb-6">
        <UWHCurriculumTimeline />
      </div>

      {/* KPI Strip */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {kpiItems.map((kpi) => (
          <div
            key={kpi.label}
            className="uwh-card group px-4 py-5 sm:px-5"
          >
            <div className="flex items-center justify-between">
              <p className="uwh-label">{kpi.label}</p>
              <kpi.icon className="h-4 w-4 text-[#D1D5DB]" />
            </div>
            <p className="uwh-mono uwh-number-glow mt-2 text-3xl font-bold text-[#1F2937]">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick overview grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* District Progress */}
        <div className="uwh-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="uwh-heading text-base font-semibold">
              District Progress
            </h2>
            <Link
              href="/uwh/districts"
              className="flex items-center gap-1 text-xs font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {districts && districts.length > 0 ? (
              <div className="space-y-0 divide-y divide-[#F3F4F6]">
                {districts.slice(0, 5).map((d) => {
                  const pct =
                    d.total_schools > 0
                      ? Math.round((d.completed / d.total_schools) * 100)
                      : 0;
                  const isComplete = d.completed === d.total_schools;
                  return (
                    <div key={d.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${isComplete ? "bg-[#F0FDF4] text-[#16A34A]" : "bg-[#F9FAFB] text-[#9CA3AF]"}`}>
                          {pct}%
                        </span>
                        <span className="text-sm font-medium text-[#1F2937]">{d.name}</span>
                      </div>
                      <span className="uwh-mono text-xs text-[#9CA3AF]">
                        {d.completed}/{d.total_schools}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No district data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="uwh-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4">
            <h2 className="uwh-heading text-base font-semibold">
              Recent Activity
            </h2>
            <Link
              href="/uwh/activity"
              className="flex items-center gap-1 text-xs font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {activities && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0"
                  >
                    {a.thumbnail_url && (
                      <img
                        src={a.thumbnail_url}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium leading-tight text-[#1F2937]">
                          {a.title}
                        </p>
                        <Badge className="shrink-0 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-medium text-[#6B7280]">
                          {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                            a.activity_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="uwh-mono mt-1 text-[11px] text-[#9CA3AF]">
                        {timeAgo(a.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
