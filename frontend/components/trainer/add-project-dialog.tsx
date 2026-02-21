"use client";

import { useState, useRef } from "react";
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
import { Loader2, ImagePlus, X, Lightbulb } from "lucide-react";

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
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Add Student Idea
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">Submission *</Label>
            <Select value={submissionId} onValueChange={setSubmissionId}>
              <SelectTrigger className="h-12 rounded-xl text-sm">
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
            <Label className="mb-2 block text-sm font-medium">Student Name *</Label>
            <Input
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
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
                value={studentAge}
                onChange={(e) => setStudentAge(e.target.value)}
                placeholder="e.g. 14"
                min={3}
                max={25}
                className="h-12 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="mb-2 block text-sm font-medium">Grade</Label>
              <Input
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
                placeholder="e.g. 9th"
                className="h-12 rounded-xl text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Project Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did they build?"
              required
              className="h-12 rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Description *</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project idea..."
              rows={3}
              required
              className="rounded-xl text-sm"
            />
          </div>
          <div>
            <Label className="mb-2 block text-sm font-medium">Image</Label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-28 w-28 rounded-2xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                    if (imageRef.current) imageRef.current.value = "";
                  }}
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => imageRef.current?.click()}
                className="flex h-28 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/20 text-sm text-muted-foreground transition-colors active:bg-muted/50"
              >
                <ImagePlus className="h-5 w-5" />
                <span>Upload Image</span>
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
              disabled={addProject.isPending}
              className="h-12 flex-1 rounded-xl bg-[#0F4C4C] hover:bg-[#0F4C4C]/90"
            >
              {addProject.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  Add Idea
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
