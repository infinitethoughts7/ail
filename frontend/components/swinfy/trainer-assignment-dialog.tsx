"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSwinfyTrainers, useSchools, useAssignTrainer } from "@/hooks/use-swinfy-data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface TrainerAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TrainerAssignmentDialog({
  open,
  onOpenChange,
}: TrainerAssignmentDialogProps) {
  const { data: trainers } = useSwinfyTrainers();
  const { data: schools } = useSchools();
  const assign = useAssignTrainer();

  const [trainerId, setTrainerId] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [role, setRole] = useState("primary");

  const handleSubmit = () => {
    if (!trainerId || !schoolId) {
      toast.error("Please select both a trainer and a school");
      return;
    }
    assign.mutate(
      { trainer: trainerId, school: schoolId, role },
      {
        onSuccess: () => {
          toast.success("Trainer assigned to school");
          onOpenChange(false);
          setTrainerId("");
          setSchoolId("");
          setRole("primary");
        },
        onError: (err) => {
          const message =
            (err as { response?: { data?: { detail?: string } } })?.response
              ?.data?.detail || "Failed to assign trainer";
          toast.error(message);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Trainer to School</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label className="mb-2 block text-sm font-medium">Trainer</Label>
            <Select value={trainerId} onValueChange={setTrainerId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers?.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.full_name} ({t.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">School</Label>
            <Select value={schoolId} onValueChange={setSchoolId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {schools?.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.district_name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block text-sm font-medium">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={assign.isPending || !trainerId || !schoolId}
            className="w-full"
          >
            {assign.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning...
              </span>
            ) : (
              "Assign Trainer"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
