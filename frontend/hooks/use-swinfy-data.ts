import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  AdminSummary,
  SubmissionListItem,
  SubmissionDetail,
  SessionPhoto,
  ProjectHighlight,
  ActivityLogEntry,
  UWHControl,
  SwinfyTrainer,
} from "@/lib/types";

// ---- Queries ----

export function useAdminSummary() {
  return useQuery<AdminSummary>({
    queryKey: ["admin", "summary"],
    queryFn: () => api.get("/api/dashboard/summary/").then((r) => r.data),
    refetchInterval: 15_000,
  });
}

export function useSwinfySubmissions(status?: string) {
  return useQuery<SubmissionListItem[]>({
    queryKey: ["swinfy", "submissions", status],
    queryFn: () =>
      api
        .get("/api/dashboard/swinfy/submissions/", { params: status ? { status } : {} })
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

export function usePendingPhotos() {
  return useQuery<SessionPhoto[]>({
    queryKey: ["swinfy", "photos", "pending"],
    queryFn: () =>
      api.get("/api/dashboard/swinfy/photos/pending/").then((r) => r.data),
    refetchInterval: 15_000,
  });
}

export function usePendingProjects() {
  return useQuery<ProjectHighlight[]>({
    queryKey: ["swinfy", "projects", "pending"],
    queryFn: () =>
      api.get("/api/dashboard/swinfy/projects/pending/").then((r) => r.data),
    refetchInterval: 15_000,
  });
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

export function useSwinfyTrainers() {
  return useQuery<SwinfyTrainer[]>({
    queryKey: ["swinfy", "trainers"],
    queryFn: () =>
      api.get("/api/dashboard/swinfy/trainers/").then((r) => r.data),
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
