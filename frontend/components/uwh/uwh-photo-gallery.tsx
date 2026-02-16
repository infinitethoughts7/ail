"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUWHGallery } from "@/hooks/use-uwh-data";
import { Image as ImageIcon, Star } from "lucide-react";
import type { SessionPhoto } from "@/lib/types";

export function UWHPhotoGallery() {
  const { data: gallery, isLoading } = useUWHGallery();
  const [viewPhoto, setViewPhoto] = useState<SessionPhoto | null>(null);
  const [showAll, setShowAll] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (!gallery) return null;

  const allPhotos = [...gallery.featured, ...gallery.photos];
  const displayPhotos = showAll ? allPhotos : allPhotos.slice(0, 12);

  if (allPhotos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-semibold sm:text-base">
              Photo Gallery
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No approved photos yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-semibold sm:text-base">
                Photo Gallery
              </CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              {allPhotos.length} photos
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {displayPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative cursor-pointer overflow-hidden rounded-lg"
                onClick={() => setViewPhoto(photo)}
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption || "Session photo"}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
                {photo.is_featured && (
                  <div className="absolute left-1.5 top-1.5">
                    <Badge className="bg-amber-500 text-[10px] text-white">
                      <Star className="mr-0.5 h-2.5 w-2.5" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>

          {allPhotos.length > 12 && !showAll && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(true)}
              >
                Show All ({allPhotos.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Lightbox */}
      <Dialog open={!!viewPhoto} onOpenChange={() => setViewPhoto(null)}>
        <DialogContent className="max-w-2xl p-0">
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
    </>
  );
}
