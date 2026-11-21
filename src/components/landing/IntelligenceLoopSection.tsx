"use client";

import React, { useState } from "react";
import {
  Compass,
  BookOpenCheck,
  CheckCircle2,
  Award,
  RefreshCw,
  Briefcase,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Building2,
  SlidersHorizontal,
  Target,
} from "lucide-react";

interface LoopStep {
  step: number;
  id: string;
  title: string;
  tagline: string;
  icon: React.ReactNode;
  student: string;
  institution: string;
  employer: string;
}

const LOOP_STEPS: LoopStep[] = [
  {
    step: 1,
    id: "industry-skills",
    title: "Industry Skills",
    tagline: "Market Demand & Benchmarks",
    icon: <Compass className="h-5 w-5 text-purple-700" />,
    student:
      "Explore real-time competency standards mapped across all 13 educational streams (AICTE, NMC, ICAI, BCI). Discover what skills employers actually require.",
    institution:
      "Align academic curriculum with dynamic regional and national industry demand heatmaps across departments.",
    employer:
      "Publish competency-based skill requirements directly into the ecosystem to signal exact hiring benchmarks.",
  },
  {
    step: 2,
    id: "skill-analysis",
    title: "Student Skill Analysis",
    tagline: "Deterministic Gap Matrix",
    icon: <SlidersHorizontal className="h-5 w-5 text-amber-600" />,
    student:
      "Compare your current academic, technical, and practical abilities against target career benchmarks to prioritize precise skill gaps.",
    institution:
      "Identify students needing early intervention before semester exams and placement drives via aggregate cohort gap analysis.",
    employer:
      "Evaluate verified candidate capability distributions rather than relying on pedigree or superficial resumes.",
  },
  {
    step: 3,
    id: "personalized-learning",
    title: "Personalized Learning",
    tagline: "Adaptive 12-Week Roadmap",
    icon: <BookOpenCheck className="h-5 w-5 text-blue-600" />,
    student:
      "Follow weekly milestones with 10-15 minute daily AI micro-missions, interactive challenges, and vetted high-quality free resources.",
    institution:
      "Schedule targeted upskilling workshops and faculty-led mentoring clinics mapped to identified cohort weaknesses.",
    employer:
      "Sponsor real-world work trial challenges that prepare prospective candidates for actual team workflows.",
  },
  {
    step: 4,
    id: "skill-verification",
    title: "Skill Verification",
    tagline: "Tamper-Evident Credentials",
    icon: <Award className="h-5 w-5 text-emerald-600" />,
    student:
      "Earn cryptographically verifiable Digital Skill Passport credentials signed with HMAC-SHA256 evidence hashing.",
    institution:
      "Validate institutional credentials with official AISHE, NAAC, and NBA accreditation metadata.",
    employer:
      "Instantly verify candidate credentials via cryptographic digital signatures and QR verification.",
  },
  {
    step: 5,
    id: "talent-matching",
    title: "Talent Matching",
    tagline: "Explainable Merit Rubric",
    icon: <Sparkles className="h-5 w-5 text-purple-600" />,
    student:
      "For adults (18+), match directly with internships and entry-level positions with explainable, transparent fit scores.",
    institution:
      "Facilitate campus placement drives connecting certified cohorts with high-intent corporate partners.",
    employer:
      "Hire top performers through two-way algorithmic matching guaranteed invariant to demographic traits.",
  },
  {
    step: 6,
    id: "placement-feedback",
    title: "Placement Feedback",
    tagline: "Closed-Loop Recalibration",
    icon: <RefreshCw className="h-5 w-5 text-rose-600" />,
    student:
      "Receive actionable interview feedback to refine your skills and boost your Career Readiness Index (CRI).",
    institution:
      "Track placement outcome telemetry to continuously adapt institutional training and curriculum design.",
    employer:
      "Provide rubric feedback on candidates, continually sharpening future talent pipelines.",
  },
];

