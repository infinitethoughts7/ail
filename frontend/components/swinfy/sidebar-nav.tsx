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
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/swinfy/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Swinfy Admin</p>
            <p className="text-[11px] text-muted-foreground">Control Panel</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
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
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
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
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECONDARY_ITEMS.map((item) => {
                const isActive = pathname.startsWith(item.href);
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

      <SidebarFooter className="border-t p-2">
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
