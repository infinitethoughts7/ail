"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { UWHSidebarNav } from "@/components/uwh/uwh-sidebar-nav";

export default function UWHLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <SidebarProvider>
      <UWHSidebarNav />
      <SidebarInset>
        <div className="min-h-dvh">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
