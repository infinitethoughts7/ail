"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  School,
  CheckCircle,
  Loader,
  Users,
  BookOpen,
  MapPin,
} from "lucide-react";

interface Props {
  kpis: {
    total_schools: number;
    schools_completed: number;
    schools_in_progress: number;
    total_students_trained: number;
    total_sessions: number;
    total_districts: number;
  };
}

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const start = ref.current ?? 0;
    const diff = value - start;
    if (diff === 0) return;

    const duration = 800;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ref.current = value;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export function UWHKPIStrip({ kpis }: Props) {
  const items = [
    {
      label: "Total Schools",
      value: kpis.total_schools,
      icon: School,
    },
    {
      label: "Schools Completed",
      value: kpis.schools_completed,
      icon: CheckCircle,
    },
    {
      label: "In Progress",
      value: kpis.schools_in_progress,
      icon: Loader,
    },
    {
      label: "Students Trained",
      value: kpis.total_students_trained,
      icon: Users,
    },
    {
      label: "Total Sessions",
      value: kpis.total_sessions,
      icon: BookOpen,
    },
    {
      label: "Districts",
      value: kpis.total_districts,
      icon: MapPin,
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
      {items.map((kpi) => (
        <Card key={kpi.label}>
          <CardContent className="px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                {kpi.label}
              </p>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-2xl font-bold">
              <AnimatedNumber value={kpi.value} />
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
