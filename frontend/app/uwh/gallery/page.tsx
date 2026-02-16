"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUWHGallery } from "@/hooks/use-uwh-data";
import { Camera, Star } from "lucide-react";
import type { SessionPhoto } from "@/lib/types";

export default function GalleryPage() {
  const { data: gallery, isLoading } = useUWHGallery();
  const [viewPhoto, setViewPhoto] = useState<SessionPhoto | null>(null);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const featured = gallery?.featured || [];
  const regular = gallery?.photos || [];
  const allPhotos = [...featured, ...regular];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Photo Gallery</h1>
        <p className="text-sm text-muted-foreground">
          The AI Literacy program in action — {allPhotos.length} photos
        </p>
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Star className="h-4 w-4 text-amber-500" /> Featured Photos
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((photo) => (
              <div
                key={photo.id}
                className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-amber-200"
                onClick={() => setViewPhoto(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Featured photo"}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute left-2 top-2">
                  <Badge className="bg-amber-500 text-[10px] text-white">
                    <Star className="mr-0.5 h-2.5 w-2.5" /> Featured
                  </Badge>
                </div>
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                    <p className="text-[11px] text-white">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Photos */}
      {regular.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Camera className="h-4 w-4" /> All Photos ({regular.length})
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {regular.map((photo) => (
              <div
                key={photo.id}
                className="group cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setViewPhoto(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Session photo"}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {allPhotos.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground">
            No approved photos available yet.
          </CardContent>
        </Card>
      )}

      {/* Photo Lightbox */}
      <Dialog open={!!viewPhoto} onOpenChange={() => setViewPhoto(null)}>
        <DialogContent className="max-w-3xl p-0">
          <DialogTitle className="sr-only">Photo Detail</DialogTitle>
          {viewPhoto && (
            <div>
              <img
                src={viewPhoto.image_url}
                alt={viewPhoto.caption || "Session photo"}
                className="w-full rounded-t-lg object-contain"
              />
              {viewPhoto.caption && (
                <div className="p-4">
                  <p className="text-sm">{viewPhoto.caption}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
