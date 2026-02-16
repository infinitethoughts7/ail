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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useUWHSummary } from "@/hooks/use-uwh-data";

const NAV_ITEMS = [
  {
    label: "Program Dashboard",
    href: "/uwh/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "District Progress",
    href: "/uwh/districts",
    icon: MapPin,
  },
  {
    label: "Curriculum Journey",
    href: "/uwh/curriculum",
    icon: BookOpen,
  },
  {
    label: "Impact & Outcomes",
    href: "/uwh/impact",
    icon: TrendingUp,
  },
  {
    label: "Photo Gallery",
    href: "/uwh/gallery",
    icon: Camera,
  },
  {
    label: "Student Innovations",
    href: "/uwh/innovations",
    icon: Lightbulb,
  },
  {
    label: "Financial Overview",
    href: "/uwh/financials",
    icon: DollarSign,
  },
  {
    label: "Activity Timeline",
    href: "/uwh/activity",
    icon: Activity,
  },
];

export function UWHSidebarNav() {
  const pathname = usePathname();
  const { data: summary } = useUWHSummary();

  return (
    <Sidebar
      className="border-r-0"
      style={{
        ["--sidebar" as string]: "#E8E0D0",
        ["--sidebar-foreground" as string]: "#5C4A2E",
        ["--sidebar-accent" as string]: "#DDD5C3",
        ["--sidebar-accent-foreground" as string]: "#3D2B14",
        ["--sidebar-border" as string]: "rgba(0,0,0,0.06)",
        ["--sidebar-primary" as string]: "#C6922A",
        ["--sidebar-primary-foreground" as string]: "#FFFFFF",
      }}
    >
      {/* Header — Brand */}
      <SidebarHeader className="border-b border-[#C6922A]/15 px-5 py-5">
        <Link href="/uwh/dashboard" className="flex items-center gap-3">
          <Image
            src="/UWH_Logo.png"
            alt="UWH"
            width={200}
            height={50}
            className="w-full"
          />
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <p className="uwh-label mb-3 px-2 text-[10px] text-[#5C4A2E]/50" style={{ letterSpacing: "0.12em" }}>
            Navigation
          </p>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/uwh/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`
                        mb-0.5 rounded-xl px-3 py-2.5 transition-all duration-200
                        ${isActive
                          ? "bg-[#C6922A]/15 text-[#C6922A] font-medium shadow-[inset_0_0_0_1px_rgba(198,146,42,0.2)]"
                          : "text-[#5C4A2E]/70 hover:bg-[#C6922A]/8 hover:text-[#C6922A]"
                        }
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={`h-[18px] w-[18px] ${isActive ? "text-[#C6922A]" : "text-[#C6922A]/70"}`}
                        />
                        <span className="text-[13px]">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C6922A]" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-[#C6922A]/15 p-4">
        {/* Quick Stats */}
        {summary?.kpis && (
          <div className="mb-4 rounded-xl bg-[#C6922A]/8 p-4" style={{ border: "1px solid rgba(198,146,42,0.12)" }}>
            <p className="uwh-label mb-3 text-[10px] text-[#C6922A]" style={{ letterSpacing: "0.12em" }}>
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="uwh-mono text-xl font-bold text-[#3D2B14]">
                  {summary.kpis.total_schools}
                </p>
                <p className="text-[10px] text-[#5C4A2E]/50">Schools</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#3D2B14]">
                  {summary.kpis.total_students_trained}
                </p>
                <p className="text-[10px] text-[#5C4A2E]/50">Students</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#3D2B14]">
                  {summary.kpis.schools_completed}
                </p>
                <p className="text-[10px] text-[#5C4A2E]/50">Completed</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#3D2B14]">
                  {summary.kpis.total_districts}
                </p>
                <p className="text-[10px] text-[#5C4A2E]/50">Districts</p>
              </div>
            </div>
          </div>
        )}

        <Separator className="mb-3 bg-[#C6922A]/10" />

        {/* Auto-refresh note */}
        <p className="mb-3 text-center text-[10px] text-[#5C4A2E]/40">
          Auto-refreshes every 30s
        </p>

        {/* Download Report */}
        <button
          onClick={() => window.print()}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C6922A]/25 bg-[#C6922A]/10 px-3 py-2 text-[12px] font-medium text-[#C6922A] transition-all hover:bg-[#C6922A]/20 hover:border-[#C6922A]/40"
        >
          <Download className="h-3.5 w-3.5" />
          Download Report
        </button>

        {/* Sign out */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl text-[#5C4A2E]/60 hover:bg-[#C6922A]/8 hover:text-[#C6922A]"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-[13px]">Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
