"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Step = "form" | "otp" | "success";

interface PublicSchool {
  id: string;
  name: string;
  district_name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("form");

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [schools, setSchools] = useState<PublicSchool[]>([]);

  // OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = useState(0);

  // UI state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Tokens from verify response (for auto-login)
  const [authTokens, setAuthTokens] = useState<{
    access: string;
    refresh: string;
    user: { email: string; role: string };
  } | null>(null);

  // Fetch schools on mount
  useEffect(() => {
    axios
      .get(`${API_URL}/api/auth/public-schools/`)
      .then((res) => setSchools(res.data))
      .catch(() => {});
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ── Step 1: Register ──────────────────────────────────────────

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!selectedSchool) {
      setError("Please select a school.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/trainer-register/`, {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        school: selectedSchool,
      });
      setSuccess("Verification code sent to your email.");
      setStep("otp");
      setCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        // Handle field-level errors
        const fieldError =
          data.email?.[0] ||
          data.school?.[0] ||
          data.first_name?.[0] ||
          data.password?.[0];
        setError(data.detail || fieldError || "Registration failed.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────

  const submitOTP = useCallback(
    async (code: string) => {
      setError("");
      setLoading(true);

      try {
        const res = await axios.post(
          `${API_URL}/api/auth/verify-registration/`,
          { email, code }
        );
        setAuthTokens(res.data);
        setSuccess("Email verified! Signing you in...");
        setStep("success");

        // Auto-login via next-auth
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.ok) {
          router.push("/trainer/form");
        } else {
          // Fallback — account is verified, redirect to login
          setSuccess("Email verified! Please sign in.");
          setTimeout(() => router.push("/login"), 2000);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data) {
          setError(err.response.data.detail || "Invalid code.");
        } else {
          setError("Network error. Please try again.");
        }
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } finally {
        setLoading(false);
      }
    },
    [email, password, router]
  );

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (value && index === 5) {
      const code = updated.join("");
      if (code.length === 6) {
        submitOTP(code);
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;

    const updated = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtp(updated);

    if (pasted.length === 6) {
      submitOTP(pasted);
    } else {
      otpRefs.current[pasted.length]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (cooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/resend-registration-otp/`, {
        email,
      });
      setSuccess("New code sent to your email.");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError(err.response.data.detail || "Failed to resend code.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────

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

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/20 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl sm:max-w-[420px] sm:rounded-3xl sm:p-10" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
            {step === "success" ? (
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
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            ) : (
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {step === "form" && "Trainer Registration"}
            {step === "otp" && "Verify your email"}
            {step === "success" && "You're all set!"}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {step === "form" && "Create your AI Literacy trainer account"}
            {step === "otp" && (
              <>
                Code sent to{" "}
                <span className="font-medium text-white/90">{email}</span>
              </>
            )}
            {step === "success" && "Redirecting to your dashboard..."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {(["form", "otp", "success"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-white"
                  : i < ["form", "otp", "success"].indexOf(step)
                    ? "w-4 bg-white/60"
                    : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* ── Step 1: Registration Form ────────────────── */}
        {step === "form" && (
          <form
            onSubmit={handleRegister}
            className="space-y-4 sm:space-y-5"
            autoComplete="on"
          >
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-white/90"
                >
                  First name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  className="h-12 rounded-xl border-white/25 bg-white/15 text-base text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20 sm:h-11 sm:text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-white/90"
                >
                  Last name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Optional"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  className="h-12 rounded-xl border-white/25 bg-white/15 text-base text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20 sm:h-11 sm:text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-white/90"
              >
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-12 rounded-xl border-white/25 bg-white/15 text-base text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20 sm:h-11 sm:text-sm"
              />
            </div>

            {/* School dropdown */}
            <div className="space-y-1.5">
              <Label
                htmlFor="school"
                className="text-sm font-medium text-white/90"
              >
                School
              </Label>
              <select
                id="school"
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                required
                className="h-12 w-full appearance-none rounded-xl border border-white/25 bg-white/15 px-3 text-base text-white outline-none focus:border-white/40 focus:ring-2 focus:ring-white/20 sm:h-11 sm:text-sm [&>option]:bg-zinc-900 [&>option]:text-white"
              >
                <option value="" disabled>
                  Select your school
                </option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.district_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-white/90"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-white/90"
              >
                Confirm password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className="h-12 rounded-xl border-white/25 bg-white/15 text-base text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-white/20 sm:h-11 sm:text-sm"
              />
            </div>

            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-white text-base font-semibold text-black shadow-lg transition-all active:scale-[0.98] hover:bg-white/90 hover:shadow-xl disabled:opacity-50 sm:h-11 sm:text-sm"
            >
              {loading ? <Spinner text="Creating account..." /> : "Register"}
            </Button>
          </form>
        )}

        {/* ── Step 2: OTP ──────────────────────────────── */}
        {step === "otp" && (
          <div className="space-y-4 sm:space-y-5">
            <div
              className="flex justify-center gap-2 sm:gap-3"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading}
                  className="h-13 w-11 rounded-xl border border-white/25 bg-white/15 text-center text-xl font-bold text-white caret-white outline-none transition-colors focus:border-white/60 focus:ring-2 focus:ring-white/20 disabled:opacity-50 sm:h-12 sm:w-10 sm:text-lg"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={cooldown > 0 || loading}
                className="text-sm text-white/60 transition-colors hover:text-white/90 disabled:cursor-not-allowed disabled:text-white/30"
              >
                {cooldown > 0
                  ? `Resend code in ${cooldown}s`
                  : "Resend code"}
              </button>
            </div>

            <Button
              type="button"
              onClick={() => {
                const code = otp.join("");
                if (code.length === 6) submitOTP(code);
              }}
              disabled={loading || otp.join("").length < 6}
              className="h-12 w-full rounded-xl bg-white text-base font-semibold text-black shadow-lg transition-all active:scale-[0.98] hover:bg-white/90 hover:shadow-xl disabled:opacity-50 sm:h-11 sm:text-sm"
            >
              {loading ? <Spinner text="Verifying..." /> : "Verify & Sign in"}
            </Button>
          </div>
        )}

        {/* ── Step 3: Success ──────────────────────────── */}
        {step === "success" && (
          <div className="space-y-4 text-center sm:space-y-5">
            <SuccessMessage message={success || "Email verified successfully!"} />
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
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
              Redirecting to dashboard...
            </div>
          </div>
        )}

        {/* Back to login */}
        <div className="mt-5 text-center sm:mt-6">
          <Link
            href="/login"
            className="text-sm text-white/50 transition-colors active:text-white/70 hover:text-white/80"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Shared UI Components ──────────────────────────────────────────

function Spinner({ text }: { text: string }) {
  return (
    <span className="flex items-center gap-2">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
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
      {text}
    </span>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-500/15 px-4 py-3 text-center text-sm text-red-200">
      {message}
    </div>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-emerald-500/15 px-4 py-3 text-center text-sm text-emerald-200">
      {message}
    </div>
  );
}

function EyeIcon() {
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
    >
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
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
    >
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
