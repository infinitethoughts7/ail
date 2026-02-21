"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  ChevronRight,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function TrainerDashboardPage() {
  const { data: summary, isLoading } = useTrainerSummary();
  const { data: profile } = useTrainerProfile();
  const { data: submissions } = useTrainerSubmissions();

  if (isLoading) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-base font-semibold">Dashboard</h1>
        </header>
        <div className="p-4">
          <Skeleton className="mb-4 h-20 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const kpis = summary
    ? [
        {
          label: "Schools",
          value: summary.assigned_schools,
          icon: School,
          color: "text-violet-600",
          bg: "bg-violet-50 dark:bg-violet-950/30",
          iconBg: "bg-violet-100 dark:bg-violet-900/50",
        },
        {
          label: "Submitted",
          value: summary.submissions_count,
          icon: ClipboardCheck,
          href: "/trainer/submissions",
          color: "text-blue-600",
          bg: "bg-blue-50 dark:bg-blue-950/30",
          iconBg: "bg-blue-100 dark:bg-blue-900/50",
        },
        {
          label: "Verified",
          value: summary.verified_count,
          icon: CheckCircle,
          color: "text-emerald-600",
          bg: "bg-emerald-50 dark:bg-emerald-950/30",
          iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
        },
        {
          label: "Flagged",
          value: summary.flagged_count,
          icon: AlertTriangle,
          highlight: summary.flagged_count > 0,
          color: "text-orange-600",
          bg: "bg-orange-50 dark:bg-orange-950/30",
          iconBg: "bg-orange-100 dark:bg-orange-900/50",
        },
        {
          label: "Students",
          value: summary.student_count,
          icon: Users,
          href: "/trainer/students",
          color: "text-cyan-600",
          bg: "bg-cyan-50 dark:bg-cyan-950/30",
          iconBg: "bg-cyan-100 dark:bg-cyan-900/50",
        },
        {
          label: "Ideas",
          value: summary.project_count,
          icon: Lightbulb,
          href: "/trainer/projects",
          color: "text-amber-600",
          bg: "bg-amber-50 dark:bg-amber-950/30",
          iconBg: "bg-amber-100 dark:bg-amber-900/50",
        },
      ]
    : [];

  const recentSubmissions = submissions?.slice(0, 5) || [];
  const greeting = getGreeting();

  return (
    <div>
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">Dashboard</h1>
      </header>

      <div className="p-4 sm:p-6">
        {/* Greeting & Quick Action */}
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {greeting}, {profile?.username?.split(" ")[0] || "Trainer"}
            </h2>
            {profile?.assigned_school && (
              <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {profile.assigned_school.name}
              </p>
            )}
          </div>
          <Link
            href="/trainer/form"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F4C4C] text-white shadow-lg shadow-[#0F4C4C]/25 transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        {/* School Progress Card */}
        {profile?.assigned_school && (
          <Link href="/trainer/school-info">
            <Card className="mb-5 overflow-hidden border-0 bg-gradient-to-br from-[#0F4C4C] to-[#1A6B6B] text-white shadow-lg shadow-[#0F4C4C]/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white/60 uppercase tracking-wider">
                      Your School
                    </p>
                    <p className="mt-1 truncate text-base font-bold">
                      {profile.assigned_school.name}
                    </p>
                    <p className="mt-0.5 text-sm text-white/70">
                      {profile.assigned_school.district_name}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-white/40" />
                </div>
                <div className="mt-3 flex gap-4">
                  <div>
                    <p className="text-xl font-bold">{profile.assigned_school.total_students}</p>
                    <p className="text-[11px] text-white/60">Students</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{profile.assigned_school.total_days}</p>
                    <p className="text-[11px] text-white/60">Days</p>
                  </div>
                  <div className="ml-auto flex items-end">
                    <Badge className="border-0 bg-white/15 text-xs text-white backdrop-blur-sm">
                      {profile.assigned_school.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* KPI Grid */}
        <div className="mb-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          {kpis.map((kpi) => {
            const content = (
              <Card
                key={kpi.label}
                className={`border-0 shadow-sm transition-all active:scale-[0.98] ${kpi.bg}`}
              >
                <CardContent className="p-3">
                  <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                  <p className={`text-xl font-bold ${kpi.highlight ? "text-orange-600" : ""}`}>
                    {kpi.value}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{kpi.label}</p>
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

        {/* Recent Submissions */}
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Recent Activity</h3>
          {submissions && submissions.length > 5 && (
            <Link
              href="/trainer/submissions"
              className="flex items-center gap-1 text-xs font-medium text-[#0F4C4C]"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {recentSubmissions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                <ClipboardCheck className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">No submissions yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tap the + button to submit your first session
              </p>
              <Link
                href="/trainer/form"
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0F4C4C]"
              >
                Submit now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentSubmissions.map((sub) => {
              const dayTheme = getDayTheme(sub.day_number);
              const statusStyle = SUBMISSION_STATUS_STYLES[sub.status];

              return (
                <Card
                  key={sub.id}
                  className="border-0 shadow-sm transition-all active:scale-[0.99]"
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    {/* Day indicator */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: dayTheme.hex }}
                    >
                      D{sub.day_number}
                    </div>
                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {sub.school_name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {sub.student_count} students · {sub.photo_count} photos
                        {sub.submitted_at && ` · ${timeAgo(sub.submitted_at)}`}
                      </p>
                    </div>
                    {/* Status */}
                    {statusStyle && (
                      <Badge
                        variant="outline"
                        className={`shrink-0 border-0 text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
