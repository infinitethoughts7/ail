"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UWHSummary {
  status_banner: {
    status: string;
    message: string;
    color: string;
  };
  kpis: {
    total_schools: number;
    schools_completed: number;
    schools_in_progress: number;
    total_students_trained: number;
    total_sessions: number;
    total_districts: number;
  };
  financial_summary: Record<string, unknown>;
}

interface ActivityItem {
  id: string;
  user_name: string | null;
  activity_type: string;
  title: string;
  description: string;
  timestamp: string;
}

interface DistrictProgress {
  id: string;
  name: string;
  total_schools: number;
  completed: number;
  in_progress: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<UWHSummary | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [districts, setDistricts] = useState<DistrictProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAuthError = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (!session?.accessToken) return;

    const fetchData = async () => {
      try {
        const [summaryRes, activityRes, districtRes] = await Promise.all([
          api.get("/api/dashboard/uwh/summary/"),
          api.get("/api/dashboard/uwh/activity-feed/"),
          api.get("/api/dashboard/uwh/district-progress/"),
        ]);
        setSummary(summaryRes.data);
        setActivities(activityRes.data);
        setDistricts(districtRes.data);
      } catch (err: unknown) {
        if (
          err &&
          typeof err === "object" &&
          "response" in err &&
          (err as { response?: { status?: number } }).response?.status === 401
        ) {
          handleAuthError();
          return;
        }
        // Fallback: use legacy summary endpoint
        try {
          const fallback = await api.get("/api/dashboard/summary/");
          setSummary({
            status_banner: { status: "active", message: "Program in Progress", color: "green" },
            kpis: {
              total_schools: fallback.data.total_schools,
              schools_completed: fallback.data.schools_completed,
              schools_in_progress: 0,
              total_students_trained: fallback.data.students_trained,
              total_sessions: 0,
              total_districts: 0,
            },
            financial_summary: {},
          });
        } catch {
          handleAuthError();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [session, handleAuthError]);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!summary) return null;

  const bannerColors: Record<string, string> = {
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-700",
    red: "bg-red-500/10 border-red-500/30 text-red-700",
  };
  const bannerClass = bannerColors[summary.status_banner.color] || bannerColors.green;

  const kpis = [
    { title: "Total Schools", value: summary.kpis.total_schools },
    { title: "Schools Completed", value: summary.kpis.schools_completed },
    { title: "In Progress", value: summary.kpis.schools_in_progress },
    { title: "Students Trained", value: summary.kpis.total_students_trained },
    { title: "Total Sessions", value: summary.kpis.total_sessions },
    { title: "Districts", value: summary.kpis.total_districts },
  ];

  return (
    <div className="min-h-dvh px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h1 className="text-xl font-bold sm:text-2xl lg:text-3xl">
            Sponsor Dashboard
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>

        {/* Status Banner */}
        <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium sm:mb-6 ${bannerClass}`}>
          {summary.status_banner.message}
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="px-3 pb-1 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                  {kpi.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <p className="text-xl font-bold sm:text-2xl">{kpi.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Two-column layout: District Progress + Activity Feed */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* District Progress */}
          {districts.length > 0 && (
            <Card>
              <CardHeader className="px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
                <CardTitle className="text-sm font-semibold sm:text-base">
                  District Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="space-y-3">
                  {districts.map((d) => {
                    const pct = d.total_schools > 0
                      ? Math.round((d.completed / d.total_schools) * 100)
                      : 0;
                    return (
                      <div key={d.id}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="font-medium">{d.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {d.completed}/{d.total_schools}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-2 rounded-full bg-emerald-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Feed */}
          <Card>
            <CardHeader className="px-4 pb-2 pt-4 sm:px-6 sm:pt-6">
              <CardTitle className="text-sm font-semibold sm:text-base">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 10).map((a) => (
                    <div key={a.id} className="border-b border-border pb-2 last:border-0">
                      <p className="text-sm font-medium">{a.title}</p>
                      {a.description && (
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      )}
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(a.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
