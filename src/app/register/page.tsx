"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Shield,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  Compass,
  ArrowLeft,
  Award,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evaluatePasswordStrengthClient } from "@/lib/auth/client-password";

export default function RegisterPage() {
  const router = useRouter();

  // Role Tab
  const [role, setRole] = useState<"STUDENT" | "INSTITUTION_ADMIN" | "EMPLOYER_ADMIN">("STUDENT");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Student-specific fields
  const [educationStage, setEducationStage] = useState<string>("CLASS_12");
  const [guardianConsent, setGuardianConsent] = useState(false);

  // Institution & Employer fields
  const [organizationName, setOrganizationName] = useState("");
  const [orgType, setOrgType] = useState<string>("COLLEGE_UNIVERSITY");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Minor evaluation
  const isMinor =
    role === "STUDENT" &&
    ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(educationStage);

  const passwordEvaluation = evaluatePasswordStrengthClient(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!termsAgreed) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy to register.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (isMinor && !guardianConsent) {
      setErrorMessage("Parent or legal guardian consent is required under DPDP Act 2023 for school students.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        role,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      };

      if (role === "STUDENT") {
        payload.educationStage = educationStage;
        payload.guardianConsent = isMinor ? guardianConsent : true;
        if (city) payload.city = city.trim();
        if (stateName) payload.state = stateName.trim();
      } else {
        payload.organizationName = organizationName.trim();
        payload.orgType = orgType;
        payload.city = city.trim() || "New Delhi";
        payload.state = stateName.trim() || "Delhi";
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed. Please review your details.");
        setIsLoading(false);
        return;
      }

      // Success routing
      if (role === "STUDENT") {
        router.push("/onboarding");
      } else if (role === "INSTITUTION_ADMIN") {
        router.push("/institution/dashboard");
      } else {
        router.push("/employer/dashboard");
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F8FAFC]">
      {/* LEFT PANEL: Illustrated Feature Showcase */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Brand */}
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

        {/* Illustrated Copy */}
        <div className="relative z-10 my-auto py-10 space-y-6">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5" /> DPDP Act 2023 Compliant Core
            </span>
            <h2 className="font-heading text-3xl xl:text-4xl font-extrabold text-white leading-tight">
              Begin Your Verified Skill Journey Today.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Join thousands of learners and educators across India discovering authentic career pathways with personalized AI guidance.
            </p>
          </div>

          {/* 3 Step Roadmap Preview */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/30 flex items-center justify-center font-bold text-xs text-accent">
                01
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Create Your Account</h4>
                <p className="text-[11px] text-slate-400">Select your educational stage or institutional affiliation.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/30 flex items-center justify-center font-bold text-xs text-purple-300">
                02
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Initialize Career Digital Twin</h4>
                <p className="text-[11px] text-slate-400">Connect your subjects and discover baseline readiness index.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-300">
                03
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Unlock Digital Skill Passport</h4>
                <p className="text-[11px] text-slate-400">Mint cryptographically anchored credentials with evidence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Zero Recruiter Commercialization for Minors</span>
          <span className="text-slate-300 font-medium">100% Free Core</span>
        </div>
      </div>

      {/* RIGHT PANEL: Registration Form */}
      <div className="lg:col-span-7 flex flex-col justify-center px-6 sm:px-12 xl:px-20 py-10">
        <div className="max-w-xl w-full mx-auto space-y-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-border">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-heading font-black text-lg text-text-primary">KAABIL</span>
            </Link>
            <Link href="/login" className="text-xs text-primary font-bold">
              Sign In →
            </Link>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Create Your KAABIL Account
            </h1>
            <p className="text-xs text-text-secondary">
              Select your persona to get started with a customized workspace.
            </p>
          </div>

          {/* Role Choice Tabs */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
            {[
              { id: "STUDENT", label: "Student Learner", icon: <GraduationCap className="h-4 w-4" /> },
              { id: "INSTITUTION_ADMIN", label: "College / School", icon: <Building2 className="h-4 w-4" /> },
              { id: "EMPLOYER_ADMIN", label: "Corporate Employer", icon: <Briefcase className="h-4 w-4" /> },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRole(r.id as "STUDENT" | "INSTITUTION_ADMIN" | "EMPLOYER_ADMIN");
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                  role === r.id
                    ? "bg-white text-primary shadow-soft-sm border border-slate-200"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {r.icon}
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Common Name */}
            <div>
              <Input
                label={role === "STUDENT" ? "Full Legal Name" : "Authorized Representative Name"}
                type="text"
                placeholder={role === "STUDENT" ? "e.g. Aryan Sharma" : "e.g. Dr. Priya Raman"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            {/* Common Email */}
            <div>
              <Input
                label={
                  role === "STUDENT"
                    ? "Personal Email Address"
                    : role === "INSTITUTION_ADMIN"
                    ? "Institutional Official Email"
                    : "Corporate Work Email"
                }
                type="email"
                placeholder={
                  role === "STUDENT"
                    ? "you@example.com"
                    : role === "INSTITUTION_ADMIN"
                    ? "dean@university.edu.in"
                    : "talent@company.com"
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl"
              />
            </div>

            {/* Organization Specific Fields */}
            {role !== "STUDENT" && (
              <>
                <div>
                  <Input
                    label={role === "INSTITUTION_ADMIN" ? "Institution Name" : "Company / Enterprise Name"}
                    type="text"
                    placeholder={
                      role === "INSTITUTION_ADMIN"
                        ? "e.g. Delhi Technological University"
                        : "e.g. Apex Diagnostics Ltd."
                    }
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Organization Type
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-11"
                    >
                      {role === "INSTITUTION_ADMIN" ? (
                        <>
                          <option value="COLLEGE_UNIVERSITY">College / University</option>
                          <option value="SCHOOL">School (Class 8–12)</option>
                          <option value="VOCATIONAL_INSTITUTE">Polytechnic / ITI / Skill Center</option>
                        </>
                      ) : (
                        <>
                          <option value="CORPORATE_EMPLOYER">Corporate Employer</option>
                          <option value="HEALTHCARE_ORG">Healthcare / Hospital Group</option>
                          <option value="LEGAL_FIRM">Legal Firm / Practice</option>
                          <option value="GOVERNMENT_PSU">Government / PSU</option>
                          <option value="NON_PROFIT">Non-Profit / NGO</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="City"
                      type="text"
                      placeholder="e.g. Delhi"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <Input
                      label="State"
                      type="text"
                      placeholder="e.g. Delhi"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Student Specific Fields */}
            {role === "STUDENT" && (
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  Current Education Stage
                </label>
                <select
                  value={educationStage}
                  onChange={(e) => setEducationStage(e.target.value)}
                  className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-11"
                >
                  <option value="CLASS_8">Class 8 (Secondary School)</option>
                  <option value="CLASS_9">Class 9 (Secondary School)</option>
                  <option value="CLASS_10">Class 10 (Secondary School)</option>
                  <option value="CLASS_11">Class 11 (Senior Secondary)</option>
                  <option value="CLASS_12">Class 12 (Senior Secondary)</option>
                  <option value="DIPLOMA">Polytechnic / Diploma</option>
                  <option value="ITI">ITI Technical Trade</option>
                  <option value="UNDERGRADUATE">Undergraduate (BA, BSc, BTech, BCom, etc.)</option>
                  <option value="POSTGRADUATE">Postgraduate (MA, MSc, MTech, MBA, etc.)</option>
                  <option value="WORKING_PROFESSIONAL">Working Professional / Career Transition</option>
                  <option value="OTHER">Other Learning Stream</option>
                </select>
              </div>
            )}

            {/* Password Field with Toggle & Strength */}
            <div className="space-y-1.5">
              <div className="relative">
                <Input
                  label="Password (minimum 8 characters)"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-8 text-text-muted hover:text-text-primary p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary">Password Strength:</span>
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

            {/* DPDP Act Minor Shield Alert */}
            {isMinor && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">DPDP Act 2023 Minor Protection Active</span>
                    <p className="text-[11px] leading-relaxed text-emerald-800 mt-0.5">
                      Because you are in secondary or senior secondary school, KAABIL safeguards your personal privacy. Your profile cannot be searched, viewed, or contacted by commercial employers.
                    </p>
                  </div>
                </div>
                <label className="flex items-start gap-2 pt-1 border-t border-emerald-200/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-[11px] text-emerald-950 font-medium leading-tight">
                    I confirm that I have my parent or legal guardian&apos;s consent to register on KAABIL.
                  </span>
                </label>
              </div>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/20"
                required
              />
              <label htmlFor="terms" className="text-xs text-text-secondary leading-tight cursor-pointer">
                I agree to the{" "}
                <Link href="/terms" className="text-primary font-semibold hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary font-semibold hover:underline">
                  Privacy Policy
                </Link>
                .
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="gradient"
              className="w-full h-12 rounded-xl font-bold text-sm shadow-soft-md gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>
                    {role === "STUDENT"
                      ? "Create Account & Start Onboarding"
                      : "Register Organization"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-text-secondary pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
