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
        <Skeleton className="h-10 w-64 rounded-xl" style={{ background: "var(--uwh-border-subtle)" }} />
        <Skeleton className="h-20 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
          ))}
        </div>
      </div>
    );
  }

  const bannerStyles: Record<string, { bg: string; border: string; text: string; dot: string }> = {
    green: { bg: "bg-[#C9A84C]/5", border: "border-[#C9A84C]/20", text: "text-[#C9A84C]", dot: "bg-[#C9A84C]" },
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
        <p className="mt-1 text-sm text-[#718096]">
          Real-time overview of the AI Literacy Program
        </p>
      </div>

      {/* Status Banner */}
      {summary?.status_banner && (() => {
        const style = bannerStyles[summary.status_banner.color] || bannerStyles.green;
        return (
          <div
            className={`mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4 ${style.bg} ${style.border}`}
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
            style={{ border: "1px solid var(--uwh-border-card)" }}
          >
            <div className="flex items-center justify-between">
              <p className="uwh-label">{kpi.label}</p>
              <kpi.icon className="h-4 w-4 text-[#718096]" />
            </div>
            <p className="uwh-mono uwh-number-glow mt-2 text-3xl font-bold text-[#0F1A2E]">
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick overview grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* District Progress */}
        <div
          className="uwh-card overflow-hidden"
          style={{ border: "1px solid var(--uwh-border-card)" }}
        >
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--uwh-border-card)" }}>
            <h2 className="uwh-heading text-base font-semibold">
              District Progress
            </h2>
            <Link
              href="/uwh/districts"
              className="uwh-gold-line flex items-center gap-1 text-xs font-medium text-[#C9A84C] transition-colors hover:text-[#B89840]"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-5">
            {districts && districts.length > 0 ? (
              <div className="space-y-4">
                {districts.slice(0, 5).map((d) => {
                  const pct =
                    d.total_schools > 0
                      ? Math.round((d.completed / d.total_schools) * 100)
                      : 0;
                  return (
                    <div key={d.id}>
                      <div className="mb-1.5 flex justify-between">
                        <span className="text-sm font-medium text-[#0F1A2E]">{d.name}</span>
                        <span className="uwh-mono text-xs text-[#718096]">
                          {d.completed}/{d.total_schools}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2 rounded-full [&>[data-slot=progress-indicator]]:bg-[#C9A84C]" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#718096]">No district data yet.</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="uwh-card overflow-hidden"
          style={{ border: "1px solid var(--uwh-border-card)" }}
        >
          <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "var(--uwh-border-card)" }}>
            <h2 className="uwh-heading text-base font-semibold">
              Recent Activity
            </h2>
            <Link
              href="/uwh/activity"
              className="uwh-gold-line flex items-center gap-1 text-xs font-medium text-[#C9A84C] transition-colors hover:text-[#B89840]"
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
                    className="flex gap-3 border-b pb-3 last:border-0 last:pb-0"
                    style={{ borderColor: "var(--uwh-border-subtle)" }}
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
                        <p className="text-sm font-medium leading-tight text-[#0F1A2E]">
                          {a.title}
                        </p>
                        <Badge className="shrink-0 rounded-md border border-[#EDE9E0] bg-[#FDFBF7] px-2 py-0.5 text-[10px] font-medium text-[#718096]">
                          {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                            a.activity_type.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="uwh-mono mt-1 text-[11px] text-[#718096]">
                        {timeAgo(a.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[#718096]">No activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
