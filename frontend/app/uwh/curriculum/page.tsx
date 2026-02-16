"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CURRICULUM_DAYS, getDayTheme } from "@/lib/constants";
import type { Curriculum } from "@/lib/types";
import { BookOpen, Target, Zap } from "lucide-react";

export default function CurriculumPage() {
  const { data: curriculum, isLoading } = useQuery<Curriculum[]>({
    queryKey: ["curriculum"],
    queryFn: () => api.get("/api/dashboard/curriculum/").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Curriculum Journey</h1>
        <p className="text-sm text-muted-foreground">
          What exactly are students learning across the 4-day program?
        </p>
      </div>

      {/* Visual Timeline */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CURRICULUM_DAYS.map((day, i) => (
          <div key={day.day} className="flex items-center">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${day.color} text-lg font-bold text-white`}
            >
              {day.day}
            </div>
            {i < CURRICULUM_DAYS.length - 1 && (
              <div className="h-0.5 w-8 bg-border" />
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
            <Card
              key={dayConfig.day}
              className={`border-2 ${theme.borderColor}`}
            >
              <CardHeader className={`${theme.bgLight}`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${theme.color} font-bold text-white`}
                  >
                    {dayConfig.day}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {dayData?.title || dayConfig.label}
                    </CardTitle>
                    {dayData?.description && (
                      <p className="text-sm text-muted-foreground">
                        {dayData.description}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              {dayData && (
                <CardContent className="pt-4">
                  <div className="grid gap-6 sm:grid-cols-2">
                    {/* Learning Objectives */}
                    {dayData.learning_objectives.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          Learning Objectives
                        </div>
                        <ul className="space-y-1.5">
                          {dayData.learning_objectives.map((obj, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <span
                                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${theme.color}`}
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
                        <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                          <Zap className="h-4 w-4 text-muted-foreground" />
                          Activities
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {dayData.activities.map((act, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={`${theme.bgLight} ${theme.textColor}`}
                            >
                              {act}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}

              {!dayData && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Curriculum details not yet available.
                  </p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
