"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwinfyActivityLog } from "@/hooks/use-swinfy-data";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export default function ActivityPage() {
  const { data: activities, isLoading } = useSwinfyActivityLog();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-4 text-xl font-bold sm:text-2xl">Activity Log</h1>
      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : !activities?.length ? (
        <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No activity yet.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{a.title}</p>
                  {a.description && <p className="truncate text-xs text-muted-foreground">{a.description}</p>}
                  {a.user_name && <p className="text-[11px] text-muted-foreground">by {a.user_name}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <Badge variant="secondary" className="text-[10px]">{ACTIVITY_TYPE_LABELS[a.activity_type] || a.activity_type.replace(/_/g, " ")}</Badge>
                  <span className="text-[11px] text-muted-foreground">{timeAgo(a.timestamp)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
