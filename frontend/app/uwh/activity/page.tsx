"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHActivityFeed } from "@/hooks/use-uwh-data";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Activity, Clock } from "lucide-react";

const TYPE_COLORS: Record<string, string> = {
  submission_verified: "bg-emerald-100 text-emerald-800",
  photo_approved: "bg-blue-100 text-blue-800",
  project_approved: "bg-purple-100 text-purple-800",
  project_featured: "bg-amber-100 text-amber-800",
};

export default function ActivityPage() {
  const { data: activities, isLoading } = useUWHActivityFeed();

  if (isLoading) {
    return (
      <div className="p-6 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Activity Timeline</h1>
        <p className="text-sm text-muted-foreground">
          What happened today? What&apos;s the latest?
        </p>
      </div>

      {!activities || activities.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Activity className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              No activity to display yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

          <div className="space-y-4">
            {activities.map((a) => (
              <div key={a.id} className="relative pl-10">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-2 h-3 w-3 rounded-full border-2 border-background bg-primary" />

                <Card>
                  <CardContent className="px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{a.title}</p>
                        {a.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {a.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            TYPE_COLORS[a.activity_type] || ""
                          }`}
                        >
                          {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                            a.activity_type.replace(/_/g, " ")}
                        </Badge>
                        <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {timeAgo(a.timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
