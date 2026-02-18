"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwinfySubmissions } from "@/hooks/use-swinfy-data";
import { VerificationQueue } from "@/components/swinfy/verification-queue";
import { SubmissionDetailModal } from "@/components/swinfy/submission-detail-modal";
import { SwinfyFilters } from "@/components/swinfy/swinfy-filters";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function VerificationPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState("submitted");
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const [trainer, setTrainer] = useState("");
  const [day, setDay] = useState("");

  const { data: submissions, isLoading } = useSwinfySubmissions({
    status: tab === "all" ? undefined : tab,
    district: district || undefined,
    school: school || undefined,
    trainer: trainer || undefined,
    day: day || undefined,
  });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Verification Queue</h1>

      <Tabs value={tab} onValueChange={setTab} className="mb-3">
        <TabsList>
          <TabsTrigger value="submitted">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="flagged">Flagged</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4">
        <SwinfyFilters
          district={district}
          school={school}
          trainer={trainer}
          day={day}
          onDistrictChange={setDistrict}
          onSchoolChange={setSchool}
          onTrainerChange={setTrainer}
          onDayChange={setDay}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <VerificationQueue
          submissions={submissions || []}
          onViewDetail={setSelectedId}
        />
      )}

      <SubmissionDetailModal
        submissionId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
