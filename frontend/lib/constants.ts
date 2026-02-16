// Curriculum Day theme colors — refined luxury palette
export const CURRICULUM_DAYS = [
  {
    day: 1,
    label: "Day 1: Introduction to AI",
    shortLabel: "Day 1",
    color: "bg-[#4338CA]",
    textColor: "text-[#4338CA]",
    bgLight: "bg-[#EEF2FF]",
    borderColor: "border-[#4338CA]/20",
    gradient: "from-[#4338CA] to-[#5B50E0]",
    hex: "#4338CA",
    bgHex: "#EEF2FF",
  },
  {
    day: 2,
    label: "Day 2: AI in Daily Life",
    shortLabel: "Day 2",
    color: "bg-[#047857]",
    textColor: "text-[#047857]",
    bgLight: "bg-[#ECFDF5]",
    borderColor: "border-[#047857]/20",
    gradient: "from-[#047857] to-[#059669]",
    hex: "#047857",
    bgHex: "#ECFDF5",
  },
  {
    day: 3,
    label: "Day 3: Hands-On Projects",
    shortLabel: "Day 3",
    color: "bg-[#B45309]",
    textColor: "text-[#B45309]",
    bgLight: "bg-[#FFFBEB]",
    borderColor: "border-[#B45309]/20",
    gradient: "from-[#B45309] to-[#D97706]",
    hex: "#B45309",
    bgHex: "#FFFBEB",
  },
  {
    day: 4,
    label: "Day 4: Showcase & Reflection",
    shortLabel: "Day 4",
    color: "bg-[#B91C1C]",
    textColor: "text-[#B91C1C]",
    bgLight: "bg-[#FEF2F2]",
    borderColor: "border-[#B91C1C]/20",
    gradient: "from-[#B91C1C] to-[#DC2626]",
    hex: "#B91C1C",
    bgHex: "#FEF2F2",
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
