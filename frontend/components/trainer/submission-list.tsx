"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerSubmissions } from "@/hooks/use-trainer-data";
import { SUBMISSION_STATUS_STYLES, getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export function SubmissionList() {
  const { data: submissions, isLoading } = useTrainerSubmissions();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No submissions yet. Start by submitting a session.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => {
        const dayTheme = getDayTheme(sub.day_number);
        const statusStyle = SUBMISSION_STATUS_STYLES[sub.status];

        return (
          <Card key={sub.id}>
            <CardContent className="px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">
                      {sub.school_name}
                    </p>
                    <Badge
                      variant="outline"
                      className={`${dayTheme.bgLight} ${dayTheme.textColor} ${dayTheme.borderColor}`}
                    >
                      {dayTheme.shortLabel}
                    </Badge>
                    {statusStyle && (
                      <Badge
                        variant="outline"
                        className={`${statusStyle.bg} ${statusStyle.text}`}
                      >
                        {statusStyle.label}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {sub.student_count} students · {sub.photo_count} photos ·{" "}
                    {sub.project_count} projects
                  </p>
                  {sub.submitted_at && (
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(sub.submitted_at)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
