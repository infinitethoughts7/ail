import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  UWHSummary,
  UWHGallery,
  ProjectHighlight,
  ActivityLogEntry,
  DistrictProgress,
} from "@/lib/types";

export function useUWHSummary() {
  return useQuery<UWHSummary>({
    queryKey: ["uwh", "summary"],
    queryFn: () => api.get("/api/dashboard/uwh/summary/").then((r) => r.data),
    refetchInterval: 30_000,
  });
}

export function useUWHGallery() {
  return useQuery<UWHGallery>({
    queryKey: ["uwh", "gallery"],
    queryFn: () => api.get("/api/dashboard/uwh/gallery/").then((r) => r.data),
    refetchInterval: 60_000,
  });
}

export function useUWHProjects() {
  return useQuery<ProjectHighlight[]>({
    queryKey: ["uwh", "projects"],
    queryFn: () => api.get("/api/dashboard/uwh/projects/").then((r) => r.data),
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
