"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { TrainerSidebarNav } from "@/components/trainer/trainer-sidebar-nav";
import { MobileBottomNav } from "@/components/trainer/mobile-bottom-nav";

export default function TrainerLayout({
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
      <div className="flex min-h-dvh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2DD4A8] border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <TrainerSidebarNav />
      <SidebarInset>
        <div className="min-h-dvh pb-16 md:pb-0">{children}</div>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
