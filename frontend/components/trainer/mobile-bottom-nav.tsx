"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardEdit,
  List,
  Users,
  ImageIcon,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/trainer/dashboard", icon: LayoutDashboard },
  { label: "Submit", href: "/trainer/form", icon: ClipboardEdit },
  { label: "Reports", href: "/trainer/submissions", icon: List },
  { label: "Students", href: "/trainer/students", icon: Users },
  { label: "Gallery", href: "/trainer/gallery", icon: ImageIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/95 backdrop-blur-lg md:hidden dark:bg-gray-950/95">
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-[#0F4C4C]"
                  : "text-muted-foreground active:text-foreground"
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                  isActive
                    ? "bg-[#2DD4A8]/15 text-[#0F4C4C]"
                    : ""
                }`}
              >
                <item.icon
                  className={`h-[18px] w-[18px] ${isActive ? "stroke-[2.5px]" : ""}`}
                />
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
