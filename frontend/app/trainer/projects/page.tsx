"use client";

import { ProjectList } from "@/components/trainer/project-list";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TrainerProjectsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">Student Ideas</h1>
      </header>
      <div className="p-4">
        <ProjectList />
      </div>
    </div>
  );
}
