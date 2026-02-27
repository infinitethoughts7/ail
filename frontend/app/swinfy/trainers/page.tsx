"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  useSwinfyTrainers,
  useDistricts,
  useUnassignTrainer,
} from "@/hooks/use-swinfy-data";
import { TrainerAssignmentDialog } from "@/components/swinfy/trainer-assignment-dialog";
import { toast } from "sonner";
import { Users, School, Plus, X } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
};

const ROLE_BADGE: Record<string, string> = {
  primary: "bg-indigo-100 text-indigo-700",
  secondary: "bg-orange-100 text-orange-700",
};

export default function TrainerTrackerPage() {
  const [districtId, setDistrictId] = useState("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const { data: districts } = useDistricts();
  const { data: trainers, isLoading } = useSwinfyTrainers(districtId || undefined);
  const unassign = useUnassignTrainer();

  const handleUnassign = (assignmentId: string, trainerName: string, schoolName: string) => {
    if (!confirm(`Remove ${trainerName} from ${schoolName}?`)) return;
    unassign.mutate(assignmentId, {
      onSuccess: () => toast.success(`${trainerName} removed from ${schoolName}`),
      onError: () => toast.error("Failed to unassign trainer"),
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const assigned = trainers?.filter((t) => t.schools.length > 0) || [];
  const unassigned = trainers?.filter((t) => t.schools.length === 0) || [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold sm:text-2xl">Trainers</h1>
        <Badge variant="secondary" className="ml-1">
          {trainers?.length || 0}
        </Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button
            onClick={() => setAssignDialogOpen(true)}
            size="sm"
            className="h-9"
          >
            <Plus className="mr-1 h-4 w-4" />
            Assign Trainer
          </Button>
          <Select
            value={districtId || "all"}
            onValueChange={(v) => setDistrictId(v === "all" ? "" : v)}
          >
            <SelectTrigger size="sm" className="min-w-[160px]">
              <SelectValue placeholder="All Districts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts?.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Trainers</p>
            <p className="text-2xl font-bold">{trainers?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Assigned</p>
            <p className="text-2xl font-bold">{assigned.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Unassigned</p>
            <p className="text-2xl font-bold">{unassigned.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Schools Covered</p>
            <p className="text-2xl font-bold">
              {assigned.reduce((sum, t) => sum + t.schools.length, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trainers table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            All Trainers & School Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!trainers || trainers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No trainers found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trainer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead className="text-center">Submissions</TableHead>
                    <TableHead className="text-center">Verified</TableHead>
                    <TableHead className="text-center">Pending</TableHead>
                    <TableHead className="text-center">Flagged</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            {t.profile_photo_url && (
                              <AvatarImage src={t.profile_photo_url} />
                            )}
                            <AvatarFallback className="text-xs">
                              {(t.first_name?.[0] || t.email[0]).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{t.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {t.email}
                      </TableCell>
                      <TableCell>
                        {t.schools.length > 0 ? (
                          <div className="space-y-1">
                            {t.schools.map((s) => {
                              const badge = STATUS_BADGE[s.status] || STATUS_BADGE.not_started;
                              const roleBadge = ROLE_BADGE[s.role] || ROLE_BADGE.primary;
                              return (
                                <div key={s.assignment_id} className="flex items-center gap-1.5">
                                  <School className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  <span className="text-sm">{s.name}</span>
                                  <Badge className={`text-[10px] px-1.5 py-0 ${badge.className}`}>
                                    {badge.label}
                                  </Badge>
                                  <Badge className={`text-[10px] px-1.5 py-0 ${roleBadge}`}>
                                    {s.role}
                                  </Badge>
                                  <button
                                    onClick={() => handleUnassign(s.assignment_id, t.full_name, s.name)}
                                    className="ml-1 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                                    title="Unassign"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            Not assigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.total_submissions || "\u2014"}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.verified_submissions > 0 ? (
                          <Badge className="bg-emerald-100 text-emerald-800">
                            {t.verified_submissions}
                          </Badge>
                        ) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.pending_submissions > 0 ? (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            {t.pending_submissions}
                          </Badge>
                        ) : "\u2014"}
                      </TableCell>
                      <TableCell className="text-center">
                        {t.flagged_submissions > 0 ? (
                          <Badge className="bg-orange-100 text-orange-800">
                            {t.flagged_submissions}
                          </Badge>
                        ) : "\u2014"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TrainerAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
      />
    </div>
  );
}
