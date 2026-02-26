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
      className="border-r border-[#E5E7EB]"
      style={{
        ["--sidebar" as string]: "#F3F4F6",
        ["--sidebar-foreground" as string]: "#4B5563",
        ["--sidebar-accent" as string]: "#F3F4F6",
        ["--sidebar-accent-foreground" as string]: "#1F2937",
        ["--sidebar-border" as string]: "#E5E7EB",
        ["--sidebar-primary" as string]: "#7C3AED",
        ["--sidebar-primary-foreground" as string]: "#FFFFFF",
      }}
    >
      {/* Header — Brand */}
      <SidebarHeader className="border-b border-[#E5E7EB] px-5 py-5">
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
          <p className="uwh-label mb-3 px-2 text-[10px] text-[#9CA3AF]" style={{ letterSpacing: "0.12em" }}>
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
                        mb-0.5 rounded-lg px-3 py-2.5 transition-all duration-150
                        ${isActive
                          ? "bg-[#7C3AED]/15 text-[#7C3AED] font-semibold shadow-[inset_3px_0_0_0_#7C3AED] rounded-l-none"
                          : "text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#1F2937]"
                        }
                      `}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon
                          className={`h-[18px] w-[18px] ${isActive ? "text-[#7C3AED]" : "text-[#9CA3AF]"}`}
                        />
                        <span className="text-[13px]">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#7C3AED]" />
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
      <SidebarFooter className="border-t border-[#E5E7EB] p-4">
        {/* Quick Stats */}
        {summary?.kpis && (
          <div className="mb-4 rounded-lg bg-[#F9FAFB] p-4" style={{ border: "1px solid #E5E7EB" }}>
            <p className="uwh-label mb-3 text-[10px] text-[#7C3AED]" style={{ letterSpacing: "0.12em" }}>
              Quick Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="uwh-mono text-xl font-bold text-[#1F2937]">
                  {summary.kpis.total_schools}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">Schools</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#1F2937]">
                  {summary.kpis.total_students_trained}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">Students</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#1F2937]">
                  {summary.kpis.schools_completed}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">Completed</p>
              </div>
              <div>
                <p className="uwh-mono text-xl font-bold text-[#1F2937]">
                  {summary.kpis.total_districts}
                </p>
                <p className="text-[10px] text-[#9CA3AF]">Districts</p>
              </div>
            </div>
          </div>
        )}

        <Separator className="mb-3 bg-[#E5E7EB]" />

        {/* Auto-refresh note */}
        <p className="mb-3 text-center text-[10px] text-[#D1D5DB]">
          Auto-refreshes every 30s
        </p>

        {/* Download Report */}
        <button
          onClick={() => window.print()}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-[12px] font-medium text-[#4B5563] transition-all hover:bg-[#F3F4F6] hover:text-[#1F2937]"
        >
          <Download className="h-3.5 w-3.5" />
          Download Report
        </button>

        {/* Sign out */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#1F2937]"
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
