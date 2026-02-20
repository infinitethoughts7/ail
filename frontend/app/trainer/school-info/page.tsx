"use client";

import { useTrainerProfile } from "@/hooks/use-trainer-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted-foreground">
        Loading school information...
      </div>
    );
  }

  if (!school) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 px-4 text-center">
        <Building2 className="h-12 w-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">No School Assigned</p>
        <p className="text-sm text-muted-foreground">
          You haven&apos;t been assigned to a school yet. Contact your
          coordinator for assistance.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 p-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">{school.name}</h1>
        <p className="text-sm text-muted-foreground">{school.district_name} District</p>
      </div>

      {/* School Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Building2 className="h-4 w-4 text-[#2DD4A8]" />
            School Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-[#2DD4A8]">{school.total_students}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
            <div className="rounded-xl bg-muted/50 p-3 text-center">
              <p className="text-2xl font-bold text-[#2DD4A8]">{school.total_days}</p>
              <p className="text-xs text-muted-foreground">Program Days</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2">
            <span className={`inline-block h-2 w-2 rounded-full ${
              school.status === "completed" ? "bg-green-500" :
              school.status === "in_progress" ? "bg-yellow-500" : "bg-gray-400"
            }`} />
            <span className="text-sm capitalize">
              {school.status.replace("_", " ")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Point of Contact */}
      {school.poc_name && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-blue-500" />
              Point of Contact (POC)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{school.poc_name}</p>
                {school.poc_designation && (
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase className="h-3 w-3" />
                    {school.poc_designation}
                  </p>
                )}
              </div>
            </div>
            {school.poc_phone && (
              <a
                href={`tel:${school.poc_phone.split(",")[0].trim()}`}
                className="flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700 transition-colors active:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400"
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <UserCheck className="h-4 w-4 text-purple-500" />
              Principal Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={`tel:${school.principal_phone}`}
              className="flex items-center gap-2 rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-purple-700 transition-colors active:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-400"
            >
              <Phone className="h-4 w-4" />
              {school.principal_phone}
            </a>
          </CardContent>
        </Card>
      )}

      {/* Co-Trainer */}
      {school.co_trainer && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-orange-500" />
              Co-Trainer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 rounded-xl bg-orange-50 px-4 py-3 dark:bg-orange-950/30">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                <User className="h-4 w-4" />
              </div>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {school.co_trainer}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location / Map */}
      {school.map_url && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-red-500" />
              School Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={school.map_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 transition-colors active:bg-red-100 dark:bg-red-950/30 dark:text-red-400"
            >
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">Open in Google Maps</span>
              <ExternalLink className="h-4 w-4 flex-shrink-0 opacity-60" />
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
