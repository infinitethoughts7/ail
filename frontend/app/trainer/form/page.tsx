"use client";

import { SubmissionForm } from "@/components/trainer/submission-form";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function TrainerFormPage() {
  return (
    <div>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <h1 className="text-sm font-semibold">Submit Session</h1>
      </header>
      <div className="mx-auto max-w-2xl p-4">
        <SubmissionForm />
      </div>
    </div>
  );
}
