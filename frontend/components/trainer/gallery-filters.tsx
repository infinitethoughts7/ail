"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRICULUM_DAYS } from "@/lib/constants";

interface GalleryFiltersProps {
  status: string;
  day: string;
  onStatusChange: (value: string) => void;
  onDayChange: (value: string) => void;
}

export function GalleryFilters({
  status,
  day,
  onStatusChange,
  onDayChange,
}: GalleryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={status || "all"}
        onValueChange={(v) => onStatusChange(v === "all" ? "" : v)}
      >
        <SelectTrigger size="sm" className="min-w-[120px]">
          <SelectValue placeholder="All Statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="approved">Approved</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={day || "all"}
        onValueChange={(v) => onDayChange(v === "all" ? "" : v)}
      >
        <SelectTrigger size="sm" className="min-w-[100px]">
          <SelectValue placeholder="All Days" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Days</SelectItem>
          {CURRICULUM_DAYS.map((d) => (
            <SelectItem key={d.day} value={String(d.day)}>
              {d.shortLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
