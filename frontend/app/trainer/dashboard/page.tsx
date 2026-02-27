"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useTrainerSummary,
  useTrainerProfile,
  useUpdateTrainerProfile,
  useTrainerSubmissions,
} from "@/hooks/use-trainer-data";
import {
  SUBMISSION_STATUS_STYLES,
  getDayTheme,
  CURRICULUM_DAYS,
} from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
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
  Camera,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  motion,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
} from "framer-motion";

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

// ── Floating Sparkle Particle ───────────────────────────────────

const PARTICLES = [
  { x: "8%",  y: "18%", size: 3, dur: 3.5, delay: 0 },
  { x: "88%", y: "12%", size: 2, dur: 4,   delay: 0.6 },
  { x: "72%", y: "78%", size: 3, dur: 3,   delay: 1.2 },
  { x: "20%", y: "82%", size: 2, dur: 3.8, delay: 0.3 },
  { x: "50%", y: "35%", size: 2, dur: 4.2, delay: 0.9 },
  { x: "35%", y: "55%", size: 3, dur: 3.2, delay: 1.5 },
];

// ── Animated Counter ────────────────────────────────────────────

function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on("change", (v) => setDisplay(v));
    const controls = fmAnimate(motionVal, value, {
      duration: 1.4,
      ease: "easeOut",
      delay: 0.4,
    });
    return () => { unsub(); controls.stop(); };
  }, [value, motionVal, rounded]);

  return <span className={className}>{display}</span>;
}

// ── Progress Ring ───────────────────────────────────────────────

function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 4,
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
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
      />
    </svg>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────

