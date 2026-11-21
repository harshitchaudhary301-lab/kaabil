"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Award,
  Compass,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN">("STUDENT");
  // Clean default: inputs are strictly EMPTY by default. No demo or hardcoded credentials.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Switch role context without overwriting user input
  const handleRoleSelect = (role: "STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN") => {
    setSelectedRole(role);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g., name@example.com).");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid email or password.");
      }

      // Route user according to role & onboarding status
      const user = data.user;
      if (user.role === "STUDENT") {
        if (user.studentProfile?.onboardingCompleted) {
          router.push("/student/dashboard");
        } else {
          router.push("/onboarding");
        }
      } else if (user.role === "INSTITUTION_ADMIN" || user.role === "FACULTY") {
        router.push("/institution/dashboard");
      } else if (user.role === "EMPLOYER_ADMIN" || user.role === "RECRUITER") {
        router.push("/employer/dashboard");
      } else if (user.role === "SUPER_ADMIN" || user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated demo persona access (strictly isolated from real user form inputs)
  const handleDemoQuickLogin = async (demoEmail: string, destination: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "Kaabil@2026", rememberMe: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Demo authentication failed.");
      }
      router.push(destination);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
      {/* LEFT PANEL: Premium Illustrated Brand & Feature Showcase (5 cols on lg) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        {/* Subtle Ambient Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white shadow-soft-md group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="font-heading text-2xl font-black tracking-tight text-white block">
                KAABIL <span className="text-accent text-sm font-normal">| काबिल</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Every Stream. Every Skill. Every Future.
              </span>
            </div>
          </Link>
        </div>

        {/* Central Illustrated Feature Visual */}
        <div className="relative z-10 my-auto py-12 space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-accent border border-primary/30">
              <Compass className="h-3.5 w-3.5" /> Universal Career Intelligence
            </span>
            <h2 className="font-heading text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              One Unified Account for Your Entire Professional Horizon.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Whether you are discovering career pathways in school, verifying competency milestones in college, or scouting certified talent for industry roles.
            </p>
          </div>

          {/* Value Highlight Grid */}
          <div className="grid grid-cols-1 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Digital Skill Passport</h4>
                <p className="text-xs text-slate-400">HMAC-SHA256 cryptographically verified competence evidence.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Trilingual AI Career Mentor</h4>
                <p className="text-xs text-slate-400">Grounding in English, हिन्दी, and Hinglish with zero hallucination.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">DPDP Act (2023) Safeguards</h4>
                <p className="text-xs text-slate-400">Minors under 18 shielded from recruiter commercialization.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Supported across all 13 educational streams</span>
          <span className="flex items-center gap-1 text-slate-300 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Safe &amp; Verified
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Clean Authentication & Role Selector (7 cols on lg) */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-12">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-border">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="font-heading font-black text-xl text-text-primary">KAABIL</span>
            </Link>
            <Link href="/" className="text-xs text-text-secondary hover:text-text-primary flex items-center gap-1 font-semibold">
              <ArrowLeft className="h-3 w-3" /> Home
            </Link>
          </div>

          {/* Auth Switcher: Toggle between Sign In and Create Account */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
            <div className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 bg-white text-primary shadow-soft-sm border border-slate-200">
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </div>
            <Link
              href="/register"
              className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition-all hover:bg-white/60"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </Link>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-heading text-3xl font-extrabold text-text-primary tracking-tight">
              Sign In to Your Portal
            </h1>
            <p className="text-xs text-text-secondary">
              Select your persona and enter your account credentials to access your workspace.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Portal Persona
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80">
              {[
                { id: "STUDENT", label: "Student", icon: <GraduationCap className="h-3.5 w-3.5" /> },
                { id: "INSTITUTION", label: "College", icon: <Building2 className="h-3.5 w-3.5" /> },
                { id: "EMPLOYER", label: "Employer", icon: <Briefcase className="h-3.5 w-3.5" /> },
                { id: "ADMIN", label: "Admin", icon: <Lock className="h-3.5 w-3.5" /> },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id as any)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                    selectedRole === role.id
                      ? "bg-white text-primary shadow-soft-sm border border-slate-200"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/50"
                  }`}
                >
                  {role.icon}
                  <span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-primary block">
                Official or Registered Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === "STUDENT"
                      ? "name@example.com"
                      : selectedRole === "INSTITUTION"
                      ? "dean@university.edu.in"
                      : selectedRole === "EMPLOYER"
                      ? "talent@company.com"
                      : "admin@kaabil.in"
                  }
                  required
                  autoComplete="off"
                  className="pl-10 h-11 rounded-xl border-border focus:border-primary text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-text-primary block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 rounded-xl border-border focus:border-primary text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="gradient"
              className="w-full h-12 rounded-xl font-bold text-sm shadow-soft-md gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <span>
                    Sign In to {selectedRole === "STUDENT" ? "Student" : selectedRole === "INSTITUTION" ? "College" : selectedRole === "EMPLOYER" ? "Employer" : "Admin"} Portal
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Direct Link to Registration */}
          <div className="pt-2 text-center border-t border-border space-y-2">
            <p className="text-xs text-text-secondary">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-bold text-primary hover:underline">
                Create a Free Account &rarr;
              </Link>
            </p>
            <p className="text-[11px] text-slate-400 leading-normal">
              100% Free Core for Students • Secondary Minor Protection (DPDP Act 2023)
            </p>
          </div>

          {/* Separate Demo Persona Access (Isolated from Form Inputs) */}
          <div className="pt-4 border-t border-slate-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Demo Persona Quick Access
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold border border-purple-200">
                Testing Sandbox
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoQuickLogin("demo.student@kaabil.in", "/student/dashboard")}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 text-xs font-semibold text-slate-700 hover:text-purple-900 transition-all flex items-center justify-center gap-1.5"
              >
                <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                <span>Student Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoQuickLogin("institution@kaabil.in", "/institution/dashboard")}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-semibold text-slate-700 hover:text-indigo-900 transition-all flex items-center justify-center gap-1.5"
              >
                <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                <span>College Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoQuickLogin("employer@kaabil.in", "/employer/dashboard")}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-xs font-semibold text-slate-700 hover:text-sky-900 transition-all flex items-center justify-center gap-1.5"
              >
                <Briefcase className="h-3.5 w-3.5 text-sky-600" />
                <span>Employer Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoQuickLogin("admin@kaabil.in", "/admin/dashboard")}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="h-3.5 w-3.5 text-slate-600" />
                <span>Admin Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
