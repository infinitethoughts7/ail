"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Button } from "@/components/ui/button";
import { useSchools, useDistricts } from "@/hooks/use-swinfy-data";
import { SchoolEditDialog } from "@/components/swinfy/school-edit-dialog";
import { Building2, Users, Pencil } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  not_started: { label: "Not Started", className: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", className: "bg-emerald-100 text-emerald-700" },
};

export default function SwinfySchoolsPage() {
  const [districtId, setDistrictId] = useState("");
  const [editSchoolId, setEditSchoolId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { data: districts } = useDistricts();
  const { data: schools, isLoading } = useSchools(districtId || undefined);

  const handleEdit = (schoolId: string) => {
    setEditSchoolId(schoolId);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const completedCount = schools?.filter((s) => s.status === "completed").length || 0;
  const inProgressCount = schools?.filter((s) => s.status === "in_progress").length || 0;
  const totalStudents = schools?.reduce((sum, s) => sum + s.total_students, 0) || 0;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-xl font-bold sm:text-2xl">Schools</h1>
        <Badge variant="secondary" className="ml-1">
          {schools?.length || 0}
        </Badge>
        <div className="ml-auto">
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
            <p className="text-xs text-muted-foreground">Total Schools</p>
            <p className="text-2xl font-bold">{schools?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{inProgressCount}</p>
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
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            All Schools
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!schools || schools.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No schools found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>District</TableHead>
                    <TableHead>Trainers</TableHead>
                    <TableHead className="text-center">Students</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => {
                    const badge = STATUS_BADGE[school.status] || STATUS_BADGE.not_started;
                    return (
                      <TableRow key={school.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100">
                              <Building2 className="h-4 w-4 text-indigo-600" />
                            </div>
                            <span className="font-medium text-sm">{school.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {school.district_name}
                        </TableCell>
                        <TableCell>
                          {school.trainers_list.length > 0 ? (
                            <div className="space-y-0.5">
                              {school.trainers_list.map((t) => (
                                <div key={t.id} className="flex items-center gap-1.5">
                                  <Users className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm">{t.name}</span>
                                  <Badge className="text-[9px] px-1 py-0 bg-gray-100 text-gray-600">
                                    {t.role}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No trainers
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {school.total_students}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`text-[10px] ${badge.className}`}>
                            {badge.label}
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
    </div>
  );
}
