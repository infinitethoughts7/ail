"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddStudent, useUpdateStudent } from "@/hooks/use-trainer-data";
import { toast } from "sonner";
import { Loader2, UserPlus, Save } from "lucide-react";
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
  const [baselineMarks, setBaselineMarks] = useState("");
  const [endlineMarks, setEndlineMarks] = useState("");

  useEffect(() => {
    if (student) {
      setName(student.name);
      setAge(student.age?.toString() || "");
      setGrade(student.grade);
      setParentName(student.parent_name);
      setParentPhone(student.parent_phone);
      setNotes(student.notes);
      setBaselineMarks(student.baseline_marks?.toString() || "");
      setEndlineMarks(student.endline_marks?.toString() || "");
    } else {
      setName("");
      setAge("");
      setGrade("");
      setParentName("");
      setParentPhone("");
      setNotes("");
      setBaselineMarks("");
      setEndlineMarks("");
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
    if (baselineMarks) data.baseline_marks = baselineMarks;
    if (endlineMarks) data.endline_marks = endlineMarks;

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
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">
            {isEditing ? "Edit Student" : "Add Student"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Student name"
              required
              className="h-12 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block text-sm font-medium">Age</Label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 12"
                min={3}
                max={25}
                className="h-12 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">Grade</Label>
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="e.g. 8th"
                className="h-12 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-2 block text-sm font-medium">Baseline Marks</Label>
              <Input
                type="number"
                value={baselineMarks}
                onChange={(e) => setBaselineMarks(e.target.value)}
                placeholder="e.g. 7"
                min={0}
                max={10}
                className="h-12 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">Endline Marks</Label>
              <Input
                type="number"
                value={endlineMarks}
                onChange={(e) => setEndlineMarks(e.target.value)}
                placeholder="e.g. 9"
                min={0}
                max={10}
                className="h-12 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Parent Name</Label>
            <Input
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Parent / guardian name"
              className="h-12 rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Parent Phone</Label>
            <Input
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="Phone number"
              className="h-12 rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={2}
              className="rounded-xl text-sm"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-12 flex-1 rounded-xl bg-[#0F4C4C] hover:bg-[#0F4C4C]/90"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <span className="flex items-center gap-1.5">
                  <Save className="h-4 w-4" />
                  Save
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
