"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {d.completed}/{d.total_schools} completed
                    </span>
                    {d.in_progress > 0 && (
                      <span className="text-xs text-blue-600">
                        ({d.in_progress} active)
                      </span>
                    )}
                  </div>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
