"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="p-6 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  const total = districts?.reduce((sum, d) => sum + d.total_schools, 0) || 0;
  const completed = districts?.reduce((sum, d) => sum + d.completed, 0) || 0;
  const inProgress = districts?.reduce((sum, d) => sum + d.in_progress, 0) || 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">District Progress</h1>
        <p className="text-sm text-muted-foreground">
          Which districts are on track? Which are behind?
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="px-4 py-3 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Total Schools</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">{completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="px-4 py-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* District Table */}
      {!districts?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No district data available yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4" />
              All Districts ({districts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>District</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Completed</TableHead>
                  <TableHead className="text-center">In Progress</TableHead>
                  <TableHead className="text-center">Remaining</TableHead>
                  <TableHead className="w-[200px]">Progress</TableHead>
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
                    <TableRow key={d.id}>
                      <TableCell className="font-medium">{d.name}</TableCell>
                      <TableCell className="text-center">
                        {d.total_schools}
                      </TableCell>
                      <TableCell className="text-center">
                        {d.completed > 0 && (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {d.completed}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {d.in_progress > 0 && (
                          <Badge className="bg-blue-100 text-blue-800">
                            {d.in_progress}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {remaining > 0 && (
                          <Badge variant="outline">{remaining}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-2 flex-1" />
                          <span className="w-10 text-right text-xs text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
