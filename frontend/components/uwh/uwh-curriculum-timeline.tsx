"use client";

import { CURRICULUM_DAYS } from "@/lib/constants";

export function UWHCurriculumTimeline() {
  return (
    <div
      className="uwh-card overflow-hidden"
      style={{ border: "1px solid var(--uwh-border-card)" }}
    >
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {CURRICULUM_DAYS.map((day, i) => (
            <div key={day.day} className="flex items-center">
              <div
                className="flex min-w-[130px] flex-col items-center rounded-2xl border px-5 py-4 transition-all hover:-translate-y-0.5"
                style={{
                  background: day.bgHex,
                  borderColor: `${day.hex}20`,
                }}
              >
                <span
                  className="uwh-heading text-lg font-bold"
                  style={{ color: day.hex }}
                >
                  {day.shortLabel}
                </span>
                <span className="mt-1 text-center text-[11px] text-[#718096]">
                  {day.label.split(": ")[1]}
                </span>
              </div>
              {i < CURRICULUM_DAYS.length - 1 && (
                <div
                  className="mx-2 h-[2px] w-8"
                  style={{ background: "var(--uwh-border-subtle)" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
