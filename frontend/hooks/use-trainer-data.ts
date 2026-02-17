import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  TrainerSummary,
  SubmissionListItem,
  SubmissionDetail,
  School,
  Curriculum,
  ProjectHighlight,
  TrainerProfile,
  Student,
} from "@/lib/types";

export function useTrainerSummary() {
  return useQuery<TrainerSummary>({
    queryKey: ["trainer", "summary"],
    queryFn: () => api.get("/api/dashboard/summary/").then((r) => r.data),
  });
}

export function useTrainerSubmissions() {
  return useQuery<SubmissionListItem[]>({
    queryKey: ["trainer", "submissions"],
    queryFn: () =>
      api.get("/api/dashboard/trainer/submissions/").then((r) => r.data),
  });
}

export function useTrainerSubmissionDetail(id: string | null) {
  return useQuery<SubmissionDetail>({
    queryKey: ["trainer", "submission", id],
    queryFn: () =>
      api.get(`/api/dashboard/trainer/submissions/${id}/`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useSchools() {
  return useQuery<School[]>({
    queryKey: ["trainer", "schools"],
    queryFn: () => api.get("/api/dashboard/schools/").then((r) => r.data),
  });
}

export function useCurriculum() {
  return useQuery<Curriculum[]>({
    queryKey: ["curriculum"],
    queryFn: () => api.get("/api/dashboard/curriculum/").then((r) => r.data),
  });
}

export function useSubmitSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post("/api/dashboard/trainer/submit/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainer"] });
    },
  });
}

export function useAddProject() {
  const qc = useQueryClient();
  return useMutation<ProjectHighlight, Error, { submissionId: string; formData: FormData }>({
    mutationFn: ({ submissionId, formData }) =>
      api
        .post(
          `/api/dashboard/trainer/submissions/${submissionId}/projects/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        )
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainer"] });
    },
  });
}

// --- Profile ---

export function useTrainerProfile() {
  return useQuery<TrainerProfile>({
    queryKey: ["trainer", "profile"],
    queryFn: () =>
      api.get("/api/dashboard/trainer/profile/").then((r) => r.data),
  });
}

export function useUpdateTrainerProfile() {
  const qc = useQueryClient();
  return useMutation<TrainerProfile, Error, FormData>({
    mutationFn: (formData) =>
      api
        .patch("/api/dashboard/trainer/profile/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainer", "profile"] });
    },
  });
}

// --- Students ---

export function useTrainerStudents() {
  return useQuery<Student[]>({
    queryKey: ["trainer", "students"],
    queryFn: () =>
      api.get("/api/dashboard/trainer/students/").then((r) => r.data),
  });
}

export function useAddStudent() {
  const qc = useQueryClient();
  return useMutation<Student, Error, Record<string, string>>({
    mutationFn: (data) =>
      api
        .post("/api/dashboard/trainer/students/add/", data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainer", "students"] });
      qc.invalidateQueries({ queryKey: ["trainer", "summary"] });
    },
  });
}

export function useUpdateStudent() {
  const qc = useQueryClient();
  return useMutation<Student, Error, { id: string; data: Record<string, string> }>({
    mutationFn: ({ id, data }) =>
      api
        .patch(`/api/dashboard/trainer/students/${id}/`, data)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainer", "students"] });
    },
  });
}

export function useDeleteStudent() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      api.delete(`/api/dashboard/trainer/students/${id}/delete/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trainer", "students"] });
      qc.invalidateQueries({ queryKey: ["trainer", "summary"] });
    },
  });
}

// --- Projects ---

export function useTrainerProjects() {
  return useQuery<ProjectHighlight[]>({
    queryKey: ["trainer", "projects"],
    queryFn: () =>
      api.get("/api/dashboard/trainer/projects/").then((r) => r.data),
  });
}
