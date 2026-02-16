"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useUWHSummary,
  useUWHDistrictProgress,
  useUWHGallery,
  useUWHProjects,
  useUWHActivityFeed,
} from "@/hooks/use-uwh-data";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Eye } from "lucide-react";

export default function UWHPreviewPage() {
  const { data: summary, isLoading: loadingSummary } = useUWHSummary();
  const { data: districts } = useUWHDistrictProgress();
  const { data: gallery } = useUWHGallery();
  const { data: projects } = useUWHProjects();
  const { data: activities } = useUWHActivityFeed();

  if (loadingSummary) {
    return (
      <div className="p-6">
        <Skeleton className="mb-4 h-12 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const allPhotos = gallery
    ? [...gallery.featured, ...gallery.photos]
    : [];

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Eye className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold sm:text-2xl">UWH Preview</h1>
        <Badge variant="outline" className="text-xs">
          What UWH sponsor sees
        </Badge>
      </div>

      <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-4 sm:p-6">
        {/* Banner */}
        {summary?.status_banner && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
              {
                green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
                yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
                red: "bg-red-500/10 border-red-500/30 text-red-700",
              }[summary.status_banner.color] ||
              "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
            }`}
          >
            {summary.status_banner.message}
          </div>
        )}

        {/* KPIs */}
        {summary?.kpis && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: "Total Schools", value: summary.kpis.total_schools },
              { label: "Completed", value: summary.kpis.schools_completed },
              { label: "In Progress", value: summary.kpis.schools_in_progress },
              { label: "Students Trained", value: summary.kpis.total_students_trained },
              { label: "Sessions", value: summary.kpis.total_sessions },
              { label: "Districts", value: summary.kpis.total_districts },
            ].map((k) => (
              <Card key={k.label}>
                <CardContent className="px-3 py-3">
                  <p className="text-[11px] text-muted-foreground">{k.label}</p>
                  <p className="text-xl font-bold">{k.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Districts */}
          {districts && districts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  District Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {districts.map((d) => {
                    const pct = d.total_schools > 0
                      ? Math.round((d.completed / d.total_schools) * 100) : 0;
                    return (
                      <div key={d.id}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {d.completed}/{d.total_schools}
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Activity Feed ({activities?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {activities?.map((a) => (
                    <div key={a.id} className="border-b pb-2 last:border-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {timeAgo(a.timestamp)} ·{" "}
                        {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                          a.activity_type}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Photos */}
        {allPhotos.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">
              Photos ({allPhotos.length})
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {allPhotos.slice(0, 12).map((p) => (
                <img
                  key={p.id}
                  src={p.image_url}
                  alt={p.caption || "Photo"}
                  className="aspect-square rounded-lg object-cover"
                />
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold">
              Student Projects ({projects.length})
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.slice(0, 4).map((proj) => (
                <Card key={proj.id}>
                  <CardContent className="px-4 py-3">
                    <p className="text-sm font-semibold">{proj.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {proj.student_name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {proj.display_description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
