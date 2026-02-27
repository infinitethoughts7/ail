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
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
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
    color: "#7C3AED",
  },
  {
    label: "School Info",
    href: "/trainer/school-info",
    icon: Building2,
    color: "#0EA5E9",
  },
  {
    label: "Submit Session",
    href: "/trainer/form",
    icon: ClipboardEdit,
    color: "#8B5CF6",
  },
  {
    label: "Submissions",
    href: "/trainer/submissions",
    icon: List,
    color: "#10B981",
  },
  {
    label: "Students",
    href: "/trainer/students",
    icon: Users,
    color: "#F59E0B",
  },
  {
    label: "My Gallery",
    href: "/trainer/gallery",
    icon: ImageIcon,
    color: "#EC4899",
  },
  {
    label: "Student Ideas",
    href: "/trainer/projects",
    icon: Lightbulb,
    color: "#F97316",
  },
];

export function TrainerSidebarNav() {
  const pathname = usePathname();
  const { data: profile } = useTrainerProfile();
  const initials = (profile?.username || "T").charAt(0).toUpperCase();

  return (
    <Sidebar
      className="border-r border-[#F3F4F6]"
      style={{
        ["--sidebar" as string]: "#FFFFFF",
        ["--sidebar-foreground" as string]: "#1F2937",
        ["--sidebar-accent" as string]: "#7C3AED",
        ["--sidebar-accent-foreground" as string]: "#FFFFFF",
        ["--sidebar-border" as string]: "#F3F4F6",
        ["--sidebar-primary" as string]: "#7C3AED",
        ["--sidebar-primary-foreground" as string]: "#FFFFFF",
      }}
    >
      {/* Banner + centered profile */}
      <div className="relative">
        {/* Decorative banner */}
        <div className="relative h-24 overflow-hidden bg-gradient-to-br from-violet-500 via-indigo-500 to-violet-600">
          {/* Wave decoration */}
          <svg
            className="absolute -bottom-px left-0 w-full text-white"
            viewBox="0 0 400 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0 20 Q100 0 200 20 Q300 40 400 20 L400 40 L0 40Z"
              fill="currentColor"
            />
          </svg>
          {/* Subtle floating circles */}
          <div className="absolute -left-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
          <div className="absolute -right-4 top-2 h-14 w-14 rounded-full bg-white/[0.07]" />
        </div>

        {/* Profile photo — overlapping the banner */}
        <div className="flex flex-col items-center -mt-10 relative z-10 pb-4">
          <Link href="/trainer/dashboard">
            {profile?.profile_photo_url ? (
              <img
                src={profile.profile_photo_url}
                alt={profile.username}
                className="h-[72px] w-[72px] rounded-full border-[3px] border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold text-white shadow-lg">
                {initials}
              </div>
            )}
          </Link>
          <p className="mt-2 text-sm font-semibold text-[#1F2937]" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            {profile?.username || "Trainer"}
          </p>
          <p className="text-[11px] text-[#9CA3AF]">
            {profile?.assigned_school?.name || "No school assigned"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <SidebarContent className="px-3 pt-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`rounded-xl px-3 py-2.5 transition-all ${
                        isActive
                          ? "bg-[#7C3AED] text-white font-semibold shadow-md shadow-violet-200 hover:bg-[#6D28D9]"
                          : "bg-transparent text-[#4B5563] hover:bg-[#F9FAFB]"
                      }`}
                      style={isActive ? {
                        ["--sidebar-accent" as string]: "#7C3AED",
                        ["--sidebar-accent-foreground" as string]: "#FFFFFF",
                      } : undefined}
                    >
                      <Link href={item.href}>
                        <item.icon
                          className="h-[18px] w-[18px]"
                          style={{ color: isActive ? "#FFFFFF" : item.color }}
                        />
                        <span style={{ fontFamily: "'Georgia', 'Times New Roman', serif", letterSpacing: "0.01em" }}>
                          {item.label}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-[#F3F4F6] p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl text-[#9CA3AF] hover:bg-red-50 hover:text-red-500"
            >
              <LogOut className="h-[18px] w-[18px]" />
              <span style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
