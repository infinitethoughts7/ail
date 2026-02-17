"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  useTrainerSummary,
  useTrainerProfile,
  useTrainerSubmissions,
} from "@/hooks/use-trainer-data";
import { SUBMISSION_STATUS_STYLES, getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import {
  School,
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  Users,
  Lightbulb,
  MapPin,
} from "lucide-react";
import Link from "next/link";

export default function TrainerDashboardPage() {
  const { data: summary, isLoading } = useTrainerSummary();
  const { data: profile } = useTrainerProfile();
  const { data: submissions } = useTrainerSubmissions();

  if (isLoading) {
    return (
      <div>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-semibold">Dashboard</h1>
        </header>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = summary
    ? [
        {
          label: "Assigned Schools",
          value: summary.assigned_schools,
          icon: School,
        },
        {
          label: "Submissions",
          value: summary.submissions_count,
          icon: ClipboardCheck,
          href: "/trainer/submissions",
        },
        {
          label: "Verified",
          value: summary.verified_count,
          icon: CheckCircle,
        },
        {
          label: "Flagged",
          value: summary.flagged_count,
          icon: AlertTriangle,
          highlight: summary.flagged_count > 0,
        },
        {
          label: "Students",
          value: summary.student_count,
          icon: Users,
          href: "/trainer/students",
        },
        {
          label: "Project Ideas",
          value: summary.project_count,
          icon: Lightbulb,
          href: "/trainer/projects",
        },
      ]
    : [];

  const recentSubmissions = submissions?.slice(0, 5) || [];

  return (
    <div>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Dashboard</h1>
      </header>

      <div className="p-4 sm:p-6">
        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {kpis.map((kpi) => {
            const card = (
              <Card
                key={kpi.label}
                className={
                  kpi.highlight
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
                      kpi.highlight ? "text-orange-600" : ""
                    }`}
                  >
                    {kpi.value}
                  </p>
                </CardContent>
              </Card>
            );

            return kpi.href ? (
              <Link key={kpi.label} href={kpi.href}>
                {card}
              </Link>
            ) : (
              <div key={kpi.label}>{card}</div>
            );
          })}
        </div>

        {/* Assigned School Info */}
        {profile?.assigned_school && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Assigned School
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base font-semibold">
                {profile.assigned_school.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile.assigned_school.district_name} ·{" "}
                {profile.assigned_school.total_students} students ·{" "}
                {profile.assigned_school.total_days} days
              </p>
              <Badge
                variant="outline"
                className={`mt-2 text-[10px] ${
                  profile.assigned_school.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : profile.assigned_school.status === "in_progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {profile.assigned_school.status.replace(/_/g, " ")}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Recent Submissions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Recent Submissions
              </CardTitle>
              {submissions && submissions.length > 5 && (
                <Link
                  href="/trainer/submissions"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  View all
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {recentSubmissions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No submissions yet.{" "}
                <Link
                  href="/trainer/form"
                  className="font-medium text-foreground underline"
                >
                  Submit your first session
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {recentSubmissions.map((sub) => {
                  const dayTheme = getDayTheme(sub.day_number);
                  const statusStyle = SUBMISSION_STATUS_STYLES[sub.status];

                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-medium">
                            {sub.school_name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${dayTheme.bgLight} ${dayTheme.textColor} ${dayTheme.borderColor}`}
                          >
                            {dayTheme.shortLabel}
                          </Badge>
                        </div>
                        {sub.submitted_at && (
                          <p className="text-[11px] text-muted-foreground">
                            {timeAgo(sub.submitted_at)}
                          </p>
                        )}
                      </div>
                      {statusStyle && (
                        <Badge
                          variant="outline"
                          className={`shrink-0 text-[10px] ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
