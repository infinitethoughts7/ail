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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSchoolDetail, useUpdateSchool } from "@/hooks/use-swinfy-data";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SchoolEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string | null;
}

export function SchoolEditDialog({
  open,
  onOpenChange,
  schoolId,
}: SchoolEditDialogProps) {
  const { data: school, isLoading } = useSchoolDetail(open ? schoolId : null);
  const update = useUpdateSchool();

  const [form, setForm] = useState({
    poc_name: "",
    poc_designation: "",
    poc_phone: "",
    principal_name: "",
    principal_phone: "",
    map_url: "",
    total_students: 0,
    total_days: 4,
    status: "not_started" as string,
  });

  useEffect(() => {
    if (school) {
      setForm({
        poc_name: school.poc_name || "",
        poc_designation: school.poc_designation || "",
        poc_phone: school.poc_phone || "",
        principal_name: school.principal_name || "",
        principal_phone: school.principal_phone || "",
        map_url: school.map_url || "",
        total_students: school.total_students || 0,
        total_days: school.total_days || 4,
        status: school.status || "not_started",
      });
    }
  }, [school]);

  const handleSubmit = () => {
    if (!schoolId) return;
    update.mutate(
      { id: schoolId, ...form },
      {
        onSuccess: () => {
          toast.success(`${school?.name || "School"} updated`);
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to update school"),
      }
    );
  };

  const set = (key: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit School{school ? ` — ${school.name}` : ""}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs font-medium">POC Name</Label>
                <Input
                  value={form.poc_name}
                  onChange={(e) => set("poc_name", e.target.value)}
                  placeholder="Point of contact name"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium">POC Designation</Label>
                <Input
                  value={form.poc_designation}
                  onChange={(e) => set("poc_designation", e.target.value)}
                  placeholder="e.g. Librarian"
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-medium">POC Phone</Label>
              <Input
                value={form.poc_phone}
                onChange={(e) => set("poc_phone", e.target.value)}
                placeholder="Phone number"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Principal Name</Label>
                <Input
                  value={form.principal_name}
                  onChange={(e) => set("principal_name", e.target.value)}
                  placeholder="Principal name"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Principal Phone</Label>
                <Input
                  value={form.principal_phone}
                  onChange={(e) => set("principal_phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs font-medium">Google Maps URL</Label>
              <Input
                value={form.map_url}
                onChange={(e) => set("map_url", e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Students</Label>
                <Input
                  type="number"
                  value={form.total_students}
                  onChange={(e) => set("total_students", parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Total Days</Label>
                <Input
                  type="number"
                  value={form.total_days}
                  onChange={(e) => set("total_days", parseInt(e.target.value) || 4)}
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-xs font-medium">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_started">Not Started</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={update.isPending}
              className="w-full"
            >
              {update.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
