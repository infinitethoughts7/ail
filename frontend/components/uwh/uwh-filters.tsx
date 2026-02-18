"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDistricts, useSchools } from "@/hooks/use-swinfy-data";
import { Filter } from "lucide-react";

interface UWHFiltersProps {
  district: string;
  school: string;
  onDistrictChange: (value: string) => void;
  onSchoolChange: (value: string) => void;
}

export function UWHFilters({
  district,
  school,
  onDistrictChange,
  onSchoolChange,
}: UWHFiltersProps) {
  const { data: districts } = useDistricts();
  const { data: schools } = useSchools(district || undefined);

  const handleDistrictChange = (value: string) => {
    const v = value === "all" ? "" : value;
    onDistrictChange(v);
    onSchoolChange("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-[#718096]">
        <Filter className="h-3.5 w-3.5" />
        <span className="uwh-label">Filter</span>
      </div>

      <Select value={district || "all"} onValueChange={handleDistrictChange}>
        <SelectTrigger
          size="sm"
          className="min-w-[160px] rounded-lg border-[#EDE9E0] bg-white text-sm"
        >
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

      <Select
        value={school || "all"}
        onValueChange={(v) => onSchoolChange(v === "all" ? "" : v)}
      >
        <SelectTrigger
          size="sm"
          className="min-w-[160px] rounded-lg border-[#EDE9E0] bg-white text-sm"
        >
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
    </div>
  );
}
