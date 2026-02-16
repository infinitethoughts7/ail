"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerSubmissions, useSchools, useTrainerSummary } from "@/hooks/use-trainer-data";
import { SUBMISSION_STATUS_STYLES, getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";

export function SubmissionList() {
  const { data: submissions, isLoading } = useTrainerSubmissions();
  const { data: summary } = useTrainerSummary();
  const { data: schools } = useSchools();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Assigned Schools", value: summary.assigned_schools },
            { label: "Submissions", value: summary.submissions_count },
            { label: "Verified", value: summary.verified_count },
            {
              label: "Flagged",
              value: summary.flagged_count,
              warn: summary.flagged_count > 0,
            },
          ].map((k) => (
            <Card key={k.label}>
              <CardContent className="px-3 py-3">
                <p className="text-[11px] text-muted-foreground">{k.label}</p>
                <p
                  className={`text-xl font-bold ${
                    k.warn ? "text-orange-600" : ""
                  }`}
                >
                  {k.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submissions */}
      {!submissions || submissions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No submissions yet. Start by submitting a session.
          </CardContent>
        </Card>
      ) : (
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
      )}

      {/* Schools */}
      {schools && schools.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold">
            Assigned Schools ({schools.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {schools.map((school) => (
              <Card key={school.id}>
                <CardContent className="px-4 py-3">
                  <p className="text-sm font-semibold">{school.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {school.district_name} · {school.total_students} students ·{" "}
                    {school.total_days} days
                  </p>
                  <Badge
                    variant="outline"
                    className={`mt-1.5 text-[10px] ${
                      school.status === "completed"
                        ? "bg-emerald-100 text-emerald-800"
                        : school.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {school.status.replace(/_/g, " ")}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
