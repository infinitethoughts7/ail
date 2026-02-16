"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUWHActivityFeed } from "@/hooks/use-uwh-data";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Activity } from "lucide-react";

export function UWHLiveFeed() {
  const { data: activities, isLoading } = useUWHActivityFeed();

  if (isLoading) {
    return <Skeleton className="h-96 rounded-xl" />;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold sm:text-base">
            Live Activity
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!activities || activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-3 pr-4">
              {activities.map((a) => (
                <div
                  key={a.id}
                  className="border-b pb-2.5 last:border-0 last:pb-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium leading-tight">
                      {a.title}
                    </p>
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[10px]"
                    >
                      {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                        a.activity_type.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {a.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {a.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {timeAgo(a.timestamp)}
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
