"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateStatusBanner } from "@/hooks/use-swinfy-data";
import type { UWHControl } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  control: UWHControl;
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

const COLOR_OPTIONS = [
  { value: "green", label: "Green", class: "bg-emerald-500" },
  { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
  { value: "red", label: "Red", class: "bg-red-500" },
];

export function UWHControlPanel({ control }: Props) {
  const [status, setStatus] = useState<string>(control.status);
  const [message, setMessage] = useState(control.status_message);
  const [color, setColor] = useState<string>(control.status_color);

  const updateBanner = useUpdateStatusBanner();

  const handleSave = () => {
    updateBanner.mutate(
      { status, message, color },
      {
        onSuccess: () => toast.success("Status banner updated"),
        onError: () => toast.error("Failed to update"),
      }
    );
  };

  const bannerPreviewColors: Record<string, string> = {
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
    red: "bg-red-500/10 border-red-500/30 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Status Banner Control */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Status Banner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview */}
          <div>
            <Label className="mb-2 text-xs text-muted-foreground">
              Preview (what UWH sees)
            </Label>
            <div
              className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                bannerPreviewColors[color] || bannerPreviewColors.green
              }`}
            >
              {message || "No message"}
              <Badge variant="outline" className="ml-2 text-[10px]">
                {status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label className="mb-1.5 block text-sm">Program Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Banner Color</Label>
              <Select value={color} onValueChange={setColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${opt.class}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1.5 block text-sm">Status Message</Label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Program in Progress"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={updateBanner.isPending}
          >
            Save Banner
          </Button>
        </CardContent>
      </Card>

      {/* Financial Summary (read-only view for now) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(control.financial_summary).length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No financial data available.
            </p>
          ) : (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
              {JSON.stringify(control.financial_summary, null, 2)}
            </pre>
          )}
        </CardContent>
      </Card>

      {/* Last Updated */}
      <p className="text-xs text-muted-foreground">
        Last updated: {new Date(control.updated_at).toLocaleString()}
      </p>
    </div>
  );
}
