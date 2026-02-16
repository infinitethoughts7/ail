"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Fetch session to get user role for role-based redirect
    const session = await getSession();
    const role = session?.user?.role;

    switch (role) {
      case "admin":
        router.push("/swinfy/verification");
        break;
      case "sponsor":
        router.push("/uwh/dashboard");
        break;
      case "trainer":
        router.push("/trainer/form");
        break;
      default:
        router.push("/login");
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-auto px-4 py-8 sm:py-12">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/ail_banner_3.png"
          alt="AI Literacy Program"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Card */}
      <div className="glass relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-2xl sm:max-w-[400px] sm:rounded-3xl sm:p-10">
        {/* Logo / Brand */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:h-7 sm:w-7"
            >
              <path d="M12 8V4H8" />
              <rect width="16" height="12" x="4" y="8" rx="2" />
              <path d="M2 14h2" />
              <path d="M20 14h2" />
              <path d="M15 13v2" />
              <path d="M9 13v2" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Sign in to AI Literacy Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-white/90">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-12 rounded-xl border-white/25 bg-white/15 text-base text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20 sm:h-11 sm:text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-white/90">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="h-12 rounded-xl border-white/25 bg-white/15 pr-12 text-base text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20 sm:h-11 sm:text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-white/50 transition-colors active:bg-white/10 hover:text-white/80"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/15 px-4 py-3 text-center text-sm text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-white text-base font-semibold text-black shadow-lg transition-all active:scale-[0.98] hover:bg-white/90 hover:shadow-xl disabled:opacity-50 sm:h-11 sm:text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Back to home */}
        <div className="mt-5 text-center sm:mt-6">
          <Link
            href="/"
            className="text-sm text-white/50 transition-colors active:text-white/70 hover:text-white/80"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
