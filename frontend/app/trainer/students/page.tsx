"use client";

import { useState } from "react";
import { StudentList } from "@/components/trainer/student-list";
import { GroupManagement } from "@/components/trainer/group-management";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTrainerProfile } from "@/hooks/use-trainer-data";
import { Users, Layers } from "lucide-react";

export default function TrainerStudentsPage() {
  const { data: profile } = useTrainerProfile();
  const assignedSchools = profile?.assigned_schools || [];
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");

  const schoolId = assignedSchools.length > 1 ? selectedSchoolId || undefined : undefined;

  return (
    <div>
      <TrainerHeader title="Students" />
      <div className="p-4">
        {assignedSchools.length > 1 && (
          <div className="mb-4">
            <Select
              value={selectedSchoolId || "all"}
              onValueChange={(v) => setSelectedSchoolId(v === "all" ? "" : v)}
            >
              <SelectTrigger className="h-10 rounded-xl border-[#E5E7EB] bg-white text-sm">
                <SelectValue placeholder="All Schools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schools</SelectItem>
                {assignedSchools.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <Tabs defaultValue="students">
          <TabsList className="mb-4 h-9 w-auto gap-1 rounded-lg bg-[#F3F4F6] p-1">
            <TabsTrigger
              value="students"
              className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Users className="mr-1.5 h-3 w-3" />
              Students
            </TabsTrigger>
            <TabsTrigger
              value="groups"
              className="h-7 rounded-md px-3 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Layers className="mr-1.5 h-3 w-3" />
              Groups
            </TabsTrigger>
          </TabsList>
          <TabsContent value="students">
            <StudentList schoolId={schoolId} />
          </TabsContent>
          <TabsContent value="groups">
            <GroupManagement schoolId={schoolId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
