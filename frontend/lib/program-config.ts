// Program configuration constants for AI Literacy — TMREIS 2026

export const PROGRAM_CONFIG = {
  name: "AI Literacy Program",
  year: 2026,
  organization: "TMREIS",
  organizationFull:
    "Telangana Minorities Residential Educational Institutions Society",
  sponsor: "UWH",
  sponsorFull: "United Way Hyderabad",
  implementingPartner: "Swinfy",
  totalSchools: 40,
  targetStudentsPerSchool: 57,
  totalTargetStudents: 2280,
  totalDays: 4,
} as const;

export const PROGRAM_SCHEDULE = [
  {
    day: 1,
    date: "2026-02-21",
    title: "Introduction to AI & Machine Learning Basics",
    color: "var(--day-1)",
  },
  {
    day: 2,
    date: "2026-02-22",
    title: "Data Literacy & AI Tools",
    color: "var(--day-2)",
  },
  {
    day: 3,
    date: "2026-02-23",
    title: "AI for Problem Solving",
    color: "var(--day-3)",
  },
  {
    day: 4,
    date: "2026-02-24",
    title: "AI Projects & Showcase",
    color: "var(--day-4)",
  },
] as const;

export const DISTRICTS = [
  "Hyderabad",
  "Ranga Reddy",
  "Medchal",
  "Karimnagar",
  "Mahbubnagar",
  "Peddapally",
  "Narayanpet",
] as const;

export type District = (typeof DISTRICTS)[number];

// Day number to CSS color class mapping
export const DAY_COLORS: Record<number, string> = {
  1: "bg-day-1",
  2: "bg-day-2",
  3: "bg-day-3",
  4: "bg-day-4",
};

export const DAY_TEXT_COLORS: Record<number, string> = {
  1: "text-day-1",
  2: "text-day-2",
  3: "text-day-3",
  4: "text-day-4",
};

// Status badge colors
export const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-yellow-100 text-yellow-800",
  verified: "bg-emerald-100 text-emerald-800",
  flagged: "bg-orange-100 text-orange-800",
  rejected: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  featured: "bg-purple-100 text-purple-800",
};

// Helpers
export function getDayTitle(dayNumber: number): string {
  return PROGRAM_SCHEDULE.find((d) => d.day === dayNumber)?.title ?? `Day ${dayNumber}`;
}

export function getDayDate(dayNumber: number): string {
  return PROGRAM_SCHEDULE.find((d) => d.day === dayNumber)?.date ?? "";
}

export function formatDayDate(dayNumber: number): string {
  const dateStr = getDayDate(dayNumber);
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function getStatusBadgeClass(status: string): string {
  return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700";
}
