"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHActivityFeed } from "@/hooks/use-uwh-data";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Activity, Clock } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  submission_verified: { bg: "bg-[#7C3AED]/5", text: "text-[#7C3AED]", border: "border-[#7C3AED]/15" },
  photo_approved: { bg: "bg-[#4B5563]/5", text: "text-[#4B5563]", border: "border-[#4B5563]/15" },
  project_approved: { bg: "bg-[#2563EB]/5", text: "text-[#2563EB]", border: "border-[#2563EB]/15" },
  project_featured: { bg: "bg-[#7C3AED]/5", text: "text-[#7C3AED]", border: "border-[#7C3AED]/15" },
};

const DEFAULT_TYPE_STYLE = { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#E5E7EB]" };

export default function ActivityPage() {
  const { data: activities, isLoading } = useUWHActivityFeed();

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl bg-[#F3F4F6]" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Activity Timeline
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          A chronological record of program milestones and updates
        </p>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="uwh-card py-20 text-center">
          <Activity className="mx-auto mb-3 h-12 w-12 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#9CA3AF]">
            No activity to display yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[18px] top-2 h-[calc(100%-16px)] w-[2px] bg-[#E5E7EB]"
          />

          <div className="space-y-4">
            {activities.map((a) => {
              const typeStyle = TYPE_COLORS[a.activity_type] || DEFAULT_TYPE_STYLE;

              return (
                <div key={a.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[11px] top-5 h-[16px] w-[16px] rounded-full border-[3px] border-white"
                    style={{
                      background: a.activity_type.includes("featured") ? "#7C3AED" : "#4B5563",
                    }}
                  />

                  {/* Activity card */}
                  <div className="uwh-card px-5 py-4">
                    <div className="flex items-start gap-4">
                      {a.thumbnail_url && (
                        <img
                          src={a.thumbnail_url}
                          alt=""
                          className="h-14 w-14 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm font-medium text-[#1F2937]">{a.title}</p>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <Badge
                              className={`rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                            >
                              {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                                a.activity_type.replace(/_/g, " ")}
                            </Badge>
                            <span className="uwh-mono flex items-center gap-1 text-[11px] text-[#9CA3AF]">
                              <Clock className="h-3 w-3" />
                              {timeAgo(a.timestamp)}
                            </span>
                          </div>
                        </div>
                        {a.description && (
                          <p className="mt-1 text-xs leading-relaxed text-[#9CA3AF]">
                            {a.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
