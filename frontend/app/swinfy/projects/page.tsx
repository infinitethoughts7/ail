"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePendingProjects } from "@/hooks/use-swinfy-data";
import { ProjectApprovalList } from "@/components/swinfy/project-approval-list";

export default function ProjectsPage() {
  const { data: projects, isLoading } = usePendingProjects();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Project Approval</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <ProjectApprovalList projects={projects || []} />
      )}
    </div>
  );
}
