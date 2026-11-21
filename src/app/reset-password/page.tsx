"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { evaluatePasswordStrengthClient } from "@/lib/auth/client-password";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const passwordEvaluation = evaluatePasswordStrengthClient(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage("Reset token is missing or invalid. Please request a new reset link.");
      return;
    }

    if (!email) {
      setErrorMessage("Email address is required.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          token,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
      setIsLoading(false);
    } catch {
      setErrorMessage("Network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3 text-left">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Invalid Reset Link</span>
            <p className="text-[11px] leading-relaxed mt-0.5">
              This password reset link is missing a valid verification token or has already expired.
            </p>
          </div>
        </div>
        <Link href="/forgot-password">
          <Button variant="gradient" className="w-full">
            Request New Reset Link
          </Button>
        </Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3 text-left">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Password Successfully Updated</span>
            <p className="text-[11px] leading-relaxed mt-0.5">
              Your password has been changed securely. All previous sessions have been invalidated.
            </p>
          </div>
        </div>
        <Button
          variant="gradient"
          className="w-full"
          onClick={() => router.push("/login")}
        >
          <span>Sign In With New Password</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Error</span>
            <p className="text-[11px] leading-relaxed mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div>
        <Input
          label="Account Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            label="New Password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-text-muted hover:text-text-primary p-1 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {newPassword.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-text-secondary">Strength:</span>
              <span
                className={`font-bold ${
                  passwordEvaluation.label === "Strong"
                    ? "text-emerald-600"
                    : passwordEvaluation.label === "Fair"
                    ? "text-amber-600"
                    : "text-rose-600"
                }`}
              >
                {passwordEvaluation.label}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-full flex-1 transition-all rounded-full ${
                    step <= passwordEvaluation.score
                      ? passwordEvaluation.score >= 4
                        ? "bg-emerald-500"
                        : passwordEvaluation.score === 3
                        ? "bg-amber-500"
                        : "bg-rose-500"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <Input
          label="Confirm New Password"
          type={showPassword ? "text" : "password"}
          placeholder="Repeat your new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        variant="gradient"
        className="w-full py-3"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating Password...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <KeyRound className="h-4 w-4" />
            <span>Set New Password</span>
          </div>
        )}
      </Button>

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-text-secondary hover:text-text-primary">
          Back to Sign In
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-soft-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="font-heading text-2xl font-extrabold tracking-tight text-text-primary">
            KAABIL
          </span>
        </Link>
        <h1 className="font-heading text-2xl font-bold text-text-primary">
          Create New Password
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          Enter your new secure password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 border-border bg-white shadow-soft-md rounded-3xl">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12 text-xs text-text-muted">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Loading parameters...
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
