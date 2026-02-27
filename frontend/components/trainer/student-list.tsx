"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTrainerStudents, useDeleteStudent } from "@/hooks/use-trainer-data";
import { AddStudentDialog } from "./add-student-dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import type { Student } from "@/lib/types";

// Modern gradient avatar colors based on first letter
const AVATAR_GRADIENTS: Record<string, string> = {
  A: "from-rose-400 to-pink-500",
  B: "from-orange-400 to-amber-500",
  C: "from-amber-400 to-yellow-500",
  D: "from-lime-400 to-green-500",
  E: "from-emerald-400 to-teal-500",
  F: "from-teal-400 to-cyan-500",
  G: "from-cyan-400 to-sky-500",
  H: "from-sky-400 to-blue-500",
  I: "from-blue-400 to-indigo-500",
  J: "from-indigo-400 to-violet-500",
  K: "from-violet-400 to-purple-500",
  L: "from-purple-400 to-fuchsia-500",
  M: "from-fuchsia-400 to-pink-500",
  N: "from-rose-400 to-red-500",
  O: "from-orange-400 to-red-500",
  P: "from-teal-400 to-emerald-500",
  Q: "from-blue-400 to-cyan-500",
  R: "from-indigo-400 to-blue-500",
  S: "from-violet-400 to-indigo-500",
  T: "from-pink-400 to-rose-500",
  U: "from-amber-400 to-orange-500",
  V: "from-green-400 to-emerald-500",
  W: "from-sky-400 to-indigo-500",
  X: "from-purple-400 to-violet-500",
  Y: "from-yellow-400 to-amber-500",
  Z: "from-red-400 to-rose-500",
};

function getAvatarGradient(name: string) {
  const letter = name.charAt(0).toUpperCase();
  return AVATAR_GRADIENTS[letter] || "from-gray-400 to-gray-500";
}

export function StudentList({ schoolId }: { schoolId?: string } = {}) {
  const { data: students, isLoading } = useTrainerStudents(schoolId);
  const deleteStudent = useDeleteStudent();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg bg-white" />
        ))}
      </div>
    );
  }

  const filtered = (students || []).filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (student: Student) => {
    if (!confirm(`Remove ${student.name}?`)) return;
    deleteStudent.mutate(student.id, {
      onSuccess: () => toast.success("Student removed"),
      onError: () => toast.error("Failed to remove student"),
    });
  };

  return (
    <div className="space-y-3">
      {/* Search & Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="h-10 rounded-xl border-[#E5E7EB] bg-white pl-10 text-sm"
          />
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setDialogOpen(true);
          }}
          size="sm"
          className="h-10 rounded-xl bg-[#0F4C4C] px-3.5 text-xs hover:bg-[#0F4C4C]/90"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {/* Summary line */}
      {students && students.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#9CA3AF]">
            {filtered.length} of {students.length} students
          </p>
          <p className="text-xs text-[#9CA3AF]">Class 9th</p>
        </div>
      )}

      {filtered.length === 0 ? (
        <Card className="border-dashed border-[#E5E7EB] bg-white">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6]">
              <Users className="h-7 w-7 text-[#9CA3AF]" />
            </div>
            <p className="font-medium text-[#1F2937]">
              {students?.length === 0 ? "No students added" : "No results found"}
            </p>
            <p className="mt-1 text-sm text-[#9CA3AF]">
              {students?.length === 0
                ? "Add students to track attendance"
                : "Try a different search term"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-[#F3F4F6] bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                <TableHead className="h-10 pl-4 text-xs font-semibold text-[#374151]">
                  Student
                </TableHead>
                <TableHead className="hidden h-10 text-xs font-semibold text-[#374151] sm:table-cell">
                  Group
                </TableHead>
                <TableHead className="hidden h-10 text-center text-xs font-semibold text-[#374151] md:table-cell">
                  Baseline
                </TableHead>
                <TableHead className="hidden h-10 text-center text-xs font-semibold text-[#374151] md:table-cell">
                  Endline
                </TableHead>
                <TableHead className="h-10 w-[80px] pr-4 text-right text-xs font-semibold text-[#374151]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow
                  key={student.id}
                  className="border-[#F3F4F6] transition-colors hover:bg-[#FAFAFA]"
                >
                  <TableCell className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(student.name)} text-[13px] font-bold text-white shadow-sm`}
                      >
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#111827]">
                          {student.name}
                        </p>
                        {/* Mobile-only subtext */}
                        <p className="truncate text-xs text-[#6B7280] sm:hidden">
                          {[
                            student.group_name,
                            student.baseline_marks != null && `B: ${student.baseline_marks}`,
                            student.endline_marks != null && `E: ${student.endline_marks}`,
                          ]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {student.group_name ? (
                      <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-medium text-[#4338CA]">
                        {student.group_name}
                      </span>
                    ) : (
                      <span className="text-sm text-[#D1D5DB]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    {student.baseline_marks != null ? (
                      <span className="inline-flex min-w-[36px] items-center justify-center rounded-md bg-[#FEF3C7] px-2 py-0.5 text-sm font-semibold text-[#92400E]">
                        {student.baseline_marks}
                      </span>
                    ) : (
                      <span className="text-sm text-[#D1D5DB]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-center md:table-cell">
                    {student.endline_marks != null ? (
                      <span className="inline-flex min-w-[36px] items-center justify-center rounded-md bg-[#ECFDF5] px-2 py-0.5 text-sm font-semibold text-[#065F46]">
                        {student.endline_marks}
                      </span>
                    ) : (
                      <span className="text-sm text-[#D1D5DB]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <div className="flex justify-end gap-0.5">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
                        onClick={() => {
                          setEditingStudent(student);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#D1D5DB] transition-colors hover:bg-red-50 hover:text-red-500"
                        onClick={() => handleDelete(student)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddStudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editingStudent}
      />
    </div>
  );
}
