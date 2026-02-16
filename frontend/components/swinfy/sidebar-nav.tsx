"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ShieldCheck,
  Image as ImageIcon,
  Lightbulb,
  Sliders,
  Activity,
  LayoutDashboard,
  Eye,
  Users,
  LogOut,
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
  SidebarMenuBadge,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useAdminSummary } from "@/hooks/use-swinfy-data";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/swinfy/dashboard",
    icon: LayoutDashboard,
    badgeKey: null,
  },
  {
    label: "Verification",
    href: "/swinfy/verification",
    icon: ShieldCheck,
    badgeKey: "pending_submissions" as const,
  },
  {
    label: "Photos",
    href: "/swinfy/photos",
    icon: ImageIcon,
    badgeKey: "pending_photos" as const,
  },
  {
    label: "Projects",
    href: "/swinfy/projects",
    icon: Lightbulb,
    badgeKey: "pending_projects" as const,
  },
  {
    label: "UWH Control",
    href: "/swinfy/uwh-control",
    icon: Sliders,
    badgeKey: null,
  },
  {
    label: "Activity Log",
    href: "/swinfy/activity",
    icon: Activity,
    badgeKey: null,
  },
];

const SECONDARY_ITEMS = [
  {
    label: "UWH Preview",
    href: "/swinfy/uwh-preview",
    icon: Eye,
  },
  {
    label: "Trainers",
    href: "/swinfy/trainers",
    icon: Users,
  },
];

export function SwinySidebarNav() {
  const pathname = usePathname();
  const { data: summary } = useAdminSummary();

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
      <SidebarHeader className="border-b border-white/[0.08] px-4 py-3">
        <Link href="/swinfy/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C9A84C] text-[#3D3530]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Swinfy Admin</p>
            <p className="text-[11px] text-[#A89F96]">Control Panel</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-[#A89F96]" style={{ letterSpacing: "0.12em" }}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const badgeCount =
                  item.badgeKey && summary
                    ? summary[item.badgeKey]
                    : 0;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`mb-0.5 rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-[#C9A84C]/15 text-[#E8D48B] font-medium"
                          : "text-[#A89F96] hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-4 w-4 ${isActive ? "text-[#C9A84C]" : ""}`} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {badgeCount > 0 && (
                      <SidebarMenuBadge className="bg-orange-500 text-white">
                        {badgeCount}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-[#A89F96]" style={{ letterSpacing: "0.12em" }}>
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECONDARY_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`mb-0.5 rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-[#C9A84C]/15 text-[#E8D48B] font-medium"
                          : "text-[#A89F96] hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon className={`h-4 w-4 ${isActive ? "text-[#C9A84C]" : ""}`} />
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

      <SidebarFooter className="border-t border-white/[0.08] p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl text-[#A89F96] hover:bg-white/[0.06] hover:text-white"
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
