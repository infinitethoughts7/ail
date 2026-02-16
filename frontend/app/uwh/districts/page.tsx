"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUWHDistrictProgress } from "@/hooks/use-uwh-data";
import { MapPin } from "lucide-react";

export default function DistrictsPage() {
  const { data: districts, isLoading } = useUWHDistrictProgress();

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
        ))}
      </div>
    );
  }

  const total = districts?.reduce((sum, d) => sum + d.total_schools, 0) || 0;
  const completed = districts?.reduce((sum, d) => sum + d.completed, 0) || 0;
  const inProgress = districts?.reduce((sum, d) => sum + d.in_progress, 0) || 0;

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          District Progress
        </h1>
        <p className="mt-1 text-sm text-[#718096]">
          Which districts are on track? Which need attention?
        </p>
      </div>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-3 gap-4">
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-3xl font-bold text-[#0F1A2E]">{total}</p>
          <p className="uwh-label mt-1">Total Schools</p>
        </div>
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-3xl font-bold text-[#059669]">{completed}</p>
          <p className="uwh-label mt-1">Completed</p>
        </div>
        <div className="uwh-card px-5 py-5 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <p className="uwh-mono uwh-number-glow text-3xl font-bold text-[#2563EB]">{inProgress}</p>
          <p className="uwh-label mt-1">In Progress</p>
        </div>
      </div>

      {/* District Table */}
      {!districts?.length ? (
        <div className="uwh-card py-16 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <MapPin className="mx-auto mb-3 h-10 w-10 text-[#EDE9E0]" />
          <p className="text-sm text-[#718096]">No district data available yet.</p>
        </div>
      ) : (
        <div className="uwh-card overflow-hidden" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <div className="flex items-center gap-2 border-b px-5 py-4" style={{ borderColor: "var(--uwh-border-card)" }}>
            <MapPin className="h-4 w-4 text-[#C9A84C]" />
            <h2 className="uwh-heading text-base font-semibold">
              All Districts
            </h2>
            <span className="uwh-mono ml-1 text-sm text-[#718096]">({districts.length})</span>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "var(--uwh-border-subtle)" }}>
                  <TableHead className="uwh-label py-3">District</TableHead>
                  <TableHead className="uwh-label py-3 text-center">Total</TableHead>
                  <TableHead className="uwh-label py-3 text-center">Completed</TableHead>
                  <TableHead className="uwh-label py-3 text-center">In Progress</TableHead>
                  <TableHead className="uwh-label py-3 text-center">Remaining</TableHead>
                  <TableHead className="uwh-label py-3 w-[200px]">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {districts.map((d) => {
                  const pct =
                    d.total_schools > 0
                      ? Math.round((d.completed / d.total_schools) * 100)
                      : 0;
                  const remaining = Math.max(
                    0,
                    d.total_schools - d.completed - d.in_progress
                  );
                  return (
                    <TableRow key={d.id} className="hover:bg-[#F3F0E8]/50" style={{ borderColor: "var(--uwh-border-subtle)" }}>
                      <TableCell className="font-medium text-[#0F1A2E]">{d.name}</TableCell>
                      <TableCell className="uwh-mono text-center text-[#4A5568]">
                        {d.total_schools}
                      </TableCell>
                      <TableCell className="text-center">
                        {d.completed > 0 && (
                          <Badge className="uwh-mono rounded-md border-0 bg-[#059669]/10 px-2.5 text-[#059669]">
                            {d.completed}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {d.in_progress > 0 && (
                          <Badge className="uwh-mono rounded-md border-0 bg-[#2563EB]/10 px-2.5 text-[#2563EB]">
                            {d.in_progress}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {remaining > 0 && (
                          <Badge className="uwh-mono rounded-md border border-[#EDE9E0] bg-transparent px-2.5 text-[#718096]">
                            {remaining}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Progress value={pct} className="h-2 flex-1 rounded-full" />
                          <span className="uwh-mono w-12 text-right text-xs text-[#718096]">
                            {pct}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
