"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSummary, useSwinfyActivityLog } from "@/hooks/use-swinfy-data";
import { timeAgo } from "@/lib/utils";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import {
  School,
  CheckCircle,
  Users,
  Clock,
  Image as ImageIcon,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

export default function SwinfyDashboardPage() {
  const { data: summary, isLoading } = useAdminSummary();
  const { data: activities } = useSwinfyActivityLog();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = summary
    ? [
        {
          label: "Total Schools",
          value: summary.total_schools,
          icon: School,
        },
        {
          label: "Completed",
          value: summary.schools_completed,
          icon: CheckCircle,
        },
        {
          label: "Students Trained",
          value: summary.students_trained,
          icon: Users,
        },
        {
          label: "Pending Submissions",
          value: summary.pending_submissions,
          icon: Clock,
          highlight: true,
          href: "/swinfy/verification",
        },
        {
          label: "Pending Photos",
          value: summary.pending_photos,
          icon: ImageIcon,
          highlight: true,
          href: "/swinfy/photos",
        },
        {
          label: "Pending Projects",
          value: summary.pending_projects,
          icon: Lightbulb,
          highlight: true,
          href: "/swinfy/projects",
        },
      ]
    : [];

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-xl font-bold sm:text-2xl">Dashboard Overview</h1>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const content = (
            <Card
              key={kpi.label}
              className={
                kpi.highlight && kpi.value > 0
                  ? "border-orange-300 transition-colors hover:border-orange-400"
                  : ""
              }
            >
              <CardHeader className="flex flex-row items-center justify-between px-4 pb-1 pt-4">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p
                  className={`text-2xl font-bold ${
                    kpi.highlight && kpi.value > 0 ? "text-orange-600" : ""
                  }`}
                >
                  {kpi.value}
                </p>
              </CardContent>
            </Card>
          );

          return kpi.href ? (
            <Link key={kpi.label} href={kpi.href}>
              {content}
            </Link>
          ) : (
            <div key={kpi.label}>{content}</div>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {!activities || activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 15).map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-2 border-b pb-2 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    {a.description && (
                      <p className="truncate text-xs text-muted-foreground">
                        {a.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                      {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                        a.activity_type.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {timeAgo(a.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
