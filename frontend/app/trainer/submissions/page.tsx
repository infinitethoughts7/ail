"use client";

import { SubmissionList } from "@/components/trainer/submission-list";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TrainerSubmissionsPage() {
  return (
    <div>
      <TrainerHeader title="Submissions">
        <Link href="/trainer/form">
          <Button size="sm" className="h-8 rounded-full bg-violet-600 text-xs hover:bg-violet-700">
            <Plus className="mr-1 h-3.5 w-3.5" />
            New
          </Button>
        </Link>
      </TrainerHeader>
      <div className="p-4">
        <SubmissionList />
      </div>
    </div>
  );
}
