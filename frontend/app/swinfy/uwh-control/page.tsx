"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUWHControl } from "@/hooks/use-swinfy-data";
import { UWHControlPanel } from "@/components/swinfy/uwh-control-panel";

export default function UWHControlPage() {
  const { data: control, isLoading } = useUWHControl();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">UWH Control Panel</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : control ? (
        <UWHControlPanel control={control} />
      ) : (
        <p className="text-sm text-muted-foreground">Failed to load control data.</p>
      )}
    </div>
  );
}
