"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useVerifySubmission,
  useFlagSubmission,
  useRejectSubmission,
} from "@/hooks/use-swinfy-data";
import type { SubmissionListItem } from "@/lib/types";
import { SUBMISSION_STATUS_STYLES, getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";
import { Eye, Check, Flag, X } from "lucide-react";

interface Props {
  submissions: SubmissionListItem[];
  onViewDetail: (id: string) => void;
}

export function VerificationQueue({ submissions, onViewDetail }: Props) {
  const [reasonTarget, setReasonTarget] = useState<string | null>(null);
  const [reasonType, setReasonType] = useState<"flag" | "reject">("flag");
  const [reason, setReason] = useState("");

  const verify = useVerifySubmission();
  const flag = useFlagSubmission();
  const reject = useRejectSubmission();

  const handleVerify = (id: string) => {
    verify.mutate(
      { id },
      {
        onSuccess: () => toast.success("Submission verified"),
        onError: () => toast.error("Failed to verify"),
      }
    );
  };

  const handleReasonSubmit = () => {
    if (!reasonTarget || !reason.trim()) return;
    const mutation = reasonType === "flag" ? flag : reject;
    mutation.mutate(
      { id: reasonTarget, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success(
            reasonType === "flag" ? "Submission flagged" : "Submission rejected"
          );
          setReasonTarget(null);
          setReason("");
        },
        onError: () => toast.error("Action failed"),
      }
    );
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No submissions found.
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
            <CardContent className="px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold sm:text-base">
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
                  <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {sub.trainer_name} · {sub.student_count} students ·{" "}
                    {sub.photo_count} photos · {sub.project_count} projects
                  </p>
                  {sub.submitted_at && (
                    <p className="text-[11px] text-muted-foreground">
                      {timeAgo(sub.submitted_at)}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetail(sub.id)}
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    View
                  </Button>
                  {sub.status === "submitted" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerify(sub.id)}
                        disabled={verify.isPending}
                        className="bg-emerald-600 text-white hover:bg-emerald-700"
                      >
                        <Check className="mr-1 h-3 w-3" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-orange-400 text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          setReasonTarget(sub.id);
                          setReasonType("flag");
                          setReason("");
                        }}
                      >
                        <Flag className="mr-1 h-3 w-3" />
                        Flag
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-400 text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setReasonTarget(sub.id);
                          setReasonType("reject");
                          setReason("");
                        }}
                      >
                        <X className="mr-1 h-3 w-3" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {reasonTarget === sub.id && (
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder={`Enter ${reasonType} reason...`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleReasonSubmit();
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleReasonSubmit}
                    disabled={!reason.trim() || flag.isPending || reject.isPending}
                  >
                    Submit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReasonTarget(null)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
