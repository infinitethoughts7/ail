"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Image from "next/image";
import {
  LayoutDashboard,
  MapPin,
  BookOpen,
  TrendingUp,
  Camera,
  Lightbulb,
  DollarSign,
  Activity,
  LogOut,
  Download,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useUWHSummary } from "@/hooks/use-uwh-data";
import { timeAgo } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Program Dashboard",
    href: "/uwh/dashboard",
    icon: LayoutDashboard,
    description: "Overview & KPIs",
  },
  {
    label: "District Progress",
    href: "/uwh/districts",
    icon: MapPin,
    description: "School-wise tracking",
  },
  {
    label: "Curriculum Journey",
    href: "/uwh/curriculum",
    icon: BookOpen,
    description: "4-day learning path",
  },
  {
    label: "Impact & Outcomes",
    href: "/uwh/impact",
    icon: TrendingUp,
    description: "Metrics & growth",
  },
  {
    label: "Photo Gallery",
    href: "/uwh/gallery",
    icon: Camera,
    description: "Program in action",
  },
  {
    label: "Student Innovations",
    href: "/uwh/innovations",
    icon: Lightbulb,
    description: "Project showcase",
  },
  {
    label: "Financial Overview",
    href: "/uwh/financials",
    icon: DollarSign,
    description: "Budget & allocation",
  },
  {
    label: "Activity Timeline",
    href: "/uwh/activity",
    icon: Activity,
    description: "Latest updates",
  },
];

export function UWHSidebarNav() {
  const pathname = usePathname();
  const { data: summary } = useUWHSummary();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/uwh/dashboard" className="flex items-center gap-3">
          <Image
            src="/UWH_Logo.png"
            alt="UWH"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <div>
            <p className="text-sm font-bold">AI Literacy Program</p>
            <p className="text-[11px] text-muted-foreground">
              Sponsor Dashboard
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/uwh/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-3">
        {/* Quick Stats */}
        {summary?.kpis && (
          <div className="mb-3 rounded-lg bg-muted/50 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-lg font-bold">
                  {summary.kpis.total_schools}
                </p>
                <p className="text-[10px] text-muted-foreground">Schools</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {summary.kpis.total_students_trained}
                </p>
                <p className="text-[10px] text-muted-foreground">Students</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {summary.kpis.schools_completed}
                </p>
                <p className="text-[10px] text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {summary.kpis.total_districts}
                </p>
                <p className="text-[10px] text-muted-foreground">Districts</p>
              </div>
            </div>
          </div>
        )}

        <Separator className="mb-2" />

        {/* Last updated */}
        <p className="mb-2 text-center text-[10px] text-muted-foreground">
          Auto-refreshes every 30s
        </p>

        {/* Download Report */}
        <Button variant="outline" size="sm" className="mb-2 w-full" onClick={() => window.print()}>
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Download Report
        </Button>

        {/* Sign out */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
