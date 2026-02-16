"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveProject,
  useRejectProject,
  useFeatureProject,
  useEditProjectForUWH,
} from "@/hooks/use-swinfy-data";
import type { ProjectHighlight } from "@/lib/types";
import { toast } from "sonner";
import { Check, X, Star, Pencil } from "lucide-react";

interface Props {
  projects: ProjectHighlight[];
}

export function ProjectApprovalList({ projects }: Props) {
  const [editTarget, setEditTarget] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const approve = useApproveProject();
  const reject = useRejectProject();
  const feature = useFeatureProject();
  const editForUWH = useEditProjectForUWH();

  const startEdit = (proj: ProjectHighlight) => {
    setEditTarget(proj.id);
    setEditDesc(proj.uwh_description || proj.description);
    setEditNotes(proj.swinfy_notes || "");
  };

  const submitEdit = () => {
    if (!editTarget) return;
    editForUWH.mutate(
      { id: editTarget, description: editDesc, notes: editNotes },
      {
        onSuccess: () => {
          toast.success("Project updated for UWH");
          setEditTarget(null);
        },
        onError: () => toast.error("Update failed"),
      }
    );
  };

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No pending projects to review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {projects.map((proj) => (
        <Card key={proj.id}>
          <CardContent className="px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold sm:text-base">
                    {proj.title}
                  </p>
                  <Badge variant="outline" className="text-[10px]">
                    {proj.approval_status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {proj.student_name}
                  {proj.student_grade && ` · Grade ${proj.student_grade}`}
                  {proj.student_age && ` · Age ${proj.student_age}`}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {proj.description}
                </p>
                {proj.image_url && (
                  <img
                    src={proj.image_url}
                    alt={proj.title}
                    className="mt-2 h-32 w-auto rounded-lg object-cover"
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    approve.mutate(proj.id, {
                      onSuccess: () => toast.success("Project approved"),
                    })
                  }
                  disabled={approve.isPending}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Check className="mr-1 h-3 w-3" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    feature.mutate(proj.id, {
                      onSuccess: () => toast.success("Project featured"),
                    })
                  }
                  disabled={feature.isPending}
                >
                  <Star className="mr-1 h-3 w-3" />
                  Feature
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(proj)}
                >
                  <Pencil className="mr-1 h-3 w-3" />
                  Edit for UWH
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-600"
                  onClick={() =>
                    reject.mutate(
                      { id: proj.id },
                      { onSuccess: () => toast.success("Project rejected") }
                    )
                  }
                  disabled={reject.isPending}
                >
                  <X className="mr-1 h-3 w-3" />
                  Reject
                </Button>
              </div>
            </div>

            {/* Edit for UWH */}
            {editTarget === proj.id && (
              <div className="mt-4 space-y-3 rounded-lg border bg-muted/50 p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    UWH Description
                  </label>
                  <Textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Swinfy Notes
                  </label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={2}
                    placeholder="Internal notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={submitEdit}
                    disabled={editForUWH.isPending}
                  >
                    Save Changes
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditTarget(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
