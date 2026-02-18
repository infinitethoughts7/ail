import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  UWHSummary,
  UWHGallery,
  ProjectHighlight,
  ActivityLogEntry,
  DistrictProgress,
} from "@/lib/types";

export interface UWHFilters {
  district?: string;
  school?: string;
}

function cleanParams(obj: { [key: string]: string | undefined }) {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v) params[k] = v;
  }
  return params;
}

export function useUWHSummary() {
  return useQuery<UWHSummary>({
    queryKey: ["uwh", "summary"],
    queryFn: () => api.get("/api/dashboard/uwh/summary/").then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useUWHGallery(filters: UWHFilters = {}) {
  const params = cleanParams({ ...filters });
  return useQuery<UWHGallery>({
    queryKey: ["uwh", "gallery", params],
    queryFn: () =>
      api.get("/api/dashboard/uwh/gallery/", { params }).then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useUWHProjects(filters: UWHFilters = {}) {
  const params = cleanParams({ ...filters });
  return useQuery<ProjectHighlight[]>({
    queryKey: ["uwh", "projects", params],
    queryFn: () =>
      api.get("/api/dashboard/uwh/projects/", { params }).then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useUWHActivityFeed() {
  return useQuery<ActivityLogEntry[]>({
    queryKey: ["uwh", "activity-feed"],
    queryFn: () => api.get("/api/dashboard/uwh/activity-feed/").then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useUWHDistrictProgress() {
  return useQuery<DistrictProgress[]>({
    queryKey: ["uwh", "district-progress"],
    queryFn: () =>
      api.get("/api/dashboard/uwh/district-progress/").then((r) => r.data),
    refetchInterval: 30_000,
  });
}
