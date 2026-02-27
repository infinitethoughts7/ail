"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useTrainerGroups,
  useDeleteGroup,
  useRemoveStudentsFromGroup,
} from "@/hooks/use-trainer-data";
import { CreateGroupDialog } from "./create-group-dialog";
import { AssignStudentsDialog } from "./assign-students-dialog";
import { toast } from "sonner";
import {
  Plus,
  Users,
  Pencil,
  Trash2,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { StudentGroup } from "@/lib/types";

export function GroupManagement({ schoolId }: { schoolId?: string } = {}) {
  const { data: groups, isLoading } = useTrainerGroups(schoolId);
  const deleteGroup = useDeleteGroup();
  const removeStudents = useRemoveStudentsFromGroup();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<StudentGroup | null>(null);
  const [assignGroup, setAssignGroup] = useState<StudentGroup | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (group: StudentGroup) => {
    if (!confirm(`Delete "${group.name}"? Students will be ungrouped.`)) return;
    deleteGroup.mutate(group.id, {
      onSuccess: () => toast.success("Group deleted"),
      onError: () => toast.error("Failed to delete group"),
    });
  };

  const handleRemoveStudent = (group: StudentGroup, studentId: string, studentName: string) => {
    if (!confirm(`Remove ${studentName} from ${group.name}?`)) return;
    removeStudents.mutate(
      { groupId: group.id, studentIds: [studentId] },
      {
        onSuccess: () => toast.success(`${studentName} removed from group`),
        onError: () => toast.error("Failed to remove student"),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {groups?.length || 0} group{groups?.length !== 1 ? "s" : ""}
        </p>
        <Button
          onClick={() => {
            setEditingGroup(null);
            setDialogOpen(true);
          }}
          className="h-9 rounded-xl bg-[#0F4C4C] px-3 text-xs hover:bg-[#0F4C4C]/90"
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          New Group
        </Button>
      </div>

      {!groups || groups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-medium">No groups yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create groups and assign students to them
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {groups.map((group) => {
            const isExpanded = expanded.has(group.id);
            return (
              <Card
                key={group.id}
                className="border-0 shadow-sm overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Group Header */}
                  <div className="flex items-center gap-3 p-3">
                    <button
                      onClick={() => toggleExpand(group.id)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0F4C4C]/10 to-[#2DD4A8]/10"
                    >
                      <Users className="h-4.5 w-4.5 text-[#0F4C4C]" />
                    </button>
                    <button
                      onClick={() => toggleExpand(group.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold">
                          {group.name}
                        </p>
                        <Badge
                          variant="outline"
                          className="border-0 bg-muted text-[10px] font-medium"
                        >
                          {group.members.length} member{group.members.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#0F4C4C] transition-colors active:bg-[#0F4C4C]/10"
                        onClick={() => setAssignGroup(group)}
                        title="Add students"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors active:bg-muted"
                        onClick={() => {
                          setEditingGroup(group);
                          setDialogOpen(true);
                        }}
                        title="Rename"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 transition-colors active:bg-red-50 active:text-red-600"
                        onClick={() => handleDelete(group)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground"
                        onClick={() => toggleExpand(group.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Members List */}
                  {isExpanded && (
                    <div className="border-t bg-muted/30 px-3 py-2">
                      {group.members.length === 0 ? (
                        <p className="py-3 text-center text-xs text-muted-foreground">
                          No members yet.{" "}
                          <button
                            className="text-[#0F4C4C] underline"
                            onClick={() => setAssignGroup(group)}
                          >
                            Add students
                          </button>
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {group.members.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5"
                            >
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#0F4C4C] shadow-sm">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium">
                                  {member.name}
                                </p>
                                {member.grade && (
                                  <p className="text-[10px] text-muted-foreground">
                                    Grade {member.grade}
                                  </p>
                                )}
                              </div>
                              <button
                                className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-red-500"
                                onClick={() =>
                                  handleRemoveStudent(group, member.id, member.name)
                                }
                                title="Remove from group"
                              >
                                <UserMinus className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CreateGroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
      />

      {assignGroup && (
        <AssignStudentsDialog
          open={!!assignGroup}
          onOpenChange={(val) => {
            if (!val) setAssignGroup(null);
          }}
          group={assignGroup}
        />
      )}
    </div>
  );
}
