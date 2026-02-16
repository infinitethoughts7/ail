"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUWHProjects } from "@/hooks/use-uwh-data";
import { Lightbulb, Star } from "lucide-react";

export function UWHInnovationShowcase() {
  const { data: projects, isLoading } = useUWHProjects();

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  const featured = projects?.filter((p) => p.approval_status === "featured") || [];
  const approved = projects?.filter((p) => p.approval_status === "approved") || [];
  const all = [...featured, ...approved];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-semibold sm:text-base">
            Student Projects
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {all.length === 0 ? (
          <p className="text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-4 pr-4">
              {all.map((proj) => (
                <div key={proj.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold">{proj.title}</p>
                        {proj.approval_status === "featured" && (
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        by {proj.student_name}
                        {proj.student_grade && ` · Grade ${proj.student_grade}`}
                      </p>
                    </div>
                    {proj.approval_status === "featured" && (
                      <Badge className="shrink-0 bg-amber-500 text-[10px] text-white">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {proj.display_description}
                  </p>
                  {proj.image_url && (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="mt-2 h-28 w-full rounded-md object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
