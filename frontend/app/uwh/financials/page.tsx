"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUWHSummary } from "@/hooks/use-uwh-data";
import { DollarSign } from "lucide-react";

export default function FinancialsPage() {
  const { data: summary, isLoading } = useUWHSummary();

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8">
        <Skeleton className="h-64 rounded-xl bg-[#F3F4F6]" />
      </div>
    );
  }

  const financial = summary?.financial_summary || {};
  const hasData = Object.keys(financial).length > 0;

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Financial Overview
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Budget allocation, spending, and financial transparency
        </p>
      </div>

      {!hasData ? (
        <div className="uwh-card py-20 text-center">
          <DollarSign className="mx-auto mb-3 h-12 w-12 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#9CA3AF]">
            Financial data not yet available
          </p>
          <p className="mt-2 text-xs text-[#9CA3AF]">
            Financial summaries will appear as the program progresses.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(financial).map(([key, value]) => (
            <div
              key={key}
              className="uwh-card overflow-hidden"
            >
              <div className="border-b border-[#E5E7EB] px-5 py-4">
                <h2 className="uwh-heading text-base font-semibold capitalize">
                  {key.replace(/_/g, " ")}
                </h2>
              </div>
              <div className="p-5">
                {typeof value === "object" && value !== null ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {Object.entries(value as Record<string, unknown>).map(
                      ([subKey, subValue]) => (
                        <div
                          key={subKey}
                          className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4"
                        >
                          <p className="uwh-label">{subKey.replace(/_/g, " ")}</p>
                          <p className="uwh-mono mt-1.5 text-2xl font-bold text-[#1F2937]">
                            {typeof subValue === "number"
                              ? subValue.toLocaleString()
                              : String(subValue)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="uwh-mono text-3xl font-bold text-[#1F2937]">
                    {typeof value === "number"
                      ? value.toLocaleString()
                      : String(value)}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Program Scale Context */}
          {summary?.kpis && (
            <div className="uwh-card overflow-hidden">
              <div className="border-b border-[#E5E7EB] px-5 py-4">
                <h2 className="uwh-heading text-base font-semibold">
                  Program Scale
                </h2>
                <p className="mt-0.5 text-xs text-[#9CA3AF]">For financial context</p>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { label: "Schools", value: summary.kpis.total_schools },
                    { label: "Students", value: summary.kpis.total_students_trained },
                    { label: "Sessions", value: summary.kpis.total_sessions },
                    { label: "Districts", value: summary.kpis.total_districts },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] p-4 text-center"
                    >
                      <p className="uwh-mono uwh-number-glow text-2xl font-bold text-[#1F2937]">
                        {item.value}
                      </p>
                      <p className="uwh-label mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
