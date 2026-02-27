"use client";

import { useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

interface TrainerHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function TrainerHeader({ title, children }: TrainerHeaderProps) {
  const { toggleSidebar } = useSidebar();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 48 && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-10 flex h-12 items-center justify-between px-4 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={() => toggleSidebar()}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#6B7280] hover:text-[#1F2937] transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1
          className="text-lg font-bold text-[#1F2937]"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
        >
          {title}
        </h1>
      </div>
      {children}
    </header>
  );
}
