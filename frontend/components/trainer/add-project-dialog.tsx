"use client";

import { useState, useRef, useMemo } from "react";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddProject,
  useTrainerGroups,
  useTrainerStudents,
} from "@/hooks/use-trainer-data";
import { toast } from "sonner";
import {
  Loader2,
  ImagePlus,
  X,
  Lightbulb,
  Globe,
  Music,
  Video,
  Image as ImageIcon,
  Upload,
  Users,
  User,
} from "lucide-react";
import type { ProjectType } from "@/lib/types";

const PROJECT_TYPES: { value: ProjectType; label: string; icon: React.ReactNode }[] = [
  { value: "website_link", label: "Website", icon: <Globe className="h-4 w-4" /> },
  { value: "image", label: "Image", icon: <ImageIcon className="h-4 w-4" /> },
  { value: "music", label: "Music", icon: <Music className="h-4 w-4" /> },
  { value: "video", label: "Video", icon: <Video className="h-4 w-4" /> },
];

interface AddProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProjectDialog({
  open,
  onOpenChange,
}: AddProjectDialogProps) {
  const { data: groups } = useTrainerGroups();
  const { data: students } = useTrainerStudents();
  const addProject = useAddProject();
  const imageRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  const [projectType, setProjectType] = useState<ProjectType>("image");
  // "student:<id>" or "group:<id>" — identifies what's selected
  const [creatorKey, setCreatorKey] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");

  // Derive student_name, group from the creatorKey selection
  const selection = useMemo(() => {
    if (!creatorKey) return null;
    const [type, id] = creatorKey.split(":");
    if (type === "group") {
      const group = groups?.find((g) => g.id === id);
      if (group) return { kind: "group" as const, group, studentName: group.name };
    }
    if (type === "student") {
      const student = students?.find((s) => s.id === id);
      if (student) return { kind: "student" as const, student, studentName: student.name };
    }
    return null;
  }, [creatorKey, groups, students]);

  const reset = () => {
    setProjectType("image");
    setCreatorKey("");
    setTitle("");
    setDescription("");
    setImage(null);
    setImagePreview(null);
    setMediaFile(null);
    setWebsiteUrl("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection || !title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (projectType === "website_link" && !websiteUrl.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    const formData = new FormData();
    formData.append("student_name", selection.studentName);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("project_type", projectType);

    if (selection.kind === "group") { 
      formData.append("group", selection.group.id);
    }

    if (image) formData.append("image", image);
    if (mediaFile) formData.append("media_file", mediaFile);
    if (websiteUrl.trim()) formData.append("website_url", websiteUrl.trim());

    addProject.mutate(formData, {
      onSuccess: () => {
        toast.success("Project added!");
        reset();
        onOpenChange(false);
      },
      onError: () => toast.error("Failed to add project"),
    });
  };

  const mediaAccept = projectType === "music" ? "audio/*" : "video/*";

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
            Add Project
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Type */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Project Type *
            </Label>
            <div className="grid grid-cols-4 gap-1.5">
              {PROJECT_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setProjectType(pt.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 px-1.5 py-2.5 text-[10px] font-medium transition-all ${
                    projectType === pt.value
                      ? "border-[#0F4C4C] bg-[#0F4C4C]/5 text-[#0F4C4C]"
                      : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {pt.icon}
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Student / Team Dropdown */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Student / Team *
            </Label>
            <Select value={creatorKey} onValueChange={setCreatorKey}>
              <SelectTrigger className="h-12 rounded-xl text-sm">
                <SelectValue placeholder="Select student or team..." />
              </SelectTrigger>
              <SelectContent>
                {/* Groups */}
                {groups && groups.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-1.5 text-xs">
                      <Users className="h-3 w-3" /> Teams
                    </SelectLabel>
                    {groups.map((g) => (
                      <SelectItem key={`group:${g.id}`} value={`group:${g.id}`}>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3 w-3 text-[#0F4C4C]" />
                          {g.name}
                          <span className="text-muted-foreground">
                            ({g.members.length})
                          </span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {/* Individual Students */}
                {students && students.length > 0 && (
                  <SelectGroup>
                    <SelectLabel className="flex items-center gap-1.5 text-xs">
                      <User className="h-3 w-3" /> Students
                    </SelectLabel>
                    {students.map((s) => (
                      <SelectItem key={`student:${s.id}`} value={`student:${s.id}`}>
                        <span className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted-foreground" />
                          {s.name}
                          {s.grade && (
                            <span className="text-muted-foreground">
                              Grade {s.grade}
                            </span>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>

            {/* Show group members when a group is selected */}
            {selection?.kind === "group" && selection.group.members.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {selection.group.members.map((m) => (
                  <span
                    key={m.id}
                    className="inline-flex items-center rounded-full bg-[#0F4C4C]/10 px-2 py-0.5 text-[10px] font-medium text-[#0F4C4C]"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            )}

            {/* Show student details when a student is selected */}
            {selection?.kind === "student" && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {[
                  selection.student.grade && `Grade ${selection.student.grade}`,
                  selection.student.age && `Age ${selection.student.age}`,
                  selection.student.group_name && `Group: ${selection.student.group_name}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Project Title *
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What did they build?"
              required
              className="h-12 rounded-xl text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Description *
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the project..."
              rows={3}
              required
              className="rounded-xl text-sm"
            />
          </div>

          {/* Conditional upload based on type */}
          {projectType === "image" && (
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
          )}

          {projectType === "website_link" && (
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Website URL *
              </Label>
              <Input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                required
                className="h-12 rounded-xl text-sm"
              />
            </div>
          )}

          {(projectType === "music" || projectType === "video") && (
            <div>
              <Label className="mb-2 block text-sm font-medium">
                Upload {projectType === "music" ? "Music" : "Video"} File
              </Label>
              {mediaFile ? (
                <div className="flex items-center gap-2 rounded-xl border bg-muted/50 px-3 py-2.5">
                  <Upload className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate text-sm">{mediaFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaFile(null);
                      if (mediaRef.current) mediaRef.current.value = "";
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => mediaRef.current?.click()}
                  className="flex h-28 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/20 text-sm text-muted-foreground transition-colors active:bg-muted/50"
                >
                  <Upload className="h-5 w-5" />
                  <span>Upload {projectType === "music" ? "Music" : "Video"}</span>
                </button>
              )}
              <input
                ref={mediaRef}
                type="file"
                accept={mediaAccept}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setMediaFile(file);
                }}
                className="hidden"
              />
            </div>
          )}

          {/* Submit */}
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
                  Add Project
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
