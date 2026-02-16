"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useSwinfySubmissionDetail } from "@/hooks/use-swinfy-data";
import { SUBMISSION_STATUS_STYLES, getDayTheme } from "@/lib/constants";

interface Props {
  submissionId: string | null;
  onClose: () => void;
}

export function SubmissionDetailModal({ submissionId, onClose }: Props) {
  const { data: detail, isLoading } = useSwinfySubmissionDetail(submissionId);

  return (
    <Sheet open={!!submissionId} onOpenChange={() => onClose()}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Submission Detail</SheetTitle>
        </SheetHeader>

        <ScrollArea className="mt-4 h-[calc(100vh-8rem)] pr-4">
          {isLoading || !detail ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">{detail.school_name}</h3>
                  <Badge
                    variant="outline"
                    className={`${getDayTheme(detail.day_number).bgLight} ${getDayTheme(detail.day_number).textColor}`}
                  >
                    Day {detail.day_number}
                  </Badge>
                  {SUBMISSION_STATUS_STYLES[detail.status] && (
                    <Badge
                      variant="outline"
                      className={`${SUBMISSION_STATUS_STYLES[detail.status].bg} ${SUBMISSION_STATUS_STYLES[detail.status].text}`}
                    >
                      {SUBMISSION_STATUS_STYLES[detail.status].label}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Trainer: {detail.trainer_name} · {detail.student_count} students
                </p>
              </div>

              <Separator />

              {/* Topics */}
              {detail.topics_covered.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Topics Covered</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {detail.topics_covered.map((topic, i) => (
                      <Badge key={i} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {detail.trainer_notes && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Trainer Notes</h4>
                  <p className="text-sm text-muted-foreground">
                    {detail.trainer_notes}
                  </p>
                </div>
              )}

              {detail.challenges && (
                <div>
                  <h4 className="mb-1 text-sm font-semibold">Challenges</h4>
                  <p className="text-sm text-muted-foreground">
                    {detail.challenges}
                  </p>
                </div>
              )}

              {/* Flag/Rejection reasons */}
              {detail.flag_reason && (
                <div className="rounded-lg border border-orange-300 bg-orange-50 p-3">
                  <h4 className="text-sm font-semibold text-orange-800">
                    Flag Reason
                  </h4>
                  <p className="text-sm text-orange-700">{detail.flag_reason}</p>
                </div>
              )}

              {detail.rejection_reason && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3">
                  <h4 className="text-sm font-semibold text-red-800">
                    Rejection Reason
                  </h4>
                  <p className="text-sm text-red-700">
                    {detail.rejection_reason}
                  </p>
                </div>
              )}

              <Separator />

              {/* Photos */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">
                  Photos ({detail.photos.length})
                </h4>
                {detail.photos.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No photos.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {detail.photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="overflow-hidden rounded-lg border"
                      >
                        <img
                          src={photo.image_url}
                          alt={photo.caption || "Session photo"}
                          className="aspect-square w-full object-cover"
                        />
                        <div className="flex items-center justify-between p-1.5">
                          <span className="truncate text-[10px] text-muted-foreground">
                            {photo.caption || "No caption"}
                          </span>
                          <Badge variant="outline" className="text-[10px]">
                            {photo.approval_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Projects */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">
                  Projects ({detail.project_highlights.length})
                </h4>
                {detail.project_highlights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No projects.</p>
                ) : (
                  <div className="space-y-3">
                    {detail.project_highlights.map((proj) => (
                      <div key={proj.id} className="rounded-lg border p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-semibold">{proj.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {proj.student_name}
                              {proj.student_grade && ` · Grade ${proj.student_grade}`}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {proj.approval_status}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
