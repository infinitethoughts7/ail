"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useApprovePhoto,
  useRejectPhoto,
  useFeaturePhoto,
  useBulkApprovePhotos,
  useBulkRejectPhotos,
} from "@/hooks/use-swinfy-data";
import type { SessionPhoto } from "@/lib/types";
import { toast } from "sonner";
import { Check, X, Star, CheckCheck } from "lucide-react";

interface Props {
  photos: SessionPhoto[];
}

export function PhotoApprovalGrid({ photos }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const approve = useApprovePhoto();
  const reject = useRejectPhoto();
  const feature = useFeaturePhoto();
  const bulkApprove = useBulkApprovePhotos();
  const bulkReject = useBulkRejectPhotos();

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === photos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(photos.map((p) => p.id)));
    }
  };

  const handleBulkApprove = () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    bulkApprove.mutate(ids, {
      onSuccess: () => {
        toast.success(`${ids.length} photos approved`);
        setSelected(new Set());
      },
      onError: () => toast.error("Bulk approve failed"),
    });
  };

  const handleBulkReject = () => {
    const ids = Array.from(selected);
    if (!ids.length) return;
    bulkReject.mutate(
      { photo_ids: ids, reason: "Rejected by admin" },
      {
        onSuccess: () => {
          toast.success(`${ids.length} photos rejected`);
          setSelected(new Set());
        },
        onError: () => toast.error("Bulk reject failed"),
      }
    );
  };

  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          No pending photos to review.
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {/* Bulk Actions Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button size="sm" variant="outline" onClick={selectAll}>
          <CheckCheck className="mr-1 h-3 w-3" />
          {selected.size === photos.length ? "Deselect All" : "Select All"}
        </Button>
        {selected.size > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {selected.size} selected
            </span>
            <Button
              size="sm"
              onClick={handleBulkApprove}
              disabled={bulkApprove.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Check className="mr-1 h-3 w-3" />
              Approve Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkReject}
              disabled={bulkReject.isPending}
              className="border-red-400 text-red-600"
            >
              <X className="mr-1 h-3 w-3" />
              Reject Selected
            </Button>
          </>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {photos.length} pending
        </span>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className={`group relative overflow-hidden rounded-xl border bg-card transition-all ${
              selected.has(photo.id) ? "ring-2 ring-primary" : ""
            }`}
          >
            {/* Select checkbox */}
            <div className="absolute left-2 top-2 z-10">
              <Checkbox
                checked={selected.has(photo.id)}
                onCheckedChange={() => toggleSelect(photo.id)}
                className="border-white/80 bg-black/30 data-[state=checked]:bg-primary"
              />
            </div>

            {/* Image */}
            {photo.image_url ? (
              <img
                src={photo.image_url}
                alt={photo.caption || "Session photo"}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square items-center justify-center bg-muted text-xs text-muted-foreground">
                No preview
              </div>
            )}

            {/* Caption */}
            {photo.caption && (
              <p className="truncate px-2 py-1 text-[10px] text-muted-foreground">
                {photo.caption}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-1 p-1.5">
              <Button
                size="xs"
                className="flex-1 bg-emerald-600 text-[11px] text-white hover:bg-emerald-700"
                onClick={() =>
                  approve.mutate(photo.id, {
                    onSuccess: () => toast.success("Photo approved"),
                  })
                }
                disabled={approve.isPending}
              >
                <Check className="mr-0.5 h-3 w-3" />
                Approve
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="text-[11px]"
                onClick={() =>
                  feature.mutate(photo.id, {
                    onSuccess: () => toast.success("Photo featured"),
                  })
                }
                disabled={feature.isPending}
              >
                <Star className="mr-0.5 h-3 w-3" />
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="text-[11px] text-red-600"
                onClick={() =>
                  reject.mutate(
                    { id: photo.id },
                    { onSuccess: () => toast.success("Photo rejected") }
                  )
                }
                disabled={reject.isPending}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
