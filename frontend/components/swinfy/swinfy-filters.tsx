"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDistricts, useSchools, useSwinfyTrainers } from "@/hooks/use-swinfy-data";
import { CURRICULUM_DAYS } from "@/lib/constants";

interface SwinfyFiltersProps {
  district?: string;
  school?: string;
  trainer?: string;
  day?: string;
  onDistrictChange?: (value: string) => void;
  onSchoolChange?: (value: string) => void;
  onTrainerChange?: (value: string) => void;
  onDayChange?: (value: string) => void;
  showDistrict?: boolean;
  showSchool?: boolean;
  showTrainer?: boolean;
  showDay?: boolean;
}

export function SwinfyFilters({
  district,
  school,
  trainer,
  day,
  onDistrictChange,
  onSchoolChange,
  onTrainerChange,
  onDayChange,
  showDistrict = true,
  showSchool = true,
  showTrainer = true,
  showDay = true,
}: SwinfyFiltersProps) {
  const { data: districts } = useDistricts();
  const { data: schools } = useSchools(district || undefined);
  const { data: trainers } = useSwinfyTrainers();

  const handleDistrictChange = (value: string) => {
    const v = value === "all" ? "" : value;
    onDistrictChange?.(v);
    // Reset school when district changes
    onSchoolChange?.("");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {showDistrict && (
        <Select value={district || "all"} onValueChange={handleDistrictChange}>
          <SelectTrigger size="sm" className="min-w-[140px]">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {districts?.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showSchool && (
        <Select
          value={school || "all"}
          onValueChange={(v) => onSchoolChange?.(v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className="min-w-[140px]">
            <SelectValue placeholder="All Schools" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Schools</SelectItem>
            {schools?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showTrainer && (
        <Select
          value={trainer || "all"}
          onValueChange={(v) => onTrainerChange?.(v === "all" ? "" : v)}
        >
          <SelectTrigger size="sm" className="min-w-[140px]">
            <SelectValue placeholder="All Trainers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Trainers</SelectItem>
            {trainers?.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {showDay && (
        <Select
          value={day || "all"}
          onValueChange={(v) => onDayChange?.(v === "all" ? "" : v)}
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
      )}
    </div>
  );
}
