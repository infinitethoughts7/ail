"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHDistrictProgress } from "@/hooks/use-uwh-data";

export function UWHDistrictProgress() {
  const { data: districts, isLoading } = useUWHDistrictProgress();

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (!districts || districts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold sm:text-base">
          District Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {districts.map((d) => {
            const pct =
              d.total_schools > 0
                ? Math.round((d.completed / d.total_schools) * 100)
                : 0;

            return (
              <div key={d.id}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium">{d.name}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {d.completed}/{d.total_schools}
                  </span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {d.in_progress > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {d.in_progress} active
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
