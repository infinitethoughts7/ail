"use client";

import { SubmissionList } from "@/components/trainer/submission-list";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TrainerSubmissionsPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-base font-semibold">Submissions</h1>
        </div>
        <Link href="/trainer/form">
          <Button size="sm" className="h-8 rounded-lg bg-[#0F4C4C] text-xs hover:bg-[#0F4C4C]/90">
            <Plus className="mr-1 h-3.5 w-3.5" />
            New
          </Button>
        </Link>
      </header>
      <div className="p-4">
        <SubmissionList />
      </div>
    </div>
  );
}
