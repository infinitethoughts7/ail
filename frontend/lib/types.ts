// ============================================================
// TypeScript interfaces matching Django backend serializers
// ============================================================

// --- District ---
export interface District {
  id: string;
  name: string;
  state: string;
  school_count: number;
  created_at: string;
}

// --- School ---
export interface School {
  id: string;
  name: string;
  district: string;
  district_name: string;
  status: "not_started" | "in_progress" | "completed";
  total_students: number;
  assigned_trainer: string | null;
  trainer_name: string | null;
  total_days: number;
  created_at: string;
}

export interface SchoolDetail extends School {
  address: string;
  principal_name: string;
  principal_phone: string;
  updated_at: string;
  submissions: SubmissionListItem[];
}

// --- Curriculum ---
export interface Curriculum {
  id: string;
  day_number: number;
  title: string;
  description: string;
  learning_objectives: string[];
  activities: string[];
  created_at: string;
}

// --- Session Photo ---
export interface SessionPhoto {
  id: string;
  image: string;
  image_url: string;
  caption: string;
  approval_status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  rejection_reason: string;
  uploaded_at: string;
}

// --- Project Highlight ---
export interface ProjectHighlight {
  id: string;
  student_name: string;
  student_age: number | null;
  student_grade: string;
  title: string;
  description: string;
  image: string | null;
  image_url: string | null;
  approval_status: "pending" | "approved" | "featured" | "rejected";
  rejection_reason: string;
  uwh_description: string;
  swinfy_notes: string;
  display_description: string;
  created_at: string;
}

// --- Submission (list) ---
export interface SubmissionListItem {
  id: string;
  school: string;
  school_name: string;
  trainer: string;
  trainer_name: string;
  day_number: number;
  student_count: number;
  status: "draft" | "submitted" | "verified" | "flagged" | "rejected";
  submitted_at: string | null;
  photo_count: number;
  project_count: number;
  created_at: string;
}

// --- Submission (detail) ---
export interface SubmissionDetail {
  id: string;
  school: string;
  school_name: string;
  trainer: string;
  trainer_name: string;
  day_number: number;
  curriculum: string | null;
  student_count: number;
  topics_covered: string[];
  trainer_notes: string;
  challenges: string;
  attendance_file: string | null;
  status: "draft" | "submitted" | "verified" | "flagged" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
  flag_reason: string;
  rejection_reason: string;
  swinfy_notes: string;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
  photos: SessionPhoto[];
  project_highlights: ProjectHighlight[];
}

// --- Activity Log ---
export interface ActivityLogEntry {
  id: string;
  user: string | null;
  user_name: string | null;
  activity_type: string;
  title: string;
  description: string;
  is_uwh_visible: boolean;
  metadata: Record<string, unknown>;
  thumbnail_url?: string | null;
  timestamp: string;
}

// --- UWH Control ---
export interface UWHControl {
  status: "active" | "paused" | "completed";
  status_message: string;
  status_color: string;
  financial_summary: Record<string, unknown>;
  updated_at: string;
}

// --- Student ---
export interface Student {
  id: string;
  name: string;
  age: number | null;
  grade: string;
  school: string;
  school_name: string;
  parent_name: string;
  parent_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// --- Trainer Profile ---
export interface TrainerProfile {
  id: string;
  email: string;
  username: string;
  profile_photo: string | null;
  profile_photo_url: string | null;
  assigned_school: {
    id: string;
    name: string;
    district_name: string;
    status: string;
    total_students: number;
    total_days: number;
    map_url: string;
    poc_name: string;
    poc_designation: string;
    poc_phone: string;
    principal_phone: string;
    co_trainer: string | null;
  } | null;
}

// --- Trainer Gallery Photo ---
export interface TrainerGalleryPhoto {
  id: string;
  image_url: string | null;
  caption: string;
  approval_status: "pending" | "approved" | "rejected";
  is_featured: boolean;
  rejection_reason: string;
  uploaded_at: string;
  school_name: string;
  day_number: number;
}

// --- Swinfy Trainer List ---
export interface SwinfyTrainer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  profile_photo_url: string | null;
  schools: {
    id: string;
    name: string;
    district_name: string;
    status: "not_started" | "in_progress" | "completed";
  }[];
  total_submissions: number;
  verified_submissions: number;
  pending_submissions: number;
  flagged_submissions: number;
}

// --- Summary responses (role-branched) ---
export interface AdminSummary {
  total_schools: number;
  schools_completed: number;
  total_students: number;
  students_trained: number;
  pending_submissions: number;
  pending_photos: number;
  pending_projects: number;
}

export interface TrainerSummary {
  assigned_schools: number;
  submissions_count: number;
  verified_count: number;
  flagged_count: number;
  student_count: number;
  project_count: number;
}

export interface SponsorSummary {
  total_schools: number;
  schools_completed: number;
  total_students: number;
  students_trained: number;
}

// --- UWH Summary (dedicated endpoint) ---
export interface UWHSummary {
  status_banner: {
    status: string;
    message: string;
    color: string;
  };
  kpis: {
    total_schools: number;
    schools_completed: number;
    schools_in_progress: number;
    total_students_trained: number;
    total_sessions: number;
    total_districts: number;
  };
  financial_summary: Record<string, unknown>;
}

// --- UWH Gallery ---
export interface UWHGallery {
  featured: SessionPhoto[];
  photos: SessionPhoto[];
}

// --- UWH District Progress ---
export interface DistrictProgress {
  id: string;
  name: string;
  total_schools: number;
  completed: number;
  in_progress: number;
}
