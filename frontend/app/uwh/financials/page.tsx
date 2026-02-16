"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHSummary } from "@/hooks/use-uwh-data";
import { DollarSign } from "lucide-react";

export default function FinancialsPage() {
  const { data: summary, isLoading } = useUWHSummary();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const financial = summary?.financial_summary || {};
  const hasData = Object.keys(financial).length > 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Financial Overview</h1>
        <p className="text-sm text-muted-foreground">
          Where is our money going? Budget allocation and spending.
        </p>
      </div>

      {!hasData ? (
        <Card>
          <CardContent className="py-16 text-center">
            <DollarSign className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              Financial data not yet available
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Swinfy will prepare financial summaries as the program progresses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Render financial_summary keys as cards */}
          {Object.entries(financial).map(([key, value]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-sm font-semibold capitalize">
                  {key.replace(/_/g, " ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeof value === "object" && value !== null ? (
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {Object.entries(value as Record<string, unknown>).map(
                      ([subKey, subValue]) => (
                        <div
                          key={subKey}
                          className="rounded-lg border p-3"
                        >
                          <p className="text-xs capitalize text-muted-foreground">
                            {subKey.replace(/_/g, " ")}
                          </p>
                          <p className="text-lg font-bold">
                            {typeof subValue === "number"
                              ? subValue.toLocaleString()
                              : String(subValue)}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-2xl font-bold">
                    {typeof value === "number"
                      ? value.toLocaleString()
                      : String(value)}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Summary stats from KPIs for context */}
          {summary?.kpis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">
                  Program Scale (for context)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {summary.kpis.total_schools}
                    </p>
                    <p className="text-xs text-muted-foreground">Schools</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {summary.kpis.total_students_trained}
                    </p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {summary.kpis.total_sessions}
                    </p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-2xl font-bold">
                      {summary.kpis.total_districts}
                    </p>
                    <p className="text-xs text-muted-foreground">Districts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
