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
import { useCreateGroup, useUpdateGroup } from "@/hooks/use-trainer-data";
import { toast } from "sonner";
import { Loader2, Users, Save } from "lucide-react";
import type { StudentGroup } from "@/lib/types";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: StudentGroup | null;
}

export function CreateGroupDialog({
  open,
  onOpenChange,
  group,
}: CreateGroupDialogProps) {
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const isEditing = !!group;

  const [name, setName] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
    } else {
      setName("");
    }
  }, [group, open]);

  const isPending = createGroup.isPending || updateGroup.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Group name is required");
      return;
    }

    if (isEditing && group) {
      updateGroup.mutate(
        { id: group.id, name: name.trim() },
        {
          onSuccess: () => {
            toast.success("Group updated");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to update group"),
        }
      );
    } else {
      createGroup.mutate(
        { name: name.trim() },
        {
          onSuccess: () => {
            toast.success("Group created");
            onOpenChange(false);
          },
          onError: () => toast.error("Failed to create group. Name may already exist."),
        }
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-[#0F4C4C]" />
            {isEditing ? "Rename Group" : "Create Group"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Group Name *
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team Alpha, Group 1..."
              required
              autoFocus
              className="h-12 rounded-xl text-sm"
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
                  <Users className="h-4 w-4" />
                  Create Group
                </span>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
