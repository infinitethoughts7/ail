"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSwinfyPhotos } from "@/hooks/use-swinfy-data";
import { PhotoApprovalGrid } from "@/components/swinfy/photo-approval-grid";
import { SwinfyFilters } from "@/components/swinfy/swinfy-filters";

const STATUS_TABS = [
  { key: "all", label: "All Photos" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
] as const;

export default function PhotosPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const [trainer, setTrainer] = useState("");
  const [day, setDay] = useState("");

  const { data: photos, isLoading } = useSwinfyPhotos({
    status: statusFilter === "pending" ? "pending" : statusFilter === "approved" ? "approved" : "all",
    district: district || undefined,
    school: school || undefined,
    trainer: trainer || undefined,
    day: day || undefined,
  });

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Photo Management</h1>

      <div className="mb-3 flex gap-2">
        {STATUS_TABS.map((f) => (
          <Button
            key={f.key}
            size="sm"
            variant={statusFilter === f.key ? "default" : "outline"}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
            {!isLoading && statusFilter === f.key && photos
              ? ` (${photos.length})`
              : ""}
          </Button>
        ))}
      </div>

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : (
        <PhotoApprovalGrid photos={photos || []} />
      )}
    </div>
  );
}
