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
import {
  SUBMISSION_STATUS_STYLES,
  getDayTheme,
  CURRICULUM_DAYS,
} from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import {
  ClipboardEdit,
  CheckCircle,
  AlertTriangle,
  Users,
  Lightbulb,
  MapPin,
  ChevronRight,
  ArrowRight,
  ImageIcon,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// ── Animation variants ──────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.05 } },
};

// ── Progress Ring Component ─────────────────────────────────────

function ProgressRing({
  progress,
  size = 72,
  strokeWidth = 5,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#2DD4A8"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      />
    </svg>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────

export default function TrainerDashboardPage() {
  const { data: summary, isLoading } = useTrainerSummary();
  const { data: profile } = useTrainerProfile();
  const { data: submissions } = useTrainerSubmissions();

  if (isLoading) return <DashboardSkeleton />;

  const recentSubmissions = submissions?.slice(0, 5) || [];
  const greeting = getGreeting();
  const firstName = profile?.username?.split(" ")[0] || "Trainer";

  // Calculate progress
  const totalDays = profile?.assigned_school?.total_days || 4;
  const completedDays = summary?.submissions_count || 0;
  const progressPercent = Math.min(
    Math.round((completedDays / totalDays) * 100),
    100
  );

  // Which days have submissions
  const submittedDays = new Set(
    submissions?.map((s) => s.day_number) || []
  );

  return (
    <div className="min-h-dvh bg-gray-50/50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-xl">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">Dashboard</h1>
      </header>

      <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 sm:py-6">
        {/* ── Hero Card ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4C4C] via-[#155E5E] to-[#1A6B6B] p-5 text-white shadow-xl shadow-[#0F4C4C]/20">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/[0.04]" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/[0.03]" />

            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#2DD4A8]" />
                  <span className="text-xs font-medium text-[#2DD4A8]">
                    {greeting}
                  </span>
                </div>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight">
                  {firstName}
                </h2>
                {profile?.assigned_school && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {profile.assigned_school.name}
                    </span>
                  </p>
                )}

                {/* Mini stats row */}
                <div className="mt-4 flex gap-5">
                  <div>
                    <p className="text-2xl font-bold">{summary?.submissions_count ?? 0}</p>
                    <p className="text-[11px] text-white/50">Sessions</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary?.verified_count ?? 0}</p>
                    <p className="text-[11px] text-white/50">Verified</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{summary?.student_count ?? 0}</p>
                    <p className="text-[11px] text-white/50">Students</p>
                  </div>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative flex flex-col items-center">
                <ProgressRing progress={progressPercent} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">{progressPercent}%</span>
                  <span className="text-[9px] text-white/50">complete</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Curriculum Day Tracker ───────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mt-5"
        >
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Curriculum Progress
            </h3>
            <span className="text-xs text-muted-foreground">
              {completedDays}/{totalDays} days
            </span>
          </div>
          <div className="flex gap-2">
            {CURRICULUM_DAYS.map((day) => {
              const done = submittedDays.has(day.day);
              return (
                <div
                  key={day.day}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-2xl p-3 transition-all ${
                    done
                      ? "bg-white shadow-sm ring-1 ring-gray-100"
                      : "bg-gray-100/60"
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold text-white ${
                      done ? "" : "opacity-30"
                    }`}
                    style={{ backgroundColor: day.hex }}
                  >
                    {done ? (
                      <CheckCircle className="h-4.5 w-4.5" />
                    ) : (
                      `D${day.day}`
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      done ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    Day {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Quick Actions ────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mt-5"
        >
          <h3 className="mb-2.5 text-sm font-semibold text-gray-900">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {
                label: "Submit Session",
                desc: "Report today's class",
                icon: ClipboardEdit,
                href: "/trainer/form",
                color: "#4338CA",
                bg: "bg-indigo-50",
              },
              {
                label: "My Students",
                desc: `${summary?.student_count ?? 0} enrolled`,
                icon: Users,
                href: "/trainer/students",
                color: "#0891B2",
                bg: "bg-cyan-50",
              },
              {
                label: "Photo Gallery",
                desc: "View uploads",
                icon: ImageIcon,
                href: "/trainer/gallery",
                color: "#7C3AED",
                bg: "bg-violet-50",
              },
              {
                label: "Student Ideas",
                desc: `${summary?.project_count ?? 0} projects`,
                icon: Lightbulb,
                href: "/trainer/projects",
                color: "#D97706",
                bg: "bg-amber-50",
              },
            ].map((action, i) => (
              <motion.div key={action.label} variants={fadeUp} custom={i}>
                <Link href={action.href}>
                  <Card className="border-0 shadow-sm transition-all active:scale-[0.97] hover:shadow-md">
                    <CardContent className="p-3.5">
                      <div
                        className={`mb-2.5 flex h-10 w-10 items-center justify-center rounded-2xl ${action.bg}`}
                      >
                        <action.icon
                          className="h-5 w-5"
                          style={{ color: action.color }}
                        />
                      </div>
                      <p className="text-[13px] font-semibold text-gray-900">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {action.desc}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── Stats Bar ────────────────────────────────────── */}
        {summary && (summary.flagged_count > 0 || summary.verified_count > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-5"
          >
            <div className="flex gap-2.5">
              {summary.verified_count > 0 && (
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-emerald-50 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-emerald-700">
                      {summary.verified_count}
                    </p>
                    <p className="text-[11px] text-emerald-600/70">Verified</p>
                  </div>
                </div>
              )}
              {summary.flagged_count > 0 && (
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-orange-50 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-orange-700">
                      {summary.flagged_count}
                    </p>
                    <p className="text-[11px] text-orange-600/70">Needs attention</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── School Card ──────────────────────────────────── */}
        {profile?.assigned_school && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-5"
          >
            <Link href="/trainer/school-info">
              <Card className="overflow-hidden border-0 shadow-sm transition-all active:scale-[0.99] hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3.5 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0F4C4C]">
                      <MapPin className="h-5 w-5 text-[#2DD4A8]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {profile.assigned_school.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {profile.assigned_school.district_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-0 bg-[#0F4C4C]/8 text-[10px] font-semibold text-[#0F4C4C]"
                      >
                        {profile.assigned_school.status.replace(/_/g, " ")}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                  </div>
                  {/* Stats strip */}
                  <div className="flex border-t border-gray-50 bg-gray-50/50">
                    <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {profile.assigned_school.total_students} students
                      </span>
                    </div>
                    <div className="w-px bg-gray-100" />
                    <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        {profile.assigned_school.total_days} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        )}

        {/* ── Recent Activity ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-6"
        >
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Recent Activity
            </h3>
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
            <Card className="border border-dashed border-gray-200 bg-white shadow-none">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-gray-100">
                  <ClipboardEdit className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  No sessions submitted yet
                </p>
                <p className="mx-auto mt-1.5 max-w-[220px] text-xs text-muted-foreground">
                  Submit your first session report to see your activity here
                </p>
                <Link
                  href="/trainer/form"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#0F4C4C] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#0F4C4C]/20 transition-all active:scale-[0.97]"
                >
                  Submit Session
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentSubmissions.map((sub, index) => {
                const dayTheme = getDayTheme(sub.day_number);
                const statusStyle = SUBMISSION_STATUS_STYLES[sub.status];

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 + index * 0.05, duration: 0.3 }}
                  >
                    <Card className="border-0 shadow-sm transition-all active:scale-[0.99]">
                      <CardContent className="flex items-center gap-3 p-3.5">
                        {/* Day pill */}
                        <div
                          className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-2xl text-white"
                          style={{ backgroundColor: dayTheme.hex }}
                        >
                          <span className="text-[10px] font-medium leading-none opacity-70">
                            Day
                          </span>
                          <span className="text-base font-bold leading-tight">
                            {sub.day_number}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-gray-900">
                            {sub.school_name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Users className="h-3 w-3" />
                              {sub.student_count}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <ImageIcon className="h-3 w-3" />
                              {sub.photo_count}
                            </span>
                            {sub.submitted_at && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-3 w-3" />
                                {timeAgo(sub.submitted_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status badge */}
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// ── Loading Skeleton ────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-gray-50/50">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-xl">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">Dashboard</h1>
      </header>
      <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
        <Skeleton className="h-[180px] rounded-3xl" />
        <div className="mt-5 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[80px] flex-1 rounded-2xl" />
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[100px] rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-5 h-[70px] rounded-2xl" />
        <div className="mt-5 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
