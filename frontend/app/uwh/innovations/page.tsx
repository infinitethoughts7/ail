"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useUWHProjects } from "@/hooks/use-uwh-data";
import { UWHFilters } from "@/components/uwh/uwh-filters";
import {
  Lightbulb,
  Star,
  User,
  Globe,
  Music,
  Video,
  Image as ImageIcon,
  Users,
  ExternalLink,
} from "lucide-react";
import type { ProjectType, ProjectHighlight } from "@/lib/types";

const TYPE_ICON: Record<ProjectType, React.ReactNode> = {
  image: <ImageIcon className="h-3 w-3" />,
  website_link: <Globe className="h-3 w-3" />,
  music: <Music className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
};

const TYPE_LABEL: Record<ProjectType, string> = {
  image: "Image",
  website_link: "Website",
  music: "Music",
  video: "Video",
};

function ProjectMedia({ proj }: { proj: ProjectHighlight }) {
  if (proj.project_type === "image" && proj.image_url) {
    return (
      <img
        src={proj.image_url}
        alt={proj.title}
        className="mb-4 h-40 w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.02]"
      />
    );
  }
  if (proj.project_type === "website_link" && proj.website_url) {
    return (
      <a
        href={proj.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-4 flex items-center gap-1.5 rounded-lg bg-[#EFF6FF] px-3 py-2 text-xs text-[#2563EB] hover:bg-[#DBEAFE]"
      >
        <ExternalLink className="h-3 w-3" />
        <span className="truncate">{proj.website_url}</span>
      </a>
    );
  }
  if (proj.project_type === "music" && proj.media_file_url) {
    return (
      <audio controls className="mb-4 w-full" src={proj.media_file_url} />
    );
  }
  if (proj.project_type === "video" && proj.media_file_url) {
    return (
      <video controls className="mb-4 w-full rounded-lg" src={proj.media_file_url} />
    );
  }
  return null;
}

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
          <Skeleton key={i} className="h-40 rounded-xl bg-[#F3F4F6]" />
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
        <p className="mt-1 text-sm text-[#9CA3AF]">
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
            <Star className="h-4 w-4 text-[#7C3AED]" />
            <span className="uwh-label text-[#7C3AED]">Featured Projects</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((proj) => (
              <div
                key={proj.id}
                className="uwh-card group overflow-hidden border-2 border-[#7C3AED]/15"
              >
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge className="rounded-lg bg-[#7C3AED] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-sm">
                      <Star className="mr-1 h-3 w-3" /> Featured
                    </Badge>
                    {proj.project_type && TYPE_LABEL[proj.project_type] && (
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_ICON[proj.project_type]}
                        <span className="ml-1">{TYPE_LABEL[proj.project_type]}</span>
                      </Badge>
                    )}
                  </div>
                  <ProjectMedia proj={proj} />
                  <h3 className="uwh-heading text-base font-semibold">{proj.title}</h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <User className="h-3 w-3" />
                    <span>{proj.student_name}</span>
                    {proj.student_grade && <span>· Grade {proj.student_grade}</span>}
                    {proj.student_age && <span>· Age {proj.student_age}</span>}
                  </div>
                  {proj.group_name && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                      <Users className="h-3 w-3" />
                      <span>{proj.group_name}</span>
                      {proj.group_members?.length > 0 && (
                        <span>· {proj.group_members.join(", ")}</span>
                      )}
                    </div>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
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
            <Lightbulb className="h-4 w-4 text-[#9CA3AF]" />
            <span className="uwh-label">All Projects</span>
            <span className="uwh-mono text-xs text-[#9CA3AF]">({approved.length})</span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {approved.map((proj) => (
              <div
                key={proj.id}
                className="uwh-card group overflow-hidden"
              >
                <div className="p-5">
                  {proj.project_type && TYPE_LABEL[proj.project_type] && (
                    <Badge variant="outline" className="mb-3 text-[10px]">
                      {TYPE_ICON[proj.project_type]}
                      <span className="ml-1">{TYPE_LABEL[proj.project_type]}</span>
                    </Badge>
                  )}
                  <ProjectMedia proj={proj} />
                  <h3 className="uwh-heading text-sm font-semibold">{proj.title}</h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                    <User className="h-3 w-3" />
                    <span>{proj.student_name}</span>
                    {proj.student_grade && <span>· Grade {proj.student_grade}</span>}
                  </div>
                  {proj.group_name && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#9CA3AF]">
                      <Users className="h-3 w-3" />
                      <span>{proj.group_name}</span>
                      {proj.group_members?.length > 0 && (
                        <span>· {proj.group_members.join(", ")}</span>
                      )}
                    </div>
                  )}
                  <p className="mt-3 text-sm leading-relaxed text-[#4B5563]">
                    {proj.display_description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {featured.length === 0 && approved.length === 0 && (
        <div className="uwh-card py-20 text-center">
          <Lightbulb className="mx-auto mb-3 h-12 w-12 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#9CA3AF]">
            {district || school ? "No projects match the current filters." : "No student projects available yet."}
          </p>
        </div>
      )}
    </div>
  );
}
