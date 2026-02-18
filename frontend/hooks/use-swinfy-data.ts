import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  AdminSummary,
  District,
  School,
  SubmissionListItem,
  SubmissionDetail,
  SessionPhoto,
  ProjectHighlight,
  ActivityLogEntry,
  UWHControl,
  SwinfyTrainer,
} from "@/lib/types";

// ---- Filter types ----

export interface SubmissionFilters {
  status?: string;
  trainer?: string;
  school?: string;
  district?: string;
  day?: string;
}

export interface PhotoFilters {
  status?: string;
  school?: string;
  trainer?: string;
  district?: string;
  day?: string;
}

export interface ProjectFilters {
  status?: string;
  school?: string;
  trainer?: string;
  district?: string;
}

// ---- Helper ----

function cleanParams(obj: { [key: string]: string | undefined }) {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v) params[k] = v;
  }
  return params;
}

// ---- Queries ----

export function useAdminSummary() {
  return useQuery<AdminSummary>({
    queryKey: ["admin", "summary"],
    queryFn: () => api.get("/api/dashboard/summary/").then((r) => r.data),
    refetchInterval: 15_000,
  });
}

export function useDistricts() {
  return useQuery<District[]>({
    queryKey: ["districts"],
    queryFn: () => api.get("/api/dashboard/districts/").then((r) => r.data),
  });
}

export function useSchools(districtId?: string) {
  return useQuery<School[]>({
    queryKey: ["schools", districtId],
    queryFn: () =>
      api
        .get("/api/dashboard/schools/", {
          params: districtId ? { district: districtId } : {},
        })
        .then((r) => r.data),
  });
}

export function useSwinfySubmissions(filters: SubmissionFilters = {}) {
  const params = cleanParams({ ...filters });
  return useQuery<SubmissionListItem[]>({
    queryKey: ["swinfy", "submissions", params],
    queryFn: () =>
      api
        .get("/api/dashboard/swinfy/submissions/", { params })
        .then((r) => r.data),
    refetchInterval: 15_000,
  });
}

export function useSwinfySubmissionDetail(id: string | null) {
  return useQuery<SubmissionDetail>({
    queryKey: ["swinfy", "submission", id],
    queryFn: () =>
      api.get(`/api/dashboard/swinfy/submissions/${id}/`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useSwinfyPhotos(filters: PhotoFilters = {}) {
  const params = cleanParams({
    status: filters.status || "pending",
    school: filters.school,
    trainer: filters.trainer,
    district: filters.district,
    day: filters.day,
  });
  return useQuery<SessionPhoto[]>({
    queryKey: ["swinfy", "photos", params],
    queryFn: () =>
      api
        .get("/api/dashboard/swinfy/photos/pending/", { params })
        .then((r) => r.data),
    refetchInterval: 15_000,
  });
}

/** @deprecated Use useSwinfyPhotos instead */
export function usePendingPhotos(statusFilter: string = "pending") {
  return useSwinfyPhotos({ status: statusFilter });
}

export function useSwinfyProjects(filters: ProjectFilters = {}) {
  const params = cleanParams({
    status: filters.status || "pending",
    school: filters.school,
    trainer: filters.trainer,
    district: filters.district,
  });
  return useQuery<ProjectHighlight[]>({
    queryKey: ["swinfy", "projects", params],
    queryFn: () =>
      api
        .get("/api/dashboard/swinfy/projects/pending/", { params })
        .then((r) => r.data),
    refetchInterval: 15_000,
  });
}

/** @deprecated Use useSwinfyProjects instead */
export function usePendingProjects() {
  return useSwinfyProjects({ status: "pending" });
}

export function useSwinfyActivityLog() {
  return useQuery<ActivityLogEntry[]>({
    queryKey: ["swinfy", "activity-log"],
    queryFn: () =>
      api.get("/api/dashboard/swinfy/activity-log/").then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useUWHControl() {
  return useQuery<UWHControl>({
    queryKey: ["swinfy", "uwh-control"],
    queryFn: () =>
      api.get("/api/dashboard/swinfy/uwh-control/").then((r) => r.data),
  });
}

export function useSwinfyTrainers(districtId?: string) {
  return useQuery<SwinfyTrainer[]>({
    queryKey: ["swinfy", "trainers", districtId],
    queryFn: () =>
      api
        .get("/api/dashboard/swinfy/trainers/", {
          params: districtId ? { district: districtId } : {},
        })
        .then((r) => r.data),
  });
}

// ---- Mutations ----

function useInvalidateSwinfy() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ["swinfy"] });
    qc.invalidateQueries({ queryKey: ["admin"] });
  };
}

export function useVerifySubmission() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      api.patch(`/api/dashboard/swinfy/submissions/${id}/verify/`, { notes }),
    onSuccess: invalidate,
  });
}

export function useFlagSubmission() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/api/dashboard/swinfy/submissions/${id}/flag/`, { reason }),
    onSuccess: invalidate,
  });
}

export function useRejectSubmission() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.patch(`/api/dashboard/swinfy/submissions/${id}/reject/`, { reason }),
    onSuccess: invalidate,
  });
}

export function useApprovePhoto() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/dashboard/swinfy/photos/${id}/approve/`),
    onSuccess: invalidate,
  });
}

export function useFeaturePhoto() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/dashboard/swinfy/photos/${id}/feature/`),
    onSuccess: invalidate,
  });
}

export function useRejectPhoto() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/api/dashboard/swinfy/photos/${id}/reject/`, { reason }),
    onSuccess: invalidate,
  });
}

export function useDeletePhoto() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/dashboard/swinfy/photos/${id}/delete/`),
    onSuccess: invalidate,
  });
}

export function useBulkApprovePhotos() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (photo_ids: string[]) =>
      api.post("/api/dashboard/swinfy/photos/bulk-approve/", { photo_ids }),
    onSuccess: invalidate,
  });
}

export function useBulkRejectPhotos() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({ photo_ids, reason }: { photo_ids: string[]; reason: string }) =>
      api.post("/api/dashboard/swinfy/photos/bulk-reject/", { photo_ids, reason }),
    onSuccess: invalidate,
  });
}

export function useApproveProject() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/dashboard/swinfy/projects/${id}/approve/`),
    onSuccess: invalidate,
  });
}

export function useFeatureProject() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/dashboard/swinfy/projects/${id}/feature/`),
    onSuccess: invalidate,
  });
}

export function useRejectProject() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.patch(`/api/dashboard/swinfy/projects/${id}/reject/`, { reason }),
    onSuccess: invalidate,
  });
}

export function useEditProjectForUWH() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: ({
      id,
      description,
      notes,
    }: {
      id: string;
      description: string;
      notes?: string;
    }) =>
      api.patch(`/api/dashboard/swinfy/projects/${id}/edit-for-uwh/`, {
        description,
        notes,
      }),
    onSuccess: invalidate,
  });
}

export function useUpdateStatusBanner() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (data: { status: string; message: string; color: string }) =>
      api.patch("/api/dashboard/swinfy/uwh-control/status-banner/", data),
    onSuccess: invalidate,
  });
}

export function useUpdateFinancialSummary() {
  const invalidate = useInvalidateSwinfy();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch("/api/dashboard/swinfy/uwh-control/financial-summary/", { data }),
    onSuccess: invalidate,
  });
}
