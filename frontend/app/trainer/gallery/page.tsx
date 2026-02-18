"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useTrainerGallery } from "@/hooks/use-trainer-data";
import { getDayTheme } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
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
  const { data: photos, isLoading } = useTrainerGallery();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-sm font-semibold">Gallery</h1>
        </header>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selected = photos?.find((p) => p.id === selectedPhoto);

  return (
    <div>
      <header className="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <ImageIcon className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold">My Gallery</h1>
        {photos && (
          <Badge variant="secondary" className="ml-1 text-[10px]">
            {photos.length} photos
          </Badge>
        )}
      </header>

      <div className="p-4 sm:p-6">
        {!photos || photos.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No photos yet. Photos you upload with session submissions will
                appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const statusCfg = STATUS_CONFIG[photo.approval_status];
              const dayTheme = getDayTheme(photo.day_number);
              const StatusIcon = statusCfg?.icon || Clock;

              return (
                <div
                  key={photo.id}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border bg-muted transition-shadow hover:shadow-md"
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
                      className={`text-[10px] px-1.5 py-0 ${dayTheme.bgLight} ${dayTheme.textColor}`}
                    >
                      {dayTheme.shortLabel}
                    </Badge>
                    {photo.is_featured && (
                      <Badge className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">
                        <Star className="mr-0.5 h-2.5 w-2.5" />
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="absolute right-2 top-2">
                    <Badge
                      className={`text-[10px] px-1.5 py-0 ${statusCfg?.className}`}
                    >
                      <StatusIcon className="mr-0.5 h-2.5 w-2.5" />
                      {statusCfg?.label}
                    </Badge>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2.5 pt-8">
                    <p className="truncate text-xs font-medium text-white">
                      {photo.school_name}
                    </p>
                    <p className="text-[10px] text-white/70">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setSelectedPhoto(null)}
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            {selected.image_url && (
              <img
                src={selected.image_url}
                alt={selected.caption || "Session photo"}
                className="max-h-[70vh] w-full object-contain"
              />
            )}
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{selected.school_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Day {selected.day_number} · {timeAgo(selected.uploaded_at)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  {selected.is_featured && (
                    <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                      <Star className="mr-0.5 h-2.5 w-2.5" />
                      Featured
                    </Badge>
                  )}
                  <Badge
                    className={`text-[10px] ${STATUS_CONFIG[selected.approval_status]?.className}`}
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
                <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  Reason: {selected.rejection_reason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
