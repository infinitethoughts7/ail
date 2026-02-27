"use client";

import { ProjectList } from "@/components/trainer/project-list";
import { TrainerHeader } from "@/components/trainer/trainer-header";

export default function TrainerProjectsPage() {
  return (
    <div>
      <TrainerHeader title="Student Ideas" />
      <div className="p-4">
        <ProjectList />
      </div>
    </div>
  );
}
