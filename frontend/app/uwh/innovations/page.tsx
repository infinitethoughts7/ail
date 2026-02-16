"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHProjects } from "@/hooks/use-uwh-data";
import { Lightbulb, Star, User } from "lucide-react";

export default function InnovationsPage() {
  const { data: projects, isLoading } = useUWHProjects();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );
  }

  const featured = projects?.filter((p) => p.approval_status === "featured") || [];
  const approved = projects?.filter((p) => p.approval_status === "approved") || [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Student Innovations</h1>
        <p className="text-sm text-muted-foreground">
          What are students creating? See the real impact.
        </p>
      </div>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Star className="h-4 w-4 text-amber-500" /> Featured Projects
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((proj) => (
              <Card
                key={proj.id}
                className="border-2 border-amber-200 bg-amber-50/50"
              >
                <CardContent className="p-4">
                  <Badge className="mb-2 bg-amber-500 text-white">
                    <Star className="mr-1 h-3 w-3" /> Featured
                  </Badge>
                  {proj.image_url && (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="mb-3 h-40 w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="text-base font-semibold">{proj.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {proj.student_name}
                    {proj.student_grade && ` · Grade ${proj.student_grade}`}
                    {proj.student_age && ` · Age ${proj.student_age}`}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {proj.display_description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      {approved.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="h-4 w-4" /> All Projects ({approved.length})
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((proj) => (
              <Card key={proj.id}>
                <CardContent className="p-4">
                  {proj.image_url && (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="mb-3 h-36 w-full rounded-lg object-cover"
                    />
                  )}
                  <h3 className="text-sm font-semibold">{proj.title}</h3>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {proj.student_name}
                    {proj.student_grade && ` · Grade ${proj.student_grade}`}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {proj.display_description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {featured.length === 0 && approved.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No student projects available yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
