// Curriculum Day theme colors, icons, labels
export const CURRICULUM_DAYS = [
  {
    day: 1,
    label: "Day 1: Introduction to AI",
    shortLabel: "Day 1",
    color: "bg-blue-500",
    textColor: "text-blue-700",
    bgLight: "bg-blue-50",
    borderColor: "border-blue-300",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    day: 2,
    label: "Day 2: AI in Daily Life",
    shortLabel: "Day 2",
    color: "bg-emerald-500",
    textColor: "text-emerald-700",
    bgLight: "bg-emerald-50",
    borderColor: "border-emerald-300",
    gradient: "from-emerald-500 to-emerald-600",
  },
  {
    day: 3,
    label: "Day 3: Hands-On Projects",
    shortLabel: "Day 3",
    color: "bg-purple-500",
    textColor: "text-purple-700",
    bgLight: "bg-purple-50",
    borderColor: "border-purple-300",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    day: 4,
    label: "Day 4: Showcase & Reflection",
    shortLabel: "Day 4",
    color: "bg-amber-500",
    textColor: "text-amber-700",
    bgLight: "bg-amber-50",
    borderColor: "border-amber-300",
    gradient: "from-amber-500 to-amber-600",
  },
] as const;

export function getDayTheme(dayNumber: number) {
  return CURRICULUM_DAYS.find((d) => d.day === dayNumber) ?? CURRICULUM_DAYS[0];
}

export const SUBMISSION_STATUS_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  draft: { label: "Draft", bg: "bg-gray-100", text: "text-gray-700" },
  submitted: { label: "Submitted", bg: "bg-yellow-100", text: "text-yellow-800" },
  verified: { label: "Verified", bg: "bg-emerald-100", text: "text-emerald-800" },
  flagged: { label: "Flagged", bg: "bg-orange-100", text: "text-orange-800" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-800" },
};

export const SCHOOL_STATUS_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  not_started: { label: "Not Started", bg: "bg-gray-100", text: "text-gray-700" },
  in_progress: { label: "In Progress", bg: "bg-blue-100", text: "text-blue-800" },
  completed: { label: "Completed", bg: "bg-emerald-100", text: "text-emerald-800" },
};

export const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  submission_created: "Submission",
  submission_verified: "Verified",
  submission_flagged: "Flagged",
  submission_rejected: "Rejected",
  photo_approved: "Photo Approved",
  photo_rejected: "Photo Rejected",
  project_approved: "Project Approved",
  project_featured: "Project Featured",
};
