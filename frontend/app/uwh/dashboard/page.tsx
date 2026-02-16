"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";

export default function UWHDashboardPage() {
  const { data: summary, isLoading } = useUWHSummary();
  const { data: districts } = useUWHDistrictProgress();
  const { data: activities } = useUWHActivityFeed();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const bannerColors: Record<string, string> = {
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
    red: "bg-red-500/10 border-red-500/30 text-red-700",
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
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Program Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          How is the program going right now?
        </p>
      </div>

      {/* Status Banner */}
      {summary?.status_banner && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            bannerColors[summary.status_banner.color] || bannerColors.green
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{summary.status_banner.message}</span>
            <Badge variant="outline" className="text-[10px]">
              {summary.status_banner.status}
            </Badge>
          </div>
        </div>
      )}

      {/* Current Day Banner */}
      <UWHCurriculumTimeline />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpiItems.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                  {kpi.label}
                </p>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="mt-1 text-2xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick overview grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* District Progress (compact) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">
              District Progress
            </CardTitle>
            <Link
              href="/uwh/districts"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {districts && districts.length > 0 ? (
              <div className="space-y-3">
                {districts.slice(0, 5).map((d) => {
                  const pct =
                    d.total_schools > 0
                      ? Math.round((d.completed / d.total_schools) * 100)
                      : 0;
                  return (
                    <div key={d.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium">{d.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {d.completed}/{d.total_schools}
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity (compact) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">
              Recent Activity
            </CardTitle>
            <Link
              href="/uwh/activity"
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {activities && activities.length > 0 ? (
              <div className="space-y-2.5">
                {activities.slice(0, 8).map((a) => (
                  <div
                    key={a.id}
                    className="border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {a.title}
                      </p>
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                          a.activity_type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {timeAgo(a.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
