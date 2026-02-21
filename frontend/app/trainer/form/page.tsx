"use client";

import { SubmissionForm } from "@/components/trainer/submission-form";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function TrainerFormPage() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">Submit Session</h1>
      </header>
      <div className="mx-auto max-w-2xl p-4">
        <SubmissionForm />
      </div>
    </div>
  );
}
