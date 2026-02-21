"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerProjects } from "@/hooks/use-trainer-data";
import { AddProjectDialog } from "./add-project-dialog";
import { Plus, Lightbulb, Star } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending: { label: "Pending", bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-500" },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  featured: { label: "Featured", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  rejected: { label: "Rejected", bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

export function ProjectList() {
  const { data: projects, isLoading } = useTrainerProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {projects?.length || 0} idea{projects?.length !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="h-9 rounded-xl bg-[#0F4C4C] px-3 text-xs hover:bg-[#0F4C4C]/90"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add Idea
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/30">
              <Lightbulb className="h-7 w-7 text-amber-500" />
            </div>
            <p className="font-medium">No project ideas yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Capture student creativity by adding their ideas
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => {
            const statusStyle = STATUS_STYLES[project.approval_status];
            return (
              <Card
                key={project.id}
                className="overflow-hidden border-0 shadow-sm transition-all active:scale-[0.99]"
              >
                {project.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardContent className={`p-4 ${!project.image_url ? "" : ""}`}>
                  {/* Status + Featured */}
                  <div className="mb-2 flex items-center gap-2">
                    {statusStyle && (
                      <Badge
                        variant="outline"
                        className={`border-0 text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                        {statusStyle.label}
                      </Badge>
                    )}
                    {project.approval_status === "featured" && (
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    )}
                  </div>

                  {/* Title */}
                  <div className="mb-1.5 flex items-start gap-2">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="text-sm font-semibold leading-snug">{project.title}</p>
                  </div>

                  {/* Description */}
                  <p className="mb-2 text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>

                  {/* Student info */}
                  <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0F4C4C]/10 text-[10px] font-bold text-[#0F4C4C]">
                      {project.student_name.charAt(0)}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {project.student_name}
                      {project.student_grade && ` · Grade ${project.student_grade}`}
                      {" · "}
                      {timeAgo(project.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AddProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
