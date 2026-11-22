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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Active persona: Default to STUDENT
  const [selectedRole, setSelectedRole] = useState<"STUDENT" | "INSTITUTION" | "EMPLOYER" | "ADMIN">("STUDENT");
  const [showOrgLogin, setShowOrgLogin] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your registered personal or academic email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g. name@gmail.com).");
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
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
      setErrorMessage("Demo accounts and shortcuts are disabled in this environment.");
      return;
    }
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
      {/* LEFT PANEL: Premium Illustrated Brand & Student Highlights (5 cols on lg) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        {/* Subtle Ambient Background Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFC66B] via-[#FFA94D] to-[#F59E0B] text-[#1E0F2B] font-extrabold shadow-soft-md group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="font-heading text-2xl font-black tracking-tight text-white block">
                KAABIL <span className="text-[#FFC66B] text-sm font-normal">| काबिल</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Discover Your Career. Define Your Future.
              </span>
            </div>
          </Link>
        </div>

        {/* Central Illustrated Feature Visual */}
        <div className="relative z-10 my-auto py-8 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFC66B]/20 text-[#FFC66B] border border-[#FFC66B]/30">
              <Compass className="h-3.5 w-3.5" /> 100% Free Career Guidance
            </span>
            <h2 className="font-heading text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              One Friendly Space for Your Entire Future.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              No stress, no pressure. Explore careers across Science, Commerce, Arts, Design, Law, and more at your own pace.
            </p>
          </div>

          {/* Value Highlight Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Compass className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Find My Career</h4>
                <p className="text-xs text-slate-400">100+ verified career pathways with salary trends and courses.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-[#FFC66B]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Trilingual AI Career Mentor</h4>
                <p className="text-xs text-slate-400">Friendly guidance in English, हिन्दी, and Hinglish.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Student Safe (DPDP Act 2023)</h4>
                <p className="text-xs text-slate-400">School students are fully protected. Zero unsolicited recruiter ads.</p>
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

      {/* RIGHT PANEL: Clean, Student-Centric Authentication (7 cols on lg) */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-10">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-border">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FFC66B] to-[#FFA94D] flex items-center justify-center text-[#1E0F2B] font-bold">
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
            <div className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 bg-white text-purple-900 shadow-soft-sm border border-slate-200">
              <Lock className="h-3.5 w-3.5 text-purple-700" />
              <span>Sign In</span>
            </div>
            <Link
              href="/register"
              className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition-all hover:bg-white/60"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Create Account</span>
            </Link>
          </div>

          {/* Header Title */}
          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedRole === "STUDENT" ? "Student Sign In" : `${selectedRole} Portal Sign In`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {selectedRole === "STUDENT"
                ? "Enter your personal email to continue your guided career journey."
                : "Sign in with your registered institutional credentials."}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Primary Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 block">
                {selectedRole === "STUDENT" ? "Personal or Academic Email" : "Registered Email Address"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    selectedRole === "STUDENT"
                      ? "e.g. yourname@gmail.com"
                      : selectedRole === "INSTITUTION"
                      ? "e.g. dean@university.edu.in"
                      : selectedRole === "EMPLOYER"
                      ? "e.g. talent@company.com"
                      : "admin@kaabil.in"
                  }
                  required
                  autoComplete="email"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:border-purple-600 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 block">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-purple-700 hover:underline font-semibold"
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
                  autoComplete="current-password"
                  className="pl-10 pr-10 h-11 rounded-xl border-slate-200 focus:border-purple-600 text-sm"
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
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 h-4 w-4"
                />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm shadow-md gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* GUEST EXPLORATION OPTION (TASK 3 REQUIREMENT) */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-[#F8FAFC] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                Or explore without signing in
              </span>
            </div>

            <Link href="/careers" className="block w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 rounded-xl border-purple-200 bg-white hover:bg-purple-50/70 text-purple-900 font-bold text-xs gap-2 shadow-xs transition-all"
              >
                <Compass className="h-4 w-4 text-amber-500" />
                <span>Continue as Guest (Explore 100+ Careers)</span>
              </Button>
            </Link>
          </div>

          {/* SECONDARY SECTION: INSTITUTION, EMPLOYER & ADMIN ACCESS (TASK 3 REQUIREMENT) */}
          <div className="pt-2 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => setShowOrgLogin(!showOrgLogin)}
              className="w-full py-2 flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>Are you a College, Employer, or Admin?</span>
              </div>
              {showOrgLogin ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showOrgLogin && (
              <div className="mt-2.5 p-3 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Select Portal Persona:
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "INSTITUTION", label: "College", icon: <Building2 className="h-3.5 w-3.5" /> },
                    { id: "EMPLOYER", label: "Employer", icon: <Briefcase className="h-3.5 w-3.5" /> },
                    { id: "ADMIN", label: "Admin", icon: <Lock className="h-3.5 w-3.5" /> },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => {
                        setSelectedRole(role.id as any);
                        setErrorMessage(null);
                      }}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        selectedRole === role.id
                          ? "bg-purple-700 text-white shadow-xs"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      {role.icon}
                      <span>{role.label}</span>
                    </button>
                  ))}
                </div>
                {selectedRole !== "STUDENT" && (
                  <button
                    type="button"
                    onClick={() => setSelectedRole("STUDENT")}
                    className="text-[11px] text-purple-700 hover:underline font-semibold block pt-1"
                  >
                    &larr; Switch back to Student Sign In
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Demo Personas Sandbox (Active only in explicit demo testing environments) */}
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <div className="pt-2 border-t border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold uppercase tracking-wider text-slate-400">
                  1-Click Demo Testing
                </span>
                <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-semibold border border-purple-200">
                  Sandbox
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin("demo.student@kaabil.in", "/student/dashboard")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 text-xs font-semibold text-slate-700 hover:text-purple-900 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
                  <span>Student Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin("institution@kaabil.in", "/institution/dashboard")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 text-xs font-semibold text-slate-700 hover:text-indigo-900 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Building2 className="h-3.5 w-3.5 text-indigo-600" />
                  <span>College Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin("employer@kaabil.in", "/employer/dashboard")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-sky-50 text-xs font-semibold text-slate-700 hover:text-sky-900 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Briefcase className="h-3.5 w-3.5 text-sky-600" />
                  <span>Employer Demo</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoQuickLogin("admin@kaabil.in", "/admin/dashboard")}
                  disabled={isLoading}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Lock className="h-3.5 w-3.5 text-slate-600" />
                  <span>Admin Demo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