export default function TrainerDashboardPage() {
  const { data: summary, isLoading } = useTrainerSummary();
  const { data: profile } = useTrainerProfile();
  const { data: submissions } = useTrainerSubmissions();
  const updateProfile = useUpdateTrainerProfile();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [viewingPhoto, setViewingPhoto] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("profile_photo", file);
    updateProfile.mutate(formData, {
      onSuccess: () => toast.success("Profile photo updated!"),
      onError: () => toast.error("Failed to update photo"),
    });
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  if (isLoading) return <DashboardSkeleton />;

  const recentSubmissions = submissions?.slice(0, 5) || [];
  const greeting = getGreeting();
  const firstName = profile?.username?.split(" ")[0] || "Trainer";
  const initials = (profile?.username || "T").charAt(0).toUpperCase();

  // Schools assigned to this trainer
  const assignedSchools = profile?.assigned_schools || [];
  const schoolsToShow = assignedSchools.length > 0
    ? assignedSchools
    : profile?.assigned_school
      ? [{
          id: profile.assigned_school.id,
          name: profile.assigned_school.name,
          district_name: profile.assigned_school.district_name,
          status: profile.assigned_school.status,
          total_students: profile.assigned_school.total_students,
          total_days: profile.assigned_school.total_days,
        }]
      : [];

  // Aggregate stats across all schools
  const totalStudents = schoolsToShow.reduce((sum, s) => sum + s.total_students, 0);
  const totalDays = schoolsToShow.reduce((sum, s) => sum + s.total_days, 0) || 4;
  const completedDays = summary?.submissions_count || 0;
  const progressPercent = Math.min(
    Math.round((completedDays / totalDays) * 100),
    100
  );

  // Which days have submissions (across all schools)
  const submittedDays = new Set(
    submissions?.map((s) => s.day_number) || []
  );

  // Per-school submission breakdown
  const schoolSubmissions = new Map<string, { days: Set<number>; count: number; verified: number }>();
  for (const sub of submissions || []) {
    const entry = schoolSubmissions.get(sub.school) || { days: new Set(), count: 0, verified: 0 };
    entry.days.add(sub.day_number);
    entry.count++;
    if (sub.status === "verified") entry.verified++;
    schoolSubmissions.set(sub.school, entry);
  }

  return (
    <div>
      <TrainerHeader title="Dashboard" />

      <div className="mx-auto max-w-lg px-4 py-5 sm:px-6 sm:py-6">
        {/* ── Hero Card — iOS Frosted Glass ────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#4F46E5] p-5 text-white shadow-2xl shadow-violet-600/25">
            {/* Frosted glass orbs — slow-drifting blurred shapes */}
            <motion.div
              className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/[0.08]"
              animate={{ x: [0, 15, 0], y: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(30px)" }}
            />
            <motion.div
              className="pointer-events-none absolute -bottom-16 -right-10 h-52 w-52 rounded-full bg-pink-400/[0.1]"
              animate={{ x: [0, -12, 0], y: [0, -8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ filter: "blur(40px)" }}
            />
            <motion.div
              className="pointer-events-none absolute right-16 top-6 h-24 w-24 rounded-full bg-sky-300/[0.08]"
              animate={{ x: [0, -8, 0], y: [0, 12, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              style={{ filter: "blur(25px)" }}
            />

            {/* Floating sparkle particles */}
            {PARTICLES.map((p, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute rounded-full bg-white"
                style={{
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                }}
                animate={{
                  y: [-8, 8, -8],
                  opacity: [0.1, 0.35, 0.1],
                  scale: [1, 1.4, 1],
                }}
                transition={{
                  duration: p.dur,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: p.delay,
                }}
              />
            ))}

            {/* Profile photo + greeting row */}
            <div className="relative mb-5 flex items-center gap-3.5">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (profile?.profile_photo_url) setViewingPhoto(true);
                    else photoInputRef.current?.click();
                  }}
                  className="block"
                >
                  {profile?.profile_photo_url ? (
                    <img
                      src={profile.profile_photo_url}
                      alt={profile.username}
                      className="h-14 w-14 rounded-full object-cover shadow-lg shadow-black/20 ring-[2.5px] ring-white/30"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-xl font-bold text-white shadow-lg shadow-black/10 ring-[2.5px] ring-white/20 backdrop-blur-sm">
                      {initials}
                    </div>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={updateProfile.isPending}
                  className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-md transition-transform active:scale-90"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin text-violet-600" />
                  ) : (
                    <Camera className="h-3 w-3 text-violet-600" />
                  )}
                </button>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-200" />
                  <span className="text-xs font-medium text-violet-200">
                    {greeting}
                  </span>
                </div>
                <h2 className="mt-0.5 text-2xl font-bold tracking-tight">
                  {firstName}
                </h2>
                {schoolsToShow.length > 0 && (
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-white/50">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {schoolsToShow.length === 1
                        ? schoolsToShow[0].name
                        : `${schoolsToShow.length} schools assigned`}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Stats row + progress ring */}
            <div className="relative flex items-end justify-between">
              <div className="flex gap-2">
                <div className="rounded-2xl bg-white/[0.12] px-4 py-2.5 text-center backdrop-blur-sm">
                  <CountUp
                    value={summary?.submissions_count ?? 0}
                    className="text-xl font-bold text-white"
                  />
                  <p className="text-[10px] font-medium text-white/50">Sessions</p>
                </div>
                <div className="rounded-2xl bg-white/[0.12] px-4 py-2.5 text-center backdrop-blur-sm">
                  <CountUp
                    value={summary?.verified_count ?? 0}
                    className="text-xl font-bold text-white"
                  />
                  <p className="text-[10px] font-medium text-white/50">Verified</p>
                </div>
                <div className="rounded-2xl bg-white/[0.12] px-4 py-2.5 text-center backdrop-blur-sm">
                  <CountUp
                    value={summary?.student_count ?? 0}
                    className="text-xl font-bold text-white"
                  />
                  <p className="text-[10px] font-medium text-white/50">Students</p>
                </div>
              </div>

              {/* Progress Ring */}
              <div className="relative flex flex-col items-center">
                <ProgressRing progress={progressPercent} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-white">
                    {progressPercent}%
                  </span>
                  <span className="text-[8px] font-medium text-white/40">
                    complete
                  </span>
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
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1F2937]">
              Curriculum Progress
            </h3>
            <span className="text-xs font-medium text-[#9CA3AF]">
              {completedDays}/{totalDays} days
            </span>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04]">
            <div className="flex items-center">
              {CURRICULUM_DAYS.map((day, i) => {
                const done = submittedDays.has(day.day);
                const isLast = i === CURRICULUM_DAYS.length - 1;

                return (
                  <div key={day.day} className={`flex items-center ${isLast ? "" : "flex-1"}`}>
                    {/* Node */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="relative">
                        {done ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 300 }}
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                            style={{ boxShadow: "0 4px 14px -2px rgba(139, 92, 246, 0.35)" }}
                          >
                            <CheckCircle className="h-5 w-5" />
                          </motion.div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-violet-200 text-xs font-bold text-violet-300">
                            {day.day}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-semibold ${
                          done ? "text-violet-600" : "text-[#C0C5CE]"
                        }`}
                      >
                        Day {day.day}
                      </span>
                    </div>

                    {/* Connector line */}
                    {!isLast && (
                      <div className="relative mx-1 mt-[-18px] h-[3px] flex-1 overflow-hidden rounded-full bg-violet-100">
                        <motion.div
                          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          initial={{ width: "0%" }}
                          animate={{ width: done ? "100%" : "0%" }}
                          transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: "easeOut" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Quick Actions ────────────────────────────────── */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mt-5"
        >
          <h3 className="mb-2.5 text-sm font-semibold text-[#1F2937]">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Submit Session",
                desc: "Report today's class",
                icon: ClipboardEdit,
                href: "/trainer/form",
                iconColor: "#4338CA",
                iconBg: "bg-white/70",
                cardBg: "linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)",
                shadow: "0 8px 24px -4px rgba(67, 56, 202, 0.18)",
                textColor: "#312E81",
                descColor: "#4338CA",
              },
              {
                label: "My Students",
                desc: `${summary?.student_count ?? 0} enrolled`,
                icon: Users,
                href: "/trainer/students",
                iconColor: "#0E7490",
                iconBg: "bg-white/70",
                cardBg: "linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%)",
                shadow: "0 8px 24px -4px rgba(14, 116, 144, 0.18)",
                textColor: "#164E63",
                descColor: "#0E7490",
              },
              {
                label: "Photo Gallery",
                desc: "View uploads",
                icon: ImageIcon,
                href: "/trainer/gallery",
                iconColor: "#9333EA",
                iconBg: "bg-white/70",
                cardBg: "linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%)",
                shadow: "0 8px 24px -4px rgba(147, 51, 234, 0.18)",
                textColor: "#581C87",
                descColor: "#7C3AED",
              },
              {
                label: "Student Ideas",
                desc: `${summary?.project_count ?? 0} projects`,
                icon: Lightbulb,
                href: "/trainer/projects",
                iconColor: "#B45309",
                iconBg: "bg-white/70",
                cardBg: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
                shadow: "0 8px 24px -4px rgba(180, 83, 9, 0.18)",
                textColor: "#78350F",
                descColor: "#B45309",
              },
            ].map((action, i) => (
              <motion.div key={action.label} variants={fadeUp} custom={i}>
                <Link href={action.href}>
                  <div
                    className="rounded-2xl p-4 transition-all duration-200 active:scale-[0.96] hover:translate-y-[-2px]"
                    style={{
                      background: action.cardBg,
                      boxShadow: action.shadow,
                    }}
                  >
                    <div
                      className={`mb-7 flex h-11 w-11 items-center justify-center rounded-xl ${action.iconBg} shadow-sm backdrop-blur-sm`}
                    >
                      <action.icon
                        className="h-5 w-5"
                        style={{ color: action.iconColor }}
                      />
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: action.textColor }}
                    >
                      {action.label}
                    </p>
                    <p
                      className="mt-0.5 text-xs font-medium"
                      style={{ color: action.descColor, opacity: 0.7 }}
                    >
                      {action.desc}
                    </p>
                  </div>
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
            <div className="flex gap-3">
              {summary.verified_count > 0 && (
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[#ECFDF5] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#059669]/10">
                    <TrendingUp className="h-4 w-4 text-[#059669]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#059669]">
                      {summary.verified_count}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">Verified</p>
                  </div>
                </div>
              )}
              {summary.flagged_count > 0 && (
                <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[#FEF3C7] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D97706]/10">
                    <AlertTriangle className="h-4 w-4 text-[#D97706]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#D97706]">
                      {summary.flagged_count}
                    </p>
                    <p className="text-[11px] text-[#6B7280]">Needs attention</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── School Details ─────────────────────────────────── */}
        {schoolsToShow.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="mt-5 space-y-3"
          >
            <h3 className="text-sm font-semibold text-[#1F2937]">
              {schoolsToShow.length > 1 ? "Your Schools" : "Your School"}
            </h3>
            {schoolsToShow.map((school, idx) => {
              const stats = schoolSubmissions.get(school.id);
              const schoolDaysCompleted = stats?.days.size || 0;
              const schoolVerified = stats?.verified || 0;
              const schoolProgress = Math.min(
                Math.round((schoolDaysCompleted / (school.total_days || 4)) * 100),
                100
              );

              return (
                <Card key={school.id} className="overflow-hidden border-0 bg-white shadow-sm ring-1 ring-black/[0.04]">
                  <CardContent className="p-0">
                    {/* School header */}
                    <Link href={`/trainer/school-info?school=${school.id}`}>
                      <div className="flex items-center gap-3 p-4 pb-3 transition-colors active:bg-gray-50">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500">
                          <MapPin className="h-4.5 w-4.5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-[#1F2937]">
                            {school.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#9CA3AF]">
                            {school.district_name}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-[#D1D5DB]" />
                      </div>
                    </Link>

                    {/* Progress bar */}
                    <div className="px-4 pb-3">
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[11px] font-medium text-[#6B7280]">
                          {schoolDaysCompleted}/{school.total_days} days completed
                        </span>
                        <span className="text-[11px] font-bold text-violet-600">
                          {schoolProgress}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-violet-100">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${schoolProgress}%` }}
                          transition={{ delay: 0.3 + idx * 0.15, duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                    </div>

                    {/* Day dots */}
                    <div className="flex items-center gap-1.5 px-4 pb-3">
                      {CURRICULUM_DAYS.slice(0, school.total_days).map((day) => {
                        const done = stats?.days.has(day.day);
                        return (
                          <div
                            key={day.day}
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ${
                              done
                                ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                                : "border border-dashed border-violet-200 text-violet-300"
                            }`}
                          >
                            {done ? <CheckCircle className="h-3.5 w-3.5" /> : day.day}
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats strip */}
                    <div className="flex border-t border-[#F3F4F6]">
                      <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                        <Users className="h-3 w-3 text-[#9CA3AF]" />
                        <span className="text-xs font-medium text-[#6B7280]">
                          {school.total_students} students
                        </span>
                      </div>
                      <div className="w-px bg-[#F3F4F6]" />
                      <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                        <CheckCircle className="h-3 w-3 text-[#9CA3AF]" />
                        <span className="text-xs font-medium text-[#6B7280]">
                          {schoolVerified} verified
                        </span>
                      </div>
                      <div className="w-px bg-[#F3F4F6]" />
                      <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                        <Badge
                          variant="outline"
                          className={`border-0 text-[10px] font-semibold ${
                            school.status === "completed"
                              ? "bg-emerald-50 text-emerald-600"
                              : school.status === "in_progress"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-gray-50 text-gray-500"
                          }`}
                        >
                          {school.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
            <h3 className="text-sm font-semibold text-[#1F2937]">
              Recent Activity
            </h3>
            {submissions && submissions.length > 5 && (
              <Link
                href="/trainer/submissions"
                className="flex items-center gap-1 text-xs font-medium text-violet-600"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>

          {recentSubmissions.length === 0 ? (
            <Card className="border-0 bg-white shadow-sm ring-1 ring-black/[0.04]">
              <CardContent className="py-12 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-3xl bg-violet-50">
                  <ClipboardEdit className="h-6 w-6 text-violet-400" />
                </div>
                <p className="text-sm font-semibold text-[#1F2937]">
                  No sessions submitted yet
                </p>
                <p className="mx-auto mt-1.5 max-w-[220px] text-xs text-[#9CA3AF]">
                  Submit your first session report to see your activity here
                </p>
                <Link
                  href="/trainer/form"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-all active:scale-[0.97]"
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
                    <Card className="border-0 bg-white shadow-sm ring-1 ring-black/[0.04] transition-all active:scale-[0.99]">
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
                          <p className="truncate text-[13px] font-semibold text-[#1F2937]">
                            {sub.school_name}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-[#9CA3AF]">
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

      {/* Profile Photo Viewer */}
      <Dialog open={viewingPhoto} onOpenChange={setViewingPhoto}>
        <DialogContent className="flex max-w-sm items-center justify-center border-0 bg-black/95 p-0 sm:rounded-2xl [&>button]:hidden">
          <DialogTitle className="sr-only">Profile Photo</DialogTitle>
          <button
            onClick={() => setViewingPhoto(false)}
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
          {profile?.profile_photo_url && (
            <img
              src={profile.profile_photo_url}
              alt={profile.username}
              className="max-h-[70dvh] w-full object-contain sm:rounded-2xl"
            />
          )}
          <button
            onClick={() => {
              setViewingPhoto(false);
              setTimeout(() => photoInputRef.current?.click(), 200);
            }}
            className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors active:bg-white/25"
          >
            <Camera className="h-4 w-4" />
            Change Photo
          </button>
        </DialogContent>
      </Dialog>
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
    <div>
      <TrainerHeader title="Dashboard" />
      <div className="mx-auto max-w-lg px-4 py-5 sm:px-6">
        <Skeleton className="h-[200px] rounded-3xl" />
        <div className="mt-5 space-y-3">
          <Skeleton className="h-[60px] rounded-2xl" />
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
