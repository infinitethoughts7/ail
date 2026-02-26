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
      <div className="flex min-h-dvh items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#7C3AED] border-t-transparent" />
          <p className="uwh-label">Loading dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <UWHSidebarNav />
      <SidebarInset>
        <div className="min-h-dvh uwh-body bg-[#F3F4F6]">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
