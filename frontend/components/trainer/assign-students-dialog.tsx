"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useTrainerStudents,
  useAssignStudentsToGroup,
} from "@/hooks/use-trainer-data";
import { toast } from "sonner";
import { Loader2, Search, UserPlus } from "lucide-react";
import type { StudentGroup } from "@/lib/types";

interface AssignStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: StudentGroup;
}

export function AssignStudentsDialog({
  open,
  onOpenChange,
  group,
}: AssignStudentsDialogProps) {
  const { data: allStudents } = useTrainerStudents();
  const assignStudents = useAssignStudentsToGroup();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  // Show students not already in this group
  const available = useMemo(() => {
    const memberIds = new Set(group.members.map((m) => m.id));
    return (allStudents || []).filter(
      (s) =>
        !memberIds.has(s.id) &&
        (!s.group || s.group === null) &&
        s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allStudents, group.members, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAssign = () => {
    if (selected.size === 0) return;
    assignStudents.mutate(
      { groupId: group.id, studentIds: Array.from(selected) },
      {
        onSuccess: (data) => {
          toast.success(`${data.assigned} student(s) assigned`);
          setSelected(new Set());
          setSearch("");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to assign students"),
      }
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) {
          setSelected(new Set());
          setSearch("");
        }
        onOpenChange(val);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-t-3xl sm:rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <UserPlus className="h-4 w-4 text-[#0F4C4C]" />
            Add to {group.name}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ungrouped students..."
            className="h-10 rounded-xl pl-9 text-sm"
          />
        </div>

        {available.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No ungrouped students available
          </p>
        ) : (
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {available.map((student) => (
              <label
                key={student.id}
                className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={selected.has(student.id)}
                  onCheckedChange={() => toggle(student.id)}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{student.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {[student.grade && `Grade ${student.grade}`, student.age && `Age ${student.age}`]
                      .filter(Boolean)
                      .join(" · ") || "No details"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 flex-1 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={selected.size === 0 || assignStudents.isPending}
            className="h-11 flex-1 rounded-xl bg-[#0F4C4C] hover:bg-[#0F4C4C]/90"
          >
            {assignStudents.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              `Add ${selected.size || ""} Student${selected.size !== 1 ? "s" : ""}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
