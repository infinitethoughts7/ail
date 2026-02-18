"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHActivityFeed } from "@/hooks/use-uwh-data";
import { ACTIVITY_TYPE_LABELS } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { Activity, Clock } from "lucide-react";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  submission_verified: { bg: "bg-[#C9A84C]/5", text: "text-[#C9A84C]", border: "border-[#C9A84C]/15" },
  photo_approved: { bg: "bg-[#5C4A2E]/5", text: "text-[#5C4A2E]", border: "border-[#5C4A2E]/15" },
  project_approved: { bg: "bg-[#8B6914]/5", text: "text-[#8B6914]", border: "border-[#8B6914]/15" },
  project_featured: { bg: "bg-[#C9A84C]/5", text: "text-[#C9A84C]", border: "border-[#C9A84C]/15" },
};

const DEFAULT_TYPE_STYLE = { bg: "bg-[#F3F0E8]", text: "text-[#718096]", border: "border-[#EDE9E0]" };

export default function ActivityPage() {
  const { data: activities, isLoading } = useUWHActivityFeed();

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
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
        <p className="mt-1 text-sm text-[#718096]">
          A chronological record of program milestones and updates
        </p>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="uwh-card py-20 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <Activity className="mx-auto mb-3 h-12 w-12 text-[#EDE9E0]" />
          <p className="text-sm font-medium text-[#718096]">
            No activity to display yet.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-[18px] top-2 h-[calc(100%-16px)] w-[2px]"
            style={{ background: "var(--uwh-border-subtle)" }}
          />

          <div className="space-y-4">
            {activities.map((a) => {
              const typeStyle = TYPE_COLORS[a.activity_type] || DEFAULT_TYPE_STYLE;

              return (
                <div key={a.id} className="relative pl-12">
                  {/* Timeline dot */}
                  <div
                    className="absolute left-[11px] top-5 h-[16px] w-[16px] rounded-full border-[3px]"
                    style={{
                      borderColor: "var(--uwh-bg)",
                      background: a.activity_type.includes("featured") ? "#C9A84C" : "#0F1A2E",
                    }}
                  />

                  {/* Activity card */}
                  <div
                    className="uwh-card px-5 py-4"
                    style={{ border: "1px solid var(--uwh-border-card)" }}
                  >
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
                          <p className="text-sm font-medium text-[#0F1A2E]">{a.title}</p>
                          <div className="flex shrink-0 flex-col items-end gap-1.5">
                            <Badge
                              className={`rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}
                            >
                              {ACTIVITY_TYPE_LABELS[a.activity_type] ||
                                a.activity_type.replace(/_/g, " ")}
                            </Badge>
                            <span className="uwh-mono flex items-center gap-1 text-[11px] text-[#718096]">
                              <Clock className="h-3 w-3" />
                              {timeAgo(a.timestamp)}
                            </span>
                          </div>
                        </div>
                        {a.description && (
                          <p className="mt-1 text-xs leading-relaxed text-[#718096]">
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
