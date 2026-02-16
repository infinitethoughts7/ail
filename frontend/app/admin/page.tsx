"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Summary {
  total_schools: number;
  schools_completed: number;
  total_students: number;
  students_trained: number;
  pending_submissions: number;
  pending_photos: number;
  pending_projects: number;
}

interface Submission {
  id: string;
  school_name: string;
  trainer_name: string;
  day_number: number;
  student_count: number;
  status: string;
  submitted_at: string;
  photo_count: number;
  project_count: number;
}

interface Photo {
  id: string;
  image_url: string;
  caption: string;
  approval_status: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  timestamp: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [flagTarget, setFlagTarget] = useState<string | null>(null);

  const handle401 = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchAll = useCallback(async () => {
    try {
      const [s, sub, ph, act] = await Promise.all([
        api.get("/api/dashboard/summary/"),
        api.get("/api/dashboard/swinfy/submissions/?status=submitted"),
        api.get("/api/dashboard/swinfy/photos/pending/"),
        api.get("/api/dashboard/swinfy/activity-log/"),
      ]);
      setSummary(s.data);
      setSubmissions(sub.data);
      setPhotos(ph.data);
      setActivities(act.data);
    } catch (err: unknown) {
      if ((err as { response?: { status?: number } })?.response?.status === 401) {
        handle401();
      }
    } finally {
      setLoading(false);
    }
  }, [handle401]);

  useEffect(() => {
    if (!session?.accessToken) return;
    fetchAll();
    const interval = setInterval(fetchAll, 15_000);
    return () => clearInterval(interval);
  }, [session, fetchAll]);

  const verifySubmission = async (id: string) => {
    setActionLoading(id);
    try {
      await api.patch(`/api/dashboard/swinfy/submissions/${id}/verify/`, { notes: "" });
      fetchAll();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const flagSubmission = async (id: string) => {
    if (!flagReason.trim()) return;
    setActionLoading(id);
    try {
      await api.patch(`/api/dashboard/swinfy/submissions/${id}/flag/`, { reason: flagReason });
      setFlagTarget(null);
      setFlagReason("");
      fetchAll();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const rejectSubmission = async (id: string) => {
    if (!flagReason.trim()) return;
    setActionLoading(id);
    try {
      await api.patch(`/api/dashboard/swinfy/submissions/${id}/reject/`, { reason: flagReason });
      setFlagTarget(null);
      setFlagReason("");
      fetchAll();
    } catch { /* ignore */ }
    setActionLoading(null);
  };

  const approvePhoto = async (id: string) => {
    try {
      await api.patch(`/api/dashboard/swinfy/photos/${id}/approve/`);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  const rejectPhoto = async (id: string) => {
    try {
      await api.patch(`/api/dashboard/swinfy/photos/${id}/reject/`, { reason: "Rejected" });
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    } catch { /* ignore */ }
  };

  const bulkApproveAll = async () => {
    const ids = photos.map((p) => p.id);
    if (!ids.length) return;
    try {
      await api.post("/api/dashboard/swinfy/photos/bulk-approve/", { photo_ids: ids });
      fetchAll();
    } catch { /* ignore */ }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  const kpis = summary
    ? [
        { label: "Total Schools", value: summary.total_schools },
        { label: "Completed", value: summary.schools_completed },
        { label: "Students Trained", value: summary.students_trained },
        { label: "Pending Submissions", value: summary.pending_submissions, highlight: true },
        { label: "Pending Photos", value: summary.pending_photos, highlight: true },
        { label: "Pending Projects", value: summary.pending_projects, highlight: true },
      ]
    : [];

  return (
    <div className="min-h-dvh px-4 pb-8 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h1 className="text-xl font-bold sm:text-2xl">Swinfy Admin</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Sign out
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {kpis.map((k) => (
            <Card key={k.label} className={k.highlight ? "border-orange-300" : ""}>
              <CardHeader className="px-3 pb-1 pt-3 sm:px-4 sm:pt-4">
                <CardTitle className="text-[11px] font-medium text-muted-foreground sm:text-xs">
                  {k.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
                <p className={`text-xl font-bold sm:text-2xl ${k.highlight && k.value > 0 ? "text-orange-600" : ""}`}>
                  {k.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Verification Queue */}
        <section className="mb-6">
          <h2 className="mb-3 text-base font-semibold sm:text-lg">
            Verification Queue ({submissions.length})
          </h2>
          {submissions.length === 0 ? (
            <Card>
              <CardContent className="px-4 py-6 text-center text-sm text-muted-foreground">
                No pending submissions.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id}>
                  <CardContent className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold sm:text-base">
                          {sub.school_name} — Day {sub.day_number}
                        </p>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                          {sub.trainer_name} · {sub.student_count} students · {sub.photo_count} photos · {sub.project_count} projects
                        </p>
                        {sub.submitted_at && (
                          <p className="text-[11px] text-muted-foreground">
                            Submitted {new Date(sub.submitted_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          onClick={() => verifySubmission(sub.id)}
                          disabled={actionLoading === sub.id}
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFlagTarget(flagTarget === sub.id ? null : sub.id)}
                          className="border-orange-400 text-orange-600 hover:bg-orange-50"
                        >
                          Flag
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setFlagTarget(flagTarget === `reject-${sub.id}` ? null : `reject-${sub.id}`)}
                          className="border-red-400 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>

                    {/* Flag/Reject reason input */}
                    {(flagTarget === sub.id || flagTarget === `reject-${sub.id}`) && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter reason..."
                          value={flagReason}
                          onChange={(e) => setFlagReason(e.target.value)}
                          className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() =>
                            flagTarget === sub.id
                              ? flagSubmission(sub.id)
                              : rejectSubmission(sub.id)
                          }
                          disabled={!flagReason.trim()}
                        >
                          Submit
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Photo Approval Grid */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold sm:text-lg">
              Photos Pending ({photos.length})
            </h2>
            {photos.length > 0 && (
              <Button size="sm" variant="outline" onClick={bulkApproveAll}>
                Approve All
              </Button>
            )}
          </div>
          {photos.length === 0 ? (
            <Card>
              <CardContent className="px-4 py-6 text-center text-sm text-muted-foreground">
                No pending photos.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="overflow-hidden rounded-xl border bg-card"
                >
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
                  <div className="flex gap-1 p-2">
                    <Button
                      size="xs"
                      className="flex-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      onClick={() => approvePhoto(photo.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="flex-1 text-xs text-red-600"
                      onClick={() => rejectPhoto(photo.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Activity Log */}
        <section>
          <h2 className="mb-3 text-base font-semibold sm:text-lg">Activity Log</h2>
          <Card>
            <CardContent className="px-4 py-4 sm:px-6">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity yet.</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 20).map((a) => (
                    <div
                      key={a.id}
                      className="border-b border-border pb-2 last:border-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{a.title}</p>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {a.activity_type.replace(/_/g, " ")}
                        </span>
                      </div>
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
        </section>
      </div>
    </div>
  );
}
