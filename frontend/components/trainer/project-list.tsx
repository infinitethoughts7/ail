"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerProjects } from "@/hooks/use-trainer-data";
import { AddProjectDialog } from "./add-project-dialog";
import { Plus, Lightbulb } from "lucide-react";
import { timeAgo } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: "Pending", bg: "bg-yellow-100", text: "text-yellow-800" },
  approved: { label: "Approved", bg: "bg-emerald-100", text: "text-emerald-800" },
  featured: { label: "Featured", bg: "bg-blue-100", text: "text-blue-800" },
  rejected: { label: "Rejected", bg: "bg-red-100", text: "text-red-800" },
};

export function ProjectList() {
  const { data: projects, isLoading } = useTrainerProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Idea
        </Button>
      </div>

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No project ideas yet. Add one from a submission.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => {
            const statusStyle = STATUS_STYLES[project.approval_status];
            return (
              <Card key={project.id} className="overflow-hidden">
                {project.image_url && (
                  <div className="aspect-video w-full overflow-hidden bg-muted">
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardContent className={`px-4 py-3 ${!project.image_url ? "pt-4" : ""}`}>
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 shrink-0 text-amber-500" />
                      <p className="text-sm font-semibold">{project.title}</p>
                    </div>
                    {statusStyle && (
                      <Badge
                        variant="outline"
                        className={`shrink-0 text-[10px] ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </Badge>
                    )}
                  </div>
                  <p className="mb-1.5 text-xs text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    By {project.student_name}
                    {project.student_grade && ` · Grade ${project.student_grade}`}
                    {" · "}
                    {timeAgo(project.created_at)}
                  </p>
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
