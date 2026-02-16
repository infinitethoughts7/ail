"use client";

import { signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function UWHHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/UWH_Logo.png"
            alt="UWH Logo"
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
          <div>
            <h1 className="text-sm font-bold sm:text-base">
              AI Literacy Program
            </h1>
            <p className="text-[11px] text-muted-foreground">
              Sponsor Dashboard
            </p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-1 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
