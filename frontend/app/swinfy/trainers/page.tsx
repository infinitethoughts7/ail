"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useSwinfySubmissions } from "@/hooks/use-swinfy-data";
import { Users } from "lucide-react";

export default function TrainerTrackerPage() {
  const { data: allSubmissions, isLoading } = useSwinfySubmissions();

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  // Aggregate by trainer
  const trainerMap = new Map<
    string,
    {
      name: string;
      total: number;
      verified: number;
      flagged: number;
      rejected: number;
      pending: number;
      schools: Set<string>;
    }
  >();

  (allSubmissions || []).forEach((sub) => {
    const key = sub.trainer;
    if (!trainerMap.has(key)) {
      trainerMap.set(key, {
        name: sub.trainer_name,
        total: 0,
        verified: 0,
        flagged: 0,
        rejected: 0,
        pending: 0,
        schools: new Set(),
      });
    }
    const t = trainerMap.get(key)!;
    t.total++;
    t.schools.add(sub.school);
    if (sub.status === "verified") t.verified++;
    else if (sub.status === "flagged") t.flagged++;
    else if (sub.status === "rejected") t.rejected++;
    else if (sub.status === "submitted") t.pending++;
  });

  const trainers = Array.from(trainerMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold sm:text-2xl">Trainer Performance</h1>
      </div>

      {trainers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No trainer data available yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {trainers.length} Trainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainer</TableHead>
                  <TableHead className="text-center">Schools</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Verified</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Flagged</TableHead>
                  <TableHead className="text-center">Rejected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainers.map((t) => (
                  <TableRow key={t.name}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell className="text-center">
                      {t.schools.size}
                    </TableCell>
                    <TableCell className="text-center">{t.total}</TableCell>
                    <TableCell className="text-center">
                      {t.verified > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {t.verified}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {t.pending > 0 && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {t.pending}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {t.flagged > 0 && (
                        <Badge className="bg-orange-100 text-orange-800">
                          {t.flagged}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {t.rejected > 0 && (
                        <Badge className="bg-red-100 text-red-800">
                          {t.rejected}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
