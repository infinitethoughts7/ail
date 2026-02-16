"use client";

import { SubmissionList } from "@/components/trainer/submission-list";

export default function TrainerSubmissionsPage() {
  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">My Submissions</h1>
      <SubmissionList />
    </div>
  );
}
