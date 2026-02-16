"use client";

import { Badge } from "@/components/ui/badge";

interface Props {
  banner: {
    status: string;
    message: string;
    color: string;
  };
}

const BANNER_COLORS: Record<string, string> = {
  green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
  yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
  red: "bg-red-500/10 border-red-500/30 text-red-700",
};

export function UWHStatusBanner({ banner }: Props) {
  const colorClass = BANNER_COLORS[banner.color] || BANNER_COLORS.green;

  return (
    <div className={`mb-4 rounded-xl border px-4 py-3 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{banner.message}</p>
        <Badge variant="outline" className="text-[10px]">
          {banner.status}
        </Badge>
      </div>
    </div>
  );
}
