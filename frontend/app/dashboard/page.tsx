"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Summary {
  total_schools: number;
  schools_completed: number;
  total_students: number;
  students_trained: number;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary/`, {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        })
        .then((res) => setSummary(res.data))
        .catch(() => {});
    }
  }, [session]);

  if (status === "loading" || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  const cards = [
    { title: "Total Schools", value: summary.total_schools },
    { title: "Schools Completed", value: summary.schools_completed },
    { title: "Total Students", value: summary.total_students },
    { title: "Students Trained", value: summary.students_trained },
  ];

  return (
    <div className="min-h-screen p-8">
      <h1 className="mb-8 text-3xl font-bold">Sponsor Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
