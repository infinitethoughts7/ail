"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // ── Step 1: Request OTP ───────────────────────────────────────

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/request-otp/`, { email });
      setSuccess("Verification code sent to your email.");
      setStep("otp");
      setCooldown(60);
      // Focus first OTP input after transition
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const data = err.response.data;
        setError(data.detail || data.email?.[0] || "Something went wrong.");
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
        await axios.post(`${API_URL}/api/auth/verify-otp/`, {
          email,
          code,
        });
        setSuccess("Code verified! Set your new password.");
        setStep("password");
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response?.data) {
          setError(err.response.data.detail || "Invalid code.");
        } else {
          setError("Network error. Please try again.");
        }
        // Clear OTP inputs on error
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
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
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const updated = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      updated[i] = pasted[i];
    }
    setOtp(updated);

    // Focus last filled input or submit
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
      await axios.post(`${API_URL}/api/auth/request-otp/`, { email });
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

  // ── Step 3: Reset Password ────────────────────────────────────

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/reset-password/`, {
        email,
        code: otp.join(""),
        new_password: newPassword,
      });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data) {
        setError(err.response.data.detail || "Failed to reset password.");
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
      <div className="glass relative z-10 w-full max-w-sm rounded-2xl p-6 shadow-2xl sm:max-w-[400px] sm:rounded-3xl sm:p-10">
        {/* Header */}
        <div className="mb-6 text-center sm:mb-8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 shadow-lg sm:mb-4 sm:h-14 sm:w-14 sm:rounded-2xl">
            {step === "password" ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:h-7 sm:w-7">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="sm:h-7 sm:w-7">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            )}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            {step === "email" && "Reset password"}
            {step === "otp" && "Enter verification code"}
            {step === "password" && "New password"}
          </h1>
          <p className="mt-1 text-sm text-white/70">
            {step === "email" && "We'll send a code to your email"}
            {step === "otp" && (
              <>
                Sent to{" "}
                <span className="font-medium text-white/90">{email}</span>
              </>
            )}
            {step === "password" && "Choose a strong password"}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {(["email", "otp", "password"] as Step[]).map((s, i) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-white"
                  : i < ["email", "otp", "password"].indexOf(step)
                    ? "w-4 bg-white/60"
                    : "w-4 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* ── Step 1: Email ────────────────────────────────── */}
        {step === "email" && (
          <form onSubmit={handleRequestOTP} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-white/90"
              >
                Email address
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

            {error && <ErrorMessage message={error} />}
            {success && <SuccessMessage message={success} />}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-white text-base font-semibold text-black shadow-lg transition-all active:scale-[0.98] hover:bg-white/90 hover:shadow-xl disabled:opacity-50 sm:h-11 sm:text-sm"
            >
              {loading ? <Spinner text="Sending code..." /> : "Send code"}
            </Button>
          </form>
        )}

        {/* ── Step 2: OTP ──────────────────────────────────── */}
        {step === "otp" && (
          <div className="space-y-4 sm:space-y-5">
            <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
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
              {loading ? <Spinner text="Verifying..." /> : "Verify code"}
            </Button>
          </div>
        )}

        {/* ── Step 3: New Password ─────────────────────────── */}
        {step === "password" && (
          <form
            onSubmit={handleResetPassword}
            className="space-y-4 sm:space-y-5"
          >
            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="new-password"
                className="text-sm font-medium text-white/90"
              >
                New password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

            <div className="space-y-1.5 sm:space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-sm font-medium text-white/90"
              >
                Confirm password
              </Label>
              <Input
                id="confirm-password"
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
              {loading ? (
                <Spinner text="Resetting password..." />
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        )}

        {/* Back to login */}
        <div className="mt-5 text-center sm:mt-6">
          <Link
            href="/login"
            className="text-sm text-white/50 transition-colors active:text-white/70 hover:text-white/80"
          >
            Back to login
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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
      <path d="m2 2 20 20" />
    </svg>
  );
}
