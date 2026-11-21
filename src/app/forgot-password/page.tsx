"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, KeyRound, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    resetUrl?: string | null;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Unable to process password reset request.");
        setIsLoading(false);
        return;
      }

      setSuccessInfo({
        message: data.message,
        resetUrl: data.resetUrl,
      });
      setIsLoading(false);
    } catch {
      setErrorMessage("Network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

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
          Reset Your Password
        </h1>
        <p className="mt-1 text-xs text-text-secondary">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="p-6 sm:p-8 border-border bg-white shadow-soft-md rounded-3xl">
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Reset Request Failed</span>
                <p className="text-[11px] leading-relaxed mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Request Generated</span>
                  <p className="text-[11px] leading-relaxed mt-0.5">{successInfo.message}</p>
                </div>
              </div>

              {successInfo.resetUrl && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Development Mode Reset Link</span>
                      <p className="text-[11px] leading-relaxed text-amber-800 mt-0.5">
                        External SMTP is unconfigured. As per Section 3 security specifications, below is your verified one-time reset link:
                      </p>
                    </div>
                  </div>
                  <Link href={successInfo.resetUrl} className="block">
                    <Button variant="gradient" className="w-full text-xs">
                      <span>Click to Reset Password Now</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login" className="block text-center text-xs text-primary font-semibold hover:underline">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Input
                  label="Registered Email Address"
                  type="email"
                  placeholder="e.g. aryan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    <span>Send Reset Instructions</span>
                  </div>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
