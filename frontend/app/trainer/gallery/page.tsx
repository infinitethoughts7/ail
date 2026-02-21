"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTrainerGallery } from "@/hooks/use-trainer-data";
import { getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import { GalleryFilters } from "@/components/trainer/gallery-filters";
import { ImageIcon, X, Star, Clock, CheckCircle, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "bg-emerald-100 text-emerald-800",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "bg-red-100 text-red-800",
  },
};

export default function TrainerGalleryPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [dayFilter, setDayFilter] = useState("");
  const { data: photos, isLoading } = useTrainerGallery({
    status: statusFilter || undefined,
    day: dayFilter || undefined,
  });
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
          <SidebarTrigger className="md:hidden" />
          <h1 className="text-base font-semibold">My Gallery</h1>
        </header>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selected = photos?.find((p) => p.id === selectedPhoto);

  return (
    <div>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-white/80 px-4 backdrop-blur-lg dark:bg-gray-950/80">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold">My Gallery</h1>
        {photos && (
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {photos.length}
          </Badge>
        )}
      </header>

      <div className="p-4 sm:p-6">
        <div className="mb-4">
          <GalleryFilters
            status={statusFilter}
            day={dayFilter}
            onStatusChange={setStatusFilter}
            onDayChange={setDayFilter}
          />
        </div>

        {!photos || photos.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <ImageIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-medium">No photos yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Photos from your session submissions will appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const statusCfg = STATUS_CONFIG[photo.approval_status];
              const dayTheme = getDayTheme(photo.day_number);
              const StatusIcon = statusCfg?.icon || Clock;

              return (
                <div
                  key={photo.id}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-muted transition-all active:scale-[0.97]"
                  onClick={() => setSelectedPhoto(photo.id)}
                >
                  {/* Image */}
                  <div className="aspect-square">
                    {photo.image_url ? (
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Session photo"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Overlay badges */}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    <Badge
                      className={`border-0 text-[9px] px-1.5 py-0 font-semibold ${dayTheme.bgLight} ${dayTheme.textColor}`}
                    >
                      {dayTheme.shortLabel}
                    </Badge>
                    {photo.is_featured && (
                      <Badge className="border-0 bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0">
                        <Star className="mr-0.5 h-2.5 w-2.5 fill-amber-500" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="absolute right-2 top-2">
                    <Badge
                      className={`border-0 text-[9px] px-1.5 py-0 font-semibold ${statusCfg?.className}`}
                    >
                      <StatusIcon className="mr-0.5 h-2.5 w-2.5" />
                      {statusCfg?.label}
                    </Badge>
                  </div>

                  {/* Bottom gradient info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2.5 pb-2.5 pt-10">
                    <p className="truncate text-xs font-medium text-white">
                      {photo.school_name}
                    </p>
                    <p className="text-[10px] text-white/60">
                      {timeAgo(photo.uploaded_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors active:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-gray-950 sm:mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.image_url && (
              <img
                src={selected.image_url}
                alt={selected.caption || "Session photo"}
                className="max-h-[60vh] w-full object-contain bg-black"
              />
            )}
            <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:pb-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{selected.school_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Day {selected.day_number} · {timeAgo(selected.uploaded_at)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {selected.is_featured && (
                    <Badge className="border-0 bg-amber-100 text-amber-800 text-[10px]">
                      <Star className="mr-0.5 h-2.5 w-2.5 fill-amber-500" />
                      Featured
                    </Badge>
                  )}
                  <Badge
                    className={`border-0 text-[10px] ${STATUS_CONFIG[selected.approval_status]?.className}`}
                  >
                    {STATUS_CONFIG[selected.approval_status]?.label}
                  </Badge>
                </div>
              </div>
              {selected.caption && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {selected.caption}
                </p>
              )}
              {selected.rejection_reason && (
                <div className="mt-2 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 dark:bg-red-950/30">
                  <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {selected.rejection_reason}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
