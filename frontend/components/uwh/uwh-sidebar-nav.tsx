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
        ["--sidebar" as string]: "#3D3530",
        ["--sidebar-foreground" as string]: "#E8E4DF",
        ["--sidebar-accent" as string]: "#4E4843",
        ["--sidebar-accent-foreground" as string]: "#FFFFFF",
        ["--sidebar-border" as string]: "rgba(255,255,255,0.08)",
        ["--sidebar-primary" as string]: "#C9A84C",
        ["--sidebar-primary-foreground" as string]: "#3D3530",
      }}
    >
      {/* Header — Brand */}
      <SidebarHeader className="border-b border-white/[0.08] px-5 py-5">
        <Link href="/uwh/dashboard" className="flex items-center gap-3">
          <Image
            src="/UWH_Logo.png"
            alt="UWH"
            width={40}
            height={40}
            className="rounded-xl"
          />
          <div>
            <p className="uwh-heading text-base font-semibold text-white">
              AI Literacy Program
            </p>
            <p className="uwh-label text-[10px] text-[#94A3B8]" style={{ letterSpacing: "0.12em" }}>
              Sponsor Dashboard
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <p className="uwh-label mb-3 px-2 text-[10px] text-[#94A3B8]" style={{ letterSpacing: "0.12em" }}>
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
                          ? "bg-[#C9A84C]/15 text-[#E8D48B] font-medium shadow-[inset_0_0_0_1px_rgba(201,168,76,0.2)]"
                          : "text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
                        }
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={`h-[18px] w-[18px] ${isActive ? "text-[#C9A84C]" : ""}`}
                        />
                        <span className="text-[13px]">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#C9A84C]" />
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
      <SidebarFooter className="border-t border-white/[0.08] p-4">
        {/* Quick Stats */}
        {summary?.kpis && (
          <div className="mb-4 rounded-xl bg-white/[0.04] p-4" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="uwh-label mb-3 text-[10px] text-[#C9A84C]" style={{ letterSpacing: "0.12em" }}>
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="uwh-mono text-xl font-bold text-white">
                  {summary.kpis.total_schools}
                </p>
                <p className="text-[10px] text-[#94A3B8]">Schools</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-white">
                  {summary.kpis.total_students_trained}
                </p>
                <p className="text-[10px] text-[#94A3B8]">Students</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#10B981]">
                  {summary.kpis.schools_completed}
                </p>
                <p className="text-[10px] text-[#94A3B8]">Completed</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-white">
                  {summary.kpis.total_districts}
                </p>
                <p className="text-[10px] text-[#94A3B8]">Districts</p>
              </div>
            </div>
          </div>
        )}

        <Separator className="mb-3 bg-white/[0.06]" />

        {/* Auto-refresh note */}
        <p className="mb-3 text-center text-[10px] text-[#94A3B8]">
          Auto-refreshes every 30s
        </p>

        {/* Download Report */}
        <button
          onClick={() => window.print()}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-3 py-2 text-[12px] font-medium text-[#C9A84C] transition-all hover:bg-[#C9A84C]/20 hover:border-[#C9A84C]/50"
        >
          <Download className="h-3.5 w-3.5" />
          Download Report
        </button>

        {/* Sign out */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl text-[#94A3B8] hover:bg-white/[0.06] hover:text-white"
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
