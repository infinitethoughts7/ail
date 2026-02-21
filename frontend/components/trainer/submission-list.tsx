"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerSubmissions } from "@/hooks/use-trainer-data";
import { SUBMISSION_STATUS_STYLES, getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Camera, Users, ClipboardCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SubmissionList() {
  const { data: submissions, isLoading } = useTrainerSubmissions();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-16 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <ClipboardCheck className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-medium">No submissions yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your session reports will appear here
          </p>
          <Link
            href="/trainer/form"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[#0F4C4C]"
          >
            Submit your first session <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2.5">
      {submissions.map((sub) => {
        const dayTheme = getDayTheme(sub.day_number);
        const statusStyle = SUBMISSION_STATUS_STYLES[sub.status];

        return (
          <Card
            key={sub.id}
            className="overflow-hidden border-0 shadow-sm transition-all active:scale-[0.99]"
          >
            <CardContent className="flex items-center gap-3 p-0">
              {/* Color accent */}
              <div
                className="flex h-full w-1 self-stretch rounded-l-xl"
                style={{ backgroundColor: dayTheme.hex }}
              />
              <div className="flex flex-1 items-center gap-3 py-3 pr-4">
                {/* Day badge */}
                <div
                  className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: dayTheme.hex }}
                >
                  <span className="text-[10px] font-medium leading-none opacity-80">Day</span>
                  <span className="text-lg font-bold leading-tight">{sub.day_number}</span>
                </div>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{sub.school_name}</p>
                  <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {sub.student_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <Camera className="h-3 w-3" />
                      {sub.photo_count}
                    </span>
                    {sub.submitted_at && (
                      <span>{timeAgo(sub.submitted_at)}</span>
                    )}
                  </div>
                </div>
                {/* Status */}
                {statusStyle && (
                  <Badge
                    variant="outline"
                    className={`shrink-0 border-0 text-[10px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
                  >
                    {statusStyle.label}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
