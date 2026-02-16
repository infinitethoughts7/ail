"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CURRICULUM_DAYS } from "@/lib/constants";

export function UWHCurriculumTimeline() {
  return (
    <Card>
      <CardContent className="px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {CURRICULUM_DAYS.map((day, i) => (
            <div key={day.day} className="flex items-center">
              <div
                className={`flex flex-col items-center rounded-xl border-2 px-4 py-3 transition-all ${day.borderColor} ${day.bgLight} min-w-[120px]`}
              >
                <span className={`text-lg font-bold ${day.textColor}`}>
                  {day.shortLabel}
                </span>
                <span className="mt-0.5 text-center text-[10px] text-muted-foreground">
                  {day.label.split(": ")[1]}
                </span>
              </div>
              {i < CURRICULUM_DAYS.length - 1 && (
                <div className="mx-1 h-0.5 w-6 bg-border" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
