"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSwinfyProjects } from "@/hooks/use-swinfy-data";
import { ProjectApprovalList } from "@/components/swinfy/project-approval-list";
import { SwinfyFilters } from "@/components/swinfy/swinfy-filters";

const STATUS_TABS = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "featured", label: "Featured" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
] as const;

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const [trainer, setTrainer] = useState("");

  const { data: projects, isLoading } = useSwinfyProjects({
    status: statusFilter === "all" ? "all" : statusFilter,
    district: district || undefined,
    school: school || undefined,
    trainer: trainer || undefined,
  });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Project Approval</h1>

      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_TABS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={statusFilter === f.key ? "default" : "outline"}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
            {!isLoading && statusFilter === f.key && projects
              ? ` (${projects.length})`
              : ""}
          </Button>
        ))}
      </div>

      <div className="mb-4">
        <SwinfyFilters
          district={district}
          school={school}
          trainer={trainer}
          onDistrictChange={setDistrict}
          onSchoolChange={setSchool}
          onTrainerChange={setTrainer}
          showDay={false}
        />
      </div>

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
