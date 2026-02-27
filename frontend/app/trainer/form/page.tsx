"use client";

import { SubmissionForm } from "@/components/trainer/submission-form";
import { TrainerHeader } from "@/components/trainer/trainer-header";

export default function TrainerFormPage() {
  return (
    <div>
      <TrainerHeader title="Submit Session" />
      <div className="mx-auto max-w-2xl p-4">
        <SubmissionForm />
      </div>
    </div>
  );
}
