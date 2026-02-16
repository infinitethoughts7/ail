"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CURRICULUM_DAYS, getDayTheme } from "@/lib/constants";
import type { Curriculum } from "@/lib/types";
import { Target, Zap } from "lucide-react";

export default function CurriculumPage() {
  const { data: curriculum, isLoading } = useQuery<Curriculum[]>({
    queryKey: ["curriculum"],
    queryFn: () => api.get("/api/dashboard/curriculum/").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
        ))}
      </div>
    );
  }

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Curriculum Journey
        </h1>
        <p className="mt-1 text-sm text-[#718096]">
          The complete 4-day AI Literacy learning path
        </p>
      </div>

      {/* Visual Timeline */}
      <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2">
        {CURRICULUM_DAYS.map((day, i) => (
          <div key={day.day} className="flex items-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg"
              style={{ background: day.hex, boxShadow: `0 4px 14px ${day.hex}30` }}
            >
              {day.day}
            </div>
            {i < CURRICULUM_DAYS.length - 1 && (
              <div className="h-[2px] w-10" style={{ background: "var(--uwh-border-subtle)" }} />
            )}
          </div>
        ))}
      </div>

      {/* Day Cards */}
      <div className="space-y-6">
        {CURRICULUM_DAYS.map((dayConfig) => {
          const dayData = curriculum?.find(
            (c) => c.day_number === dayConfig.day
          );
          const theme = getDayTheme(dayConfig.day);

          return (
            <div
              key={dayConfig.day}
              className="uwh-card overflow-hidden"
              style={{ border: `2px solid ${theme.hex}15` }}
            >
              {/* Day header */}
              <div
                className="flex items-center gap-4 px-6 py-5"
                style={{ background: theme.bgHex }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl font-bold text-white"
                  style={{ background: theme.hex, boxShadow: `0 4px 12px ${theme.hex}25` }}
                >
                  {dayConfig.day}
                </div>
                <div>
                  <h2 className="uwh-heading text-lg font-semibold">
                    {dayData?.title || dayConfig.label}
                  </h2>
                  {dayData?.description && (
                    <p className="mt-0.5 text-sm text-[#718096]">
                      {dayData.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Day content */}
              {dayData ? (
                <div className="px-6 py-5">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Learning Objectives */}
                    {dayData.learning_objectives.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4" style={{ color: theme.hex }} />
                          <span className="uwh-label" style={{ color: theme.hex }}>
                            Learning Objectives
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {dayData.learning_objectives.map((obj, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-sm text-[#4A5568]"
                            >
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                                style={{ background: theme.hex }}
                              />
                              {obj}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Activities */}
                    {dayData.activities.length > 0 && (
                      <div>
                        <div className="mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" style={{ color: theme.hex }} />
                          <span className="uwh-label" style={{ color: theme.hex }}>
                            Activities
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {dayData.activities.map((act, i) => (
                            <Badge
                              key={i}
                              className="rounded-lg border px-3 py-1.5 text-xs font-medium"
                              style={{
                                background: theme.bgHex,
                                color: theme.hex,
                                borderColor: `${theme.hex}20`,
                              }}
                            >
                              {act}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-[#718096]">
                    Curriculum details not yet available.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