export function IntelligenceLoopSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeRolePerspective, setActiveRolePerspective] = useState<
    "student" | "institution" | "employer"
  >("student");

  const currentStep = LOOP_STEPS[activeStepIndex];

  return (
    <section id="intelligence-loop" className="py-20 lg:py-28 bg-[#FAF8FC] border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-bold text-purple-900">
            <RefreshCw className="h-3.5 w-3.5 text-amber-600" />
            The Closed-Loop Intelligence System
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            The KAABIL Intelligence Loop
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Industry Skills → Student Skill Analysis → Personalized Learning → Skill Verification → Talent Matching → Placement Feedback
          </p>
        </div>

        {/* 6 Step Interactive Journey Track */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {LOOP_STEPS.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? "bg-[#1E0F2B] text-white border-[#FFC66B] shadow-xl scale-105 z-10"
                    : "bg-white text-slate-800 border-slate-200/80 hover:bg-slate-50 shadow-soft-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                      isActive ? "bg-[#FFC66B] text-[#1E0F2B]" : "bg-purple-50 text-purple-800"
                    }`}
                  >
                    0{step.step}
                  </span>
                  <div className="p-1 rounded-lg bg-slate-50/50">{step.icon}</div>
                </div>

                <div>
                  <h4 className="font-heading text-xs font-bold leading-tight">
                    {step.title}
                  </h4>
                  <p
                    className={`text-[10px] mt-1 line-clamp-1 ${
                      isActive ? "text-[#FFC66B]" : "text-slate-500"
                    }`}
                  >
                    {step.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card with Stakeholder Tabs */}
        <div className="rounded-3xl p-6 sm:p-10 bg-white border border-slate-200/90 shadow-soft-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-900 font-heading font-extrabold text-lg border border-purple-200">
                0{currentStep.step}
              </span>
              <div>
                <h3 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">
                  Stage {currentStep.step}: {currentStep.title}
                </h3>
                <span className="text-xs text-purple-700 font-semibold">
                  {currentStep.tagline}
                </span>
              </div>
            </div>

            {/* Stakeholder Perspective Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start md:self-auto text-xs font-bold">
              <button
                onClick={() => setActiveRolePerspective("student")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeRolePerspective === "student"
                    ? "bg-white text-purple-900 shadow-soft-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5 text-purple-700" />
                <span>Student</span>
              </button>
              <button
                onClick={() => setActiveRolePerspective("institution")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeRolePerspective === "institution"
                    ? "bg-white text-emerald-800 shadow-soft-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Institution</span>
              </button>
              <button
                onClick={() => setActiveRolePerspective("employer")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeRolePerspective === "employer"
                    ? "bg-white text-purple-900 shadow-soft-xs font-extrabold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5 text-amber-600" />
                <span>Employer</span>
              </button>
            </div>
          </div>

          {/* Perspective Description Box */}
          <div className="p-6 rounded-2xl bg-purple-50/40 border border-purple-100/80 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white border border-purple-100 shrink-0 shadow-soft-xs">
              {activeRolePerspective === "student" && (
                <GraduationCap className="h-6 w-6 text-purple-700" />
              )}
              {activeRolePerspective === "institution" && (
                <Building2 className="h-6 w-6 text-emerald-700" />
              )}
              {activeRolePerspective === "employer" && (
                <Briefcase className="h-6 w-6 text-purple-900" />
              )}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                {activeRolePerspective === "student" && "How Learners Experience This Stage:"}
                {activeRolePerspective === "institution" &&
                  "How Schools & Colleges Guide This Stage:"}
                {activeRolePerspective === "employer" && "How Verified Recruiters Evaluate This Stage:"}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">
                {activeRolePerspective === "student" && currentStep.student}
                {activeRolePerspective === "institution" && currentStep.institution}
                {activeRolePerspective === "employer" && currentStep.employer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
