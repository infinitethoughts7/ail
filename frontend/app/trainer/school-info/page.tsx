"use client";

import { useSearchParams } from "next/navigation";
import { useTrainerProfile } from "@/hooks/use-trainer-data";
import { Card, CardContent } from "@/components/ui/card";
import { TrainerHeader } from "@/components/trainer/trainer-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  Phone,
  User,
  Users,
  Building2,
  ExternalLink,
  Briefcase,
  UserCheck,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import type { TrainerSchool } from "@/lib/types";

function SchoolDetail({ school }: { school: TrainerSchool }) {
  return (
    <div className="mx-auto max-w-2xl space-y-3 p-4 pb-8">
      {/* School Header Card */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
        <CardContent className="p-4">
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
            Assigned School
          </p>
          <h2 className="mt-1 text-lg font-bold">{school.name}</h2>
          <p className="text-sm text-white/70">{school.district_name} District</p>
          <div className="mt-3 flex gap-4">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{school.total_students}</p>
              <p className="text-[10px] text-white/60">Students</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-xl font-bold">{school.total_days}</p>
              <p className="text-[10px] text-white/60">Program Days</p>
            </div>
            <div className="ml-auto flex items-end">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                <span className={`h-1.5 w-1.5 rounded-full ${
                  school.status === "completed" ? "bg-emerald-400" :
                  school.status === "in_progress" ? "bg-yellow-400" : "bg-gray-400"
                }`} />
                {school.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Point of Contact */}
      {school.poc_name && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/30">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Point of Contact</p>
                <p className="text-sm font-semibold">{school.poc_name}</p>
              </div>
            </div>
            {school.poc_designation && (
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3 w-3" />
                {school.poc_designation}
              </div>
            )}
            {school.poc_phone && (
              <a
                href={`tel:${school.poc_phone.split(",")[0].trim()}`}
                className="flex items-center gap-2.5 rounded-xl bg-blue-50 px-4 py-3.5 text-sm font-medium text-blue-700 transition-colors active:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
              >
                <Phone className="h-4 w-4" />
                {school.poc_phone}
              </a>
            )}
          </CardContent>
        </Card>
      )}

      {/* Principal Contact */}
      {school.principal_phone && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/30">
                <UserCheck className="h-4 w-4 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">Principal</p>
            </div>
            <a
              href={`tel:${school.principal_phone}`}
              className="flex items-center gap-2.5 rounded-xl bg-purple-50 px-4 py-3.5 text-sm font-medium text-purple-700 transition-colors active:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400"
            >
              <Phone className="h-4 w-4" />
              {school.principal_phone}
            </a>
          </CardContent>
        </Card>
      )}

      {/* Co-Trainers */}
      {school.co_trainers && school.co_trainers.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Co-Trainer{school.co_trainers.length > 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold">
                  {school.co_trainers.join(", ")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location / Map */}
      {school.map_url && (
        <a
          href={school.map_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Card className="border-0 shadow-sm transition-all active:scale-[0.99]">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-950/30">
                  <MapPin className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium">Open in Google Maps</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </a>
      )}
    </div>
  );
}

export default function SchoolInfoPage() {
  const searchParams = useSearchParams();
  const schoolIdParam = searchParams.get("school");
  const { data: profile, isLoading } = useTrainerProfile();

  if (isLoading) {
    return (
      <div>
        <TrainerHeader title="School Info" />
        <div className="mx-auto max-w-2xl space-y-3 p-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  const assignedSchools = profile?.assigned_schools || [];

  // If school ID param is provided, show that school
  if (schoolIdParam) {
    const school = assignedSchools.find((s) => s.id === schoolIdParam);
    if (!school) {
      return (
        <div>
          <TrainerHeader title="School Info" />
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-2 text-lg font-semibold">School Not Found</p>
            <p className="text-sm text-muted-foreground">
              This school is not in your assignments
            </p>
          </div>
        </div>
      );
    }
    return (
      <div>
        <TrainerHeader title="School Info" />
        <SchoolDetail school={school} />
      </div>
    );
  }

  // No param: if single school, show it directly; if multiple, show list
  if (assignedSchools.length === 0) {
    return (
      <div>
        <TrainerHeader title="School Info" />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-2 text-lg font-semibold">No School Assigned</p>
          <p className="text-sm text-muted-foreground">
            Contact your coordinator for assistance
          </p>
        </div>
      </div>
    );
  }

  if (assignedSchools.length === 1) {
    return (
      <div>
        <TrainerHeader title="School Info" />
        <SchoolDetail school={assignedSchools[0]} />
      </div>
    );
  }

  // Multiple schools — show summary + list
  const totalStudents = assignedSchools.reduce((sum, s) => sum + s.total_students, 0);
  const totalDays = assignedSchools.reduce((sum, s) => sum + s.total_days, 0);

  return (
    <div>
      <TrainerHeader title="Your Schools" />
      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {/* Combined Summary Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-white/50 uppercase tracking-wider">
              Combined Summary
            </p>
            <h2 className="mt-1 text-lg font-bold">
              {assignedSchools.length} Schools Assigned
            </h2>
            <div className="mt-3 flex gap-3">
              <div className="flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">{totalStudents}</p>
                <p className="text-[10px] text-white/60">Total Students</p>
              </div>
              <div className="flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">{totalDays}</p>
                <p className="text-[10px] text-white/60">Program Days</p>
              </div>
              <div className="flex-1 rounded-xl bg-white/10 px-3 py-2.5 text-center backdrop-blur-sm">
                <p className="text-xl font-bold">
                  {assignedSchools.filter(s => s.status === "completed").length}/{assignedSchools.length}
                </p>
                <p className="text-[10px] text-white/60">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual school cards */}
        {assignedSchools.map((school) => (
          <Link key={school.id} href={`/trainer/school-info?school=${school.id}`}>
            <Card className="border-0 shadow-sm transition-all active:scale-[0.99] hover:shadow-md">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#1F2937]">
                      {school.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[#9CA3AF]">
                      {school.district_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-medium ${
                      school.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                      school.status === "in_progress" ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-600"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        school.status === "completed" ? "bg-emerald-500" :
                        school.status === "in_progress" ? "bg-yellow-500" : "bg-gray-400"
                      }`} />
                      {school.status.replace(/_/g, " ")}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#D1D5DB]" />
                  </div>
                </div>
                <div className="flex border-t border-[#F3F4F6]">
                  <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                    <Users className="h-3 w-3 text-[#9CA3AF]" />
                    <span className="text-xs font-medium text-[#6B7280]">
                      {school.total_students} students
                    </span>
                  </div>
                  <div className="w-px bg-[#F3F4F6]" />
                  <div className="flex flex-1 items-center justify-center gap-1.5 py-2.5">
                    <Briefcase className="h-3 w-3 text-[#9CA3AF]" />
                    <span className="text-xs font-medium text-[#6B7280]">
                      {school.role}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
