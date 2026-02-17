"use client";

import { StudentList } from "@/components/trainer/student-list";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function TrainerStudentsPage() {
  return (
    <div>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Students</h1>
      </header>
      <div className="p-4">
        <StudentList />
      </div>
    </div>
  );
}
