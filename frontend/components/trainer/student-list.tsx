"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerStudents, useDeleteStudent } from "@/hooks/use-trainer-data";
import { AddStudentDialog } from "./add-student-dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, User, Users, ArrowRight } from "lucide-react";
import type { Student } from "@/lib/types";

export function StudentList() {
  const { data: students, isLoading } = useTrainerStudents();
  const deleteStudent = useDeleteStudent();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] rounded-2xl" />
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
    <div className="space-y-4">
      {/* Search & Add */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="h-11 rounded-xl pl-10 text-sm"
          />
        </div>
        <Button
          onClick={() => {
            setEditingStudent(null);
            setDialogOpen(true);
          }}
          className="h-11 rounded-xl bg-[#0F4C4C] px-4 hover:bg-[#0F4C4C]/90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Count */}
      {students && students.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {filtered.length} of {students.length} students
        </p>
      )}

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">
              {students?.length === 0 ? "No students added" : "No results found"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {students?.length === 0
                ? "Add students to track attendance"
                : "Try a different search term"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((student, index) => (
            <Card
              key={student.id}
              className="border-0 shadow-sm transition-all active:scale-[0.99]"
            >
              <CardContent className="flex items-center gap-3 p-3">
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C4C]/10 to-[#2DD4A8]/10">
                  <span className="text-sm font-bold text-[#0F4C4C]">
                    {student.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{student.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[
                      student.grade && `Grade ${student.grade}`,
                      student.age && `Age ${student.age}`,
                      student.parent_name,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No details added"}
                  </p>
                </div>
                {/* Actions */}
                <div className="flex shrink-0 gap-1">
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-muted"
                    onClick={() => {
                      setEditingStudent(student);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors active:bg-red-50 active:text-red-600"
                    onClick={() => handleDelete(student)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
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
