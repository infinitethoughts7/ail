"use client";

import { useTrainerProfile } from "@/hooks/use-trainer-data";
import { Card, CardContent } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
} from "lucide-react";

export default function SchoolInfoPage() {
  const { data: profile, isLoading } = useTrainerProfile();
  const school = profile?.assigned_school;

  if (isLoading) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-base font-semibold">School Info</h1>
        </header>
        <div className="mx-auto max-w-2xl space-y-3 p-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!school) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-base font-semibold">School Info</h1>
        </header>
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

  return (
    <div>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">School Info</h1>
      </header>

      <div className="mx-auto max-w-2xl space-y-3 p-4 pb-8">
        {/* School Header Card */}
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#0F4C4C] to-[#1A6B6B] text-white shadow-lg">
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
                <span className={`inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm`}>
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

        {/* Co-Trainer */}
        {school.co_trainer && (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                  <Users className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Co-Trainer</p>
                  <p className="text-sm font-semibold">{school.co_trainer}</p>
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
    </div>
  );
}
