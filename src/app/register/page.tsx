"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Shield,
  ArrowRight,
  GraduationCap,
  Building2,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Lock,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { evaluatePasswordStrengthClient } from "@/lib/auth/client-password";

export default function RegisterPage() {
  const router = useRouter();

  // Role Tab: STUDENT | INSTITUTION_ADMIN | EMPLOYER_ADMIN
  const [role, setRole] = useState<"STUDENT" | "INSTITUTION_ADMIN" | "EMPLOYER_ADMIN">("STUDENT");

  // Common Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Student-specific fields
  const [educationStage, setEducationStage] = useState<string>("CLASS_12");
  const [currentStream, setCurrentStream] = useState<string>("NON_MEDICAL_PCM");
  const [institutionName, setInstitutionName] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);

  // College-specific fields
  const [collegeName, setCollegeName] = useState("");
  const [institutionType, setInstitutionType] = useState<string>("COLLEGE_UNIVERSITY");

  // Employer-specific fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState<string>("IT_SOFTWARE");

  // Location fields (for Institution & Employer)
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Minor evaluation under DPDP Act 2023
  const isMinor =
    role === "STUDENT" &&
    ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(educationStage);

  const passwordEvaluation = evaluatePasswordStrengthClient(password);
  const isPasswordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRoleChange = (newRole: "STUDENT" | "INSTITUTION_ADMIN" | "EMPLOYER_ADMIN") => {
    setRole(newRole);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (passwordEvaluation.score < 2) {
      setErrorMessage("Password is too weak. Include a combination of uppercase letters, lowercase letters, numbers, or symbols.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your password to confirm.");
      return;
    }

    if (isMinor && !guardianConsent) {
      setErrorMessage("Parent or legal guardian consent is mandatory under the DPDP Act 2023 for school-aged students.");
      return;
    }

    if (!termsAgreed) {
      setErrorMessage("You must accept the Terms of Service and Privacy Policy to create an account.");
      return;
    }

    setIsLoading(true);

    try {
      const payload: Record<string, unknown> = {
        role,
        name: name.trim(),
        email: trimmedEmail,
        password,
      };

      if (role === "STUDENT") {
        payload.educationStage = educationStage;
        payload.currentStream = currentStream;
        if (institutionName.trim()) payload.institutionName = institutionName.trim();
        payload.guardianConsent = isMinor ? guardianConsent : true;
        if (city.trim()) payload.city = city.trim();
        if (stateName.trim()) payload.state = stateName.trim();
      } else if (role === "INSTITUTION_ADMIN") {
        payload.organizationName = collegeName.trim() || name.trim();
        payload.orgType = institutionType;
        payload.city = city.trim() || "New Delhi";
        payload.state = stateName.trim() || "Delhi";
      } else if (role === "EMPLOYER_ADMIN") {
        payload.organizationName = companyName.trim() || name.trim();
        payload.orgType = "CORPORATE_EMPLOYER";
        payload.industry = industry;
        payload.city = city.trim() || "Bengaluru";
        payload.state = stateName.trim() || "Karnataka";
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Registration failed. Please check your information.");
        setIsLoading(false);
        return;
      }

      // Successful registration routing
      if (role === "STUDENT") {
        router.push("/onboarding");
      } else if (role === "INSTITUTION_ADMIN") {
        router.push("/institution/dashboard");
      } else {
        router.push("/employer/dashboard");
      }
    } catch {
      setErrorMessage("A network error occurred. Please check your internet connection and try again.");
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
              Universal Education &amp; Career Gateway.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Empowering learners across all 13 educational streams with deterministic career readiness, AI mentorship, and verified skill credentials.
            </p>
          </div>

          {/* 3 Step Roadmap Preview */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/30 flex items-center justify-center font-bold text-xs text-accent">
                01
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Select Persona</h4>
                <p className="text-[11px] text-slate-400">Student, College / University, or Corporate Employer.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/30 flex items-center justify-center font-bold text-xs text-purple-300">
                02
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Initialize Career Digital Twin</h4>
                <p className="text-[11px] text-slate-400">Map your stream, subjects, and baseline Career Readiness Index.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-300">
                03
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Verified Skill Passport</h4>
                <p className="text-[11px] text-slate-400">Cryptographically anchored evidence with HMAC checksums.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Minors under 18 shielded from recruiter queries</span>
          <span className="text-slate-300 font-medium">100% Free Core for Students</span>
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
              Sign In &rarr;
            </Link>
          </div>

          {/* Auth Mode Switcher */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
            <Link
              href="/login"
              className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 text-text-secondary hover:text-text-primary transition-all hover:bg-white/60"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
            <div className="flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 bg-white text-primary shadow-soft-sm border border-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create Account</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
              Create Your KAABIL Account
            </h1>
            <p className="text-xs text-text-secondary">
              Select your persona to create your personalized workspace.
            </p>
          </div>

          {/* Role Choice Tabs — Explicitly STUDENT, COLLEGE, EMPLOYER only. Admin accounts are NOT publicly registrable. */}
          <div className="flex rounded-2xl bg-slate-100 p-1.5 border border-slate-200/80">
            {[
              { id: "STUDENT", label: "Student", icon: <GraduationCap className="h-4 w-4" /> },
              { id: "INSTITUTION_ADMIN", label: "College / School", icon: <Building2 className="h-4 w-4" /> },
              { id: "EMPLOYER_ADMIN", label: "Employer / Company", icon: <Briefcase className="h-4 w-4" /> },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleRoleChange(r.id as "STUDENT" | "INSTITUTION_ADMIN" | "EMPLOYER_ADMIN")}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
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

          {/* Pending Verification Notice for Organizations */}
          {role !== "STUDENT" && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Institutional Verification Notice</span>
                New {role === "INSTITUTION_ADMIN" ? "college and school" : "company"} accounts are created in a{" "}
                <strong>pending verification</strong> state. An administrator will verify your institutional credentials before full placement/recruitment privileges are activated.
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. STUDENT REGISTRATION FORM */}
            {role === "STUDENT" && (
              <>
                <div>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="e.g. Aryan Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      <option value="UNDERGRADUATE">Undergraduate (B.Tech, B.Sc, B.Com, B.A, etc.)</option>
                      <option value="POSTGRADUATE">Postgraduate (M.Tech, M.Sc, MBA, M.A, etc.)</option>
                      <option value="WORKING_PROFESSIONAL">Working Professional</option>
                      <option value="OTHER">Other Stream</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Educational Stream
                    </label>
                    <select
                      value={currentStream}
                      onChange={(e) => setCurrentStream(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-11"
                    >
                      <option value="MEDICAL_PCB">Medical &amp; Healthcare (PCB)</option>
                      <option value="NON_MEDICAL_PCM">Non-Medical / STEM (PCM)</option>
                      <option value="COMMERCE">Commerce &amp; Finance</option>
                      <option value="ARTS_HUMANITIES">Arts, Humanities &amp; Social Sciences</option>
                      <option value="LAW">Law &amp; Legal Studies</option>
                      <option value="MANAGEMENT">Management &amp; Business</option>
                      <option value="CREATIVE_DESIGN">Creative Arts &amp; Design</option>
                      <option value="AGRICULTURE">Agriculture &amp; Food Technology</option>
                      <option value="VOCATIONAL_TRADES">Vocational &amp; Technical Trades (ITI)</option>
                      <option value="SPORTS_PHYSICAL_ED">Sports &amp; Physical Education</option>
                      <option value="HOSPITALITY_TOURISM">Hospitality, Tourism &amp; Culinary</option>
                      <option value="INTERDISCIPLINARY">Interdisciplinary &amp; Emerging</option>
                      <option value="UNDECIDED">Undecided / Exploring</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Input
                    label="College / Institution (Optional)"
                    type="text"
                    placeholder="e.g. Delhi Technological University or St. Xavier's High School"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    className="h-11 rounded-xl"
                  />
                </div>
              </>
            )}

            {/* 2. COLLEGE / INSTITUTION REGISTRATION FORM */}
            {role === "INSTITUTION_ADMIN" && (
              <>
                <div>
                  <Input
                    label="Institution Name"
                    type="text"
                    placeholder="e.g. Delhi Technological University"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div>
                  <Input
                    label="Official Institutional Email"
                    type="email"
                    placeholder="dean@university.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Institution Type
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-11"
                    >
                      <option value="COLLEGE_UNIVERSITY">College / University</option>
                      <option value="SCHOOL">School (Class 8–12)</option>
                      <option value="VOCATIONAL_INSTITUTE">Polytechnic / ITI / Skill Center</option>
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Authorized Representative Name"
                      type="text"
                      placeholder="e.g. Dr. Priya Raman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City"
                    type="text"
                    placeholder="e.g. New Delhi"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                  <Input
                    label="State"
                    type="text"
                    placeholder="e.g. Delhi"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </>
            )}

            {/* 3. EMPLOYER / COMPANY REGISTRATION FORM */}
            {role === "EMPLOYER_ADMIN" && (
              <>
                <div>
                  <Input
                    label="Company Name"
                    type="text"
                    placeholder="e.g. Apex Diagnostics Ltd. / Tata MedTech"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>

                <div>
                  <Input
                    label="Official Work Email"
                    type="email"
                    placeholder="talent@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-11 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-primary mb-1">
                      Industry Sector
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full text-xs rounded-xl border border-border bg-white px-3 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 h-11"
                    >
                      <option value="IT_SOFTWARE">Information Technology &amp; Software</option>
                      <option value="HEALTHCARE_PHARMA">Healthcare, Hospitals &amp; Pharma</option>
                      <option value="BFSI">Banking, Financial Services &amp; Insurance (BFSI)</option>
                      <option value="MANUFACTURING">Manufacturing, Automotive &amp; Engineering</option>
                      <option value="LEGAL">Legal Services &amp; Compliance</option>
                      <option value="MEDIA_DESIGN">Media, Advertising &amp; Creative Design</option>
                      <option value="AGRICULTURE_FOOD">Agriculture &amp; Food Technology</option>
                      <option value="HOSPITALITY">Hospitality, Travel &amp; Tourism</option>
                      <option value="OTHER">Other Enterprise Sector</option>
                    </select>
                  </div>

                  <div>
                    <Input
                      label="Authorized Representative Name"
                      type="text"
                      placeholder="e.g. Dr. Alok Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-11 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="City"
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                  <Input
                    label="State"
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              </>
            )}

            {/* PASSWORD AND CONFIRM PASSWORD FIELDS (Common to all roles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="relative">
                  <Input
                    label="Password (min 8 characters)"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="h-11 rounded-xl pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="relative">
                  <Input
                    label="Confirm Password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={`h-11 rounded-xl pr-10 ${
                      isPasswordMismatch ? "border-rose-400 focus:border-rose-500" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Password Mismatch Alert */}
            {isPasswordMismatch && (
              <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Passwords do not match.
              </p>
            )}

            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="space-y-1">
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

            {/* DPDP Act Minor Shield Alert (Only for School-age Students) */}
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

            {/* Terms and Privacy Policy Consent */}
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
              disabled={isLoading || isPasswordMismatch}
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
                      ? "Create Student Account & Begin"
                      : role === "INSTITUTION_ADMIN"
                      ? "Register College / School"
                      : "Register Corporate Account"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-text-secondary pt-2">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign In here &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}