"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUWHGallery } from "@/hooks/use-uwh-data";
import { UWHFilters } from "@/components/uwh/uwh-filters";
import { Camera, Star } from "lucide-react";
import type { SessionPhoto } from "@/lib/types";

export default function GalleryPage() {
  const [district, setDistrict] = useState("");
  const [school, setSchool] = useState("");
  const { data: gallery, isLoading } = useUWHGallery({
    district: district || undefined,
    school: school || undefined,
  });
  const [viewPhoto, setViewPhoto] = useState<SessionPhoto | null>(null);

  if (isLoading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl bg-[#F3F4F6]" />
          ))}
        </div>
      </div>
    );
  }

  const featured = gallery?.featured || [];
  const regular = gallery?.photos || [];
  const allPhotos = [...featured, ...regular];

  return (
    <div className="p-5 sm:p-8 uwh-animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="uwh-heading text-2xl font-bold sm:text-3xl">
          Photo Gallery
        </h1>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          The AI Literacy program in action — <span className="uwh-mono">{allPhotos.length}</span> photos
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

      {/* Featured Section */}
      {featured.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-[#7C3AED]" />
            <span className="uwh-label text-[#7C3AED]">Featured Photos</span>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((photo) => (
              <div
                key={photo.id}
                className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#7C3AED]/20 transition-all hover:shadow-md"
                onClick={() => setViewPhoto(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Featured photo"}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-2.5 top-2.5">
                  <Badge className="rounded-lg bg-[#7C3AED] px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                    <Star className="mr-1 h-2.5 w-2.5" /> Featured
                  </Badge>
                </div>
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
                    <p className="text-[11px] leading-snug text-white">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Photos */}
      {regular.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Camera className="h-4 w-4 text-[#9CA3AF]" />
            <span className="uwh-label">All Photos</span>
            <span className="uwh-mono text-xs text-[#9CA3AF]">({regular.length})</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {regular.map((photo) => (
              <div
                key={photo.id}
                className="uwh-card group cursor-pointer overflow-hidden rounded-xl"
                onClick={() => setViewPhoto(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Session photo"}
                  className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {allPhotos.length === 0 && (
        <div className="uwh-card py-20 text-center">
          <Camera className="mx-auto mb-3 h-12 w-12 text-[#E5E7EB]" />
          <p className="text-sm font-medium text-[#9CA3AF]">
            {district || school ? "No photos match the current filters." : "No approved photos available yet."}
          </p>
        </div>
      )}

      {/* Photo Lightbox */}
      <Dialog open={!!viewPhoto} onOpenChange={() => setViewPhoto(null)}>
        <DialogContent
          className="max-w-3xl overflow-hidden rounded-xl border border-[#E5E7EB] p-0"
          style={{ boxShadow: "var(--shadow-elevated)" }}
        >
          <DialogTitle className="sr-only">Photo Detail</DialogTitle>
          {viewPhoto && (
            <div>
              <img
                src={viewPhoto.image_url}
                alt={viewPhoto.caption || "Session photo"}
                className="w-full rounded-t-xl object-contain"
              />
              {viewPhoto.caption && (
                <div className="bg-[#F9FAFB] px-6 py-4">
                  <p className="text-sm text-[#4B5563]">{viewPhoto.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
