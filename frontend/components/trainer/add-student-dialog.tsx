"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddStudent, useUpdateStudent } from "@/hooks/use-trainer-data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Student } from "@/lib/types";

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student | null;
}

export function AddStudentDialog({
  open,
  onOpenChange,
  student,
}: AddStudentDialogProps) {
  const addStudent = useAddStudent();
  const updateStudent = useUpdateStudent();
  const isEditing = !!student;

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (student) {
      setName(student.name);
      setAge(student.age?.toString() || "");
      setGrade(student.grade);
      setParentName(student.parent_name);
      setParentPhone(student.parent_phone);
      setNotes(student.notes);
    } else {
      setName("");
      setAge("");
      setGrade("");
      setParentName("");
      setParentPhone("");
      setNotes("");
    }
  }, [student, open]);

  const isPending = addStudent.isPending || updateStudent.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Student name is required");
      return;
    }

    const data: Record<string, string> = {
      name: name.trim(),
      grade: grade.trim(),
      parent_name: parentName.trim(),
      parent_phone: parentPhone.trim(),
      notes: notes.trim(),
    };
    if (age) data.age = age;

    if (isEditing && student) {
      updateStudent.mutate(
        { id: student.id, data },
        {
          onSuccess: () => {
            toast.success("Student updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update student"),
        }
      );
    } else {
      addStudent.mutate(data, {
        onSuccess: () => {
          toast.success("Student added");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to add student"),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Student" : "Add Student"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-sm">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-sm">Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 12"
                min={3}
                max={25}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Grade</Label>
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 8th"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Parent Name</Label>
            <Input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Parent / guardian name"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Parent Phone</Label>
            <Input
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Save"
              ) : (
                "Add Student"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
