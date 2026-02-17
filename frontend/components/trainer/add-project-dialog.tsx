"use client";

import { useState } from "react";
import { useRef } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useTrainerSubmissions,
  useAddProject,
} from "@/hooks/use-trainer-data";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectDialog({
  open,
  onOpenChange,
}: AddProjectDialogProps) {
  const { data: submissions } = useTrainerSubmissions();
  const addProject = useAddProject();
  const imageRef = useRef<HTMLInputElement>(null);

  const [submissionId, setSubmissionId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentAge, setStudentAge] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const reset = () => {
    setSubmissionId("");
    setStudentName("");
    setStudentAge("");
    setStudentGrade("");
    setTitle("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId || !studentName.trim() || !title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const formData = new FormData();
    formData.append("student_name", studentName.trim());
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    if (studentAge) formData.append("student_age", studentAge);
    if (studentGrade) formData.append("student_grade", studentGrade.trim());
    if (image) formData.append("image", image);

    addProject.mutate(
      { submissionId, formData },
      {
        onSuccess: () => {
          toast.success("Project idea added!");
          reset();
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to add project"),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) reset();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Student Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label className="mb-1.5 block text-sm">Submission *</Label>
            <Select value={submissionId} onValueChange={setSubmissionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a submission" />
              </SelectTrigger>
              <SelectContent>
                {submissions?.map((sub) => (
                  <SelectItem key={sub.id} value={sub.id}>
                    {sub.school_name} — Day {sub.day_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Student Name *</Label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Student name"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block text-sm">Age</Label>
              <Input
                type="number"
                value={studentAge}
                onChange={(e) => setStudentAge(e.target.value)}
                placeholder="e.g. 14"
                min={3}
                max={25}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Grade</Label>
              <Input
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                placeholder="e.g. 9th"
              />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Project Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did they build?"
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project idea..."
              rows={3}
              required
            />
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">Image</Label>
            {imagePreview ? (
              <div className="relative w-fit">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    if (imageRef.current) imageRef.current.value = "";
                  }}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-black/60 p-1 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/40"
              >
                <Upload className="h-4 w-4" />
                Upload Image
              </button>
            )}
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setImage(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className="hidden"
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
            <Button type="submit" disabled={addProject.isPending}>
              {addProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
