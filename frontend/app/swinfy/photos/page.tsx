"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { usePendingPhotos } from "@/hooks/use-swinfy-data";
import { PhotoApprovalGrid } from "@/components/swinfy/photo-approval-grid";

export default function PhotosPage() {
  const { data: photos, isLoading } = usePendingPhotos();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Photo Approval</h1>

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
