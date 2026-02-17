"use client";

import { ProjectList } from "@/components/trainer/project-list";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function TrainerProjectsPage() {
  return (
    <div>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Student Ideas</h1>
      </header>
      <div className="p-4">
        <ProjectList />
      </div>
    </div>
  );
}
