"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ClipboardEdit,
  List,
  Users,
  Lightbulb,
  ImageIcon,
  LogOut,
  GraduationCap,
  Building2,
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
import { useTrainerProfile } from "@/hooks/use-trainer-data";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/trainer/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "School Info",
    href: "/trainer/school-info",
    icon: Building2,
  },
  {
    label: "Submit Session",
    href: "/trainer/form",
    icon: ClipboardEdit,
  },
  {
    label: "Submissions",
    href: "/trainer/submissions",
    icon: List,
  },
  {
    label: "Students",
    href: "/trainer/students",
    icon: Users,
  },
  {
    label: "My Gallery",
    href: "/trainer/gallery",
    icon: ImageIcon,
  },
  {
    label: "Student Ideas",
    href: "/trainer/projects",
    icon: Lightbulb,
  },
];

export function TrainerSidebarNav() {
  const pathname = usePathname();
  const { data: profile } = useTrainerProfile();

  return (
    <Sidebar
      className="border-r-0"
      style={{
        ["--sidebar" as string]: "#0F4C4C",
        ["--sidebar-foreground" as string]: "#E0F2F1",
        ["--sidebar-accent" as string]: "#1A5F5F",
        ["--sidebar-accent-foreground" as string]: "#FFFFFF",
        ["--sidebar-border" as string]: "rgba(255,255,255,0.08)",
        ["--sidebar-primary" as string]: "#2DD4A8",
        ["--sidebar-primary-foreground" as string]: "#0F4C4C",
      }}
    >
      <SidebarHeader className="border-b border-white/[0.08] px-4 py-3">
        <Link href="/trainer/dashboard" className="flex items-center gap-3">
          {profile?.profile_photo_url ? (
            <img
              src={profile.profile_photo_url}
              alt={profile.username}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-[#2DD4A8]/30"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2DD4A8] text-[#0F4C4C]">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {profile?.username || "Trainer"}
            </p>
            <p className="truncate text-[11px] text-[#80CBC4]">
              {profile?.assigned_school?.name || "No school assigned"}
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-[10px] text-[#80CBC4]"
            style={{ letterSpacing: "0.12em" }}
          >
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`mb-0.5 rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-[#2DD4A8]/15 text-[#A7F3D0] font-medium"
                          : "text-[#80CBC4] hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-[#2DD4A8]" : ""}`}
                        />
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
              className="rounded-xl text-[#80CBC4] hover:bg-white/[0.06] hover:text-white"
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
