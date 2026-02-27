"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  useSchools,
  useDistricts,
  useUnassignTrainer,
} from "@/hooks/use-swinfy-data";
import { SchoolEditDialog } from "@/components/swinfy/school-edit-dialog";
import { TrainerAssignmentDialog } from "@/components/swinfy/trainer-assignment-dialog";
import { toast } from "sonner";
import {
  Building2,
  Users,
  Pencil,
  Plus,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string; icon: typeof Clock }
> = {
  not_started: {
    label: "Not Started",
    className: "bg-gray-100 text-gray-700",
    icon: AlertCircle,
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
};

const ROLE_BADGE: Record<string, string> = {
  primary: "bg-indigo-100 text-indigo-700",
  secondary: "bg-orange-100 text-orange-700",
};

export default function SwinfySchoolsPage() {
  const [districtId, setDistrictId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editSchoolId, setEditSchoolId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignSchoolId, setAssignSchoolId] = useState<string | undefined>();
  const [assignSchoolName, setAssignSchoolName] = useState<string | undefined>();
  const { data: districts } = useDistricts();
  const { data: schools, isLoading } = useSchools(districtId || undefined);
  const unassign = useUnassignTrainer();

  const handleEdit = (schoolId: string) => {
    setEditSchoolId(schoolId);
    setEditDialogOpen(true);
  };

  const handleAssignToSchool = (schoolId: string, schoolName: string) => {
    setAssignSchoolId(schoolId);
    setAssignSchoolName(schoolName);
    setAssignDialogOpen(true);
  };

  const handleAssignGeneral = () => {
    setAssignSchoolId(undefined);
    setAssignSchoolName(undefined);
    setAssignDialogOpen(true);
  };

  const handleUnassign = (
    assignmentId: string,
    trainerName: string,
    schoolName: string
  ) => {
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

  const filtered = statusFilter
    ? schools?.filter((s) => s.status === statusFilter)
    : schools;
  const completedCount =
    schools?.filter((s) => s.status === "completed").length || 0;
  const pendingCount = (schools?.length || 0) - completedCount;
  const noTrainerCount =
    schools?.filter((s) => s.trainers_list.length === 0).length || 0;
  const totalStudents =
    schools?.reduce((sum, s) => sum + s.total_students, 0) || 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-xl font-bold sm:text-2xl">Schools</h1>
          <Badge variant="secondary" className="ml-1">
            {schools?.length || 0}
          </Badge>
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button onClick={handleAssignGeneral} size="sm" className="h-9">
            <Plus className="mr-1 h-4 w-4" />
            Assign Trainer
          </Button>
          <Select
            value={statusFilter || "all"}
            onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
          >
            <SelectTrigger size="sm" className="min-w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="not_started">Not Started</SelectItem>
            </SelectContent>
          </Select>
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
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">
              {completedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">No Trainer</p>
            <p className="text-2xl font-bold text-red-500">{noTrainerCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>
      </div>

      {/* Schools table */}
      <Card>
        <CardContent className="p-0">
          {!filtered || filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No schools found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">#</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Trainers</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((school, idx) => {
                    const statusCfg =
                      STATUS_CONFIG[school.status] || STATUS_CONFIG.not_started;
                    return (
                      <TableRow key={school.id}>
                        <TableCell className="text-center text-xs text-muted-foreground">
                          {idx + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                              <Building2 className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="font-medium text-sm">
                              {school.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {school.district_name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {school.trainers_list.map((t) => {
                              const roleCls =
                                ROLE_BADGE[t.role] || ROLE_BADGE.primary;
                              return (
                                <div
                                  key={t.assignment_id}
                                  className="flex items-center gap-1.5"
                                >
                                  <Users className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span className="text-sm">{t.name}</span>
                                  <Badge
                                    className={`text-[10px] px-1.5 py-0 ${roleCls}`}
                                  >
                                    {t.role}
                                  </Badge>
                                  <button
                                    onClick={() =>
                                      handleUnassign(
                                        t.assignment_id,
                                        t.name,
                                        school.name
                                      )
                                    }
                                    className="ml-0.5 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-100 hover:text-red-600"
                                    title={`Remove ${t.name}`}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              );
                            })}
                            {school.trainers_list.length < 2 && (
                              <button
                                onClick={() =>
                                  handleAssignToSchool(school.id, school.name)
                                }
                                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                                Add trainer
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {school.total_students}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`text-[10px] ${statusCfg.className}`}
                          >
                            {statusCfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(school.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SchoolEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        schoolId={editSchoolId}
      />

      <TrainerAssignmentDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        preSelectedSchoolId={assignSchoolId}
        preSelectedSchoolName={assignSchoolName}
      />
    </div>
  );
}
