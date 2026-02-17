"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrainerStudents, useDeleteStudent } from "@/hooks/use-trainer-data";
import { AddStudentDialog } from "./add-student-dialog";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash2, User } from "lucide-react";
import type { Student } from "@/lib/types";

export function StudentList() {
  const { data: students, isLoading } = useTrainerStudents();
  const deleteStudent = useDeleteStudent();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
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
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="pl-9"
          />
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditingStudent(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {students?.length === 0
              ? "No students added yet. Add your first student."
              : "No students match your search."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((student) => (
            <Card key={student.id}>
              <CardContent className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{student.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      student.grade && `Grade ${student.grade}`,
                      student.age && `Age ${student.age}`,
                      student.parent_name && student.parent_name,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "No details"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      setEditingStudent(student);
                      setDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(student)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
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
