"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHProjects } from "@/hooks/use-uwh-data";
import { UWHFilters } from "@/components/uwh/uwh-filters";
import { Lightbulb, Star, User } from "lucide-react";

export default function InnovationsPage() {
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const { data: projects, isLoading } = useUWHProjects({
    district: district || undefined,
    school: school || undefined,
  });

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" style={{ background: "var(--uwh-border-subtle)" }} />
        ))}
      </div>
    );
  }

  const featured = projects?.filter((p) => p.approval_status === "featured") || [];
  const approved = projects?.filter((p) => p.approval_status === "approved") || [];

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Student Innovations
        </h1>
        <p className="mt-1 text-sm text-[#718096]">
          Showcasing real creativity and impact from the AI Literacy Program
        </p>
      </div>

      <div className="mb-6">
        <UWHFilters
          district={district}
          school={school}
          onDistrictChange={setDistrict}
          onSchoolChange={setSchool}
        />
      </div>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-[#C9A84C]" />
            <span className="uwh-label text-[#C9A84C]">Featured Projects</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((proj) => (
              <div
                key={proj.id}
                className="uwh-card group overflow-hidden"
                style={{
                  border: "2px solid rgba(201, 168, 76, 0.2)",
                  background: "linear-gradient(to bottom, rgba(201, 168, 76, 0.03), white)",
                }}
              >
                <div className="p-5">
                  <Badge className="mb-3 rounded-lg bg-[#C9A84C] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
                    <Star className="mr-1 h-3 w-3" /> Featured
                  </Badge>
                  {proj.image_url && (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="mb-4 h-44 w-full rounded-xl object-cover"
                    />
                  )}
                  <h3 className="uwh-heading text-base font-semibold">{proj.title}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#718096]">
                    <User className="h-3 w-3" />
                    <span>{proj.student_name}</span>
                    {proj.student_grade && <span>· Grade {proj.student_grade}</span>}
                    {proj.student_age && <span>· Age {proj.student_age}</span>}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5568]">
                    {proj.display_description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Projects */}
      {approved.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#718096]" />
            <span className="uwh-label">All Projects</span>
            <span className="uwh-mono text-xs text-[#718096]">({approved.length})</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((proj) => (
              <div
                key={proj.id}
                className="uwh-card group overflow-hidden"
                style={{ border: "1px solid var(--uwh-border-card)" }}
              >
                <div className="p-5">
                  {proj.image_url && (
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="mb-4 h-40 w-full rounded-xl object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  )}
                  <h3 className="uwh-heading text-sm font-semibold">{proj.title}</h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#718096]">
                    <User className="h-3 w-3" />
                    <span>{proj.student_name}</span>
                    {proj.student_grade && <span>· Grade {proj.student_grade}</span>}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#4A5568]">
                    {proj.display_description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {featured.length === 0 && approved.length === 0 && (
        <div className="uwh-card py-20 text-center" style={{ border: "1px solid var(--uwh-border-card)" }}>
          <Lightbulb className="mx-auto mb-3 h-12 w-12 text-[#EDE9E0]" />
          <p className="text-sm font-medium text-[#718096]">
            {district || school ? "No projects match the current filters." : "No student projects available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
