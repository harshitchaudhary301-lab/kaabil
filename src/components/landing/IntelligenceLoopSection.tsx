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
  Users,
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
    id: "discover",
    title: "Discover",
    tagline: "Uncover Real Aptitude",
    icon: <Compass className="h-5 w-5 text-primary" />,
    student: "Explore 120+ career options across all 13 streams without societal bias. Discover what you truly excel at.",
    institution: "Map the incoming cohort's diverse interest profiles and foundational strengths early in the academic session.",
    employer: "Access transparent demand analytics showing student enrollment trends across all 13 domains.",
  },
  {
    step: 2,
    id: "learn",
    title: "Learn",
    tagline: "Adaptive Action Plan",
    icon: <BookOpenCheck className="h-5 w-5 text-indigo-600" />,
    student: "Follow a personalized 12-week roadmap with bite-sized 10-15 minute daily micro-learning missions.",
    institution: "Deploy targeted upskilling modules and workshops matching student stream curriculum requirements.",
    employer: "Sponsor practical industry challenges aligning real-world problems with classroom learning.",
  },
  {
    step: 3,
    id: "assess",
    title: "Assess",
    tagline: "Timed Competency Lab",
    icon: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
    student: "Take timed, domain-specific checkpoint evaluations benchmarked against national standards (AICTE, NMC, BCI).",
    institution: "Administer structured cohort assessments and monitor real-time class readiness indices.",
    employer: "Review objective skill benchmarks instead of relying exclusively on brand-name degree prestige.",
  },
  {
    step: 4,
    id: "verify",
    title: "Verify",
    tagline: "Cryptographic Evidence",
    icon: <Award className="h-5 w-5 text-emerald-600" />,
    student: "Earn tamper-evident Digital Skill Passport credentials signed with HMAC-SHA256 evidence hashing.",
    institution: "Validate institutional credentials with official AISHE, NAAC, and NBA accreditation metadata.",
    employer: "Instantly verify candidate credentials via cryptographic digital signatures and QR verification.",
  },
  {
    step: 5,
    id: "improve",
    title: "Improve",
    tagline: "Adaptive Recalibration",
    icon: <RefreshCw className="h-5 w-5 text-amber-600" />,
    student: "Receive constructive feedback from AI Mentor and watch your Career Readiness Index (CRI) climb.",
    institution: "Identify students needing assistance through the Early Intervention Queue before exams or placement drives.",
    employer: "Provide structured rubric feedback on candidate challenge submissions to elevate the talent pipeline.",
  },
  {
    step: 6,
    id: "connect",
    title: "Connect",
    tagline: "Equitable Opportunities",
    icon: <Briefcase className="h-5 w-5 text-teal-600" />,
    student: "For adults (18+), match directly with internships and entry-level positions with explainable fit scores.",
    institution: "Coordinate seamless campus placement drives with verified employers looking for demonstrated skills.",
    employer: "Hire qualified talent through two-way algorithmic matching guaranteed invariant to demographic traits.",
  },
];

export function IntelligenceLoopSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeRolePerspective, setActiveRolePerspective] = useState<"student" | "institution" | "employer">("student");

  const currentStep = LOOP_STEPS[activeStepIndex];

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1 text-xs font-bold text-secondary">
            <RefreshCw className="h-3.5 w-3.5" />
            The Closed-Loop Intelligence System
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            The KAABIL Intelligence Loop
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            A continuous six-stage development cycle connecting student aspiration, academic guidance, and verified employment opportunities.
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
                className={`p-4 rounded-3xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? "bg-white border-primary shadow-soft-md ring-2 ring-primary/20 scale-105 z-10"
                    : "bg-white/80 border-border hover:bg-white hover:border-slate-300 shadow-soft-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                      isActive ? "bg-primary text-white" : "bg-slate-100 text-text-muted"
                    }`}
                  >
                    0{step.step}
                  </span>
                  <div className="p-1 rounded-lg bg-slate-50">{step.icon}</div>
                </div>

                <div>
                  <h4 className="font-heading text-sm font-bold text-text-primary">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-1">
                    {step.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Detail Card with Stakeholder Tabs */}
        <div className="rounded-3xl p-6 sm:p-10 bg-white border border-border shadow-soft-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-heading font-extrabold text-lg">
                0{currentStep.step}
              </span>
              <div>
                <h3 className="font-heading text-2xl font-bold text-text-primary">
                  Stage {currentStep.step}: {currentStep.title} — {currentStep.tagline}
                </h3>
                <span className="text-xs text-text-muted">
                  Discover &rarr; Learn &rarr; Assess &rarr; Verify &rarr; Improve &rarr; Connect
                </span>
              </div>
            </div>

            {/* Stakeholder Perspective Switcher */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-border/80 self-start md:self-auto text-xs font-bold">
              <button
                onClick={() => setActiveRolePerspective("student")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeRolePerspective === "student"
                    ? "bg-white text-primary shadow-soft-xs font-extrabold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Student</span>
              </button>
              <button
                onClick={() => setActiveRolePerspective("institution")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeRolePerspective === "institution"
                    ? "bg-white text-secondary shadow-soft-xs font-extrabold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Institution</span>
              </button>
              <button
                onClick={() => setActiveRolePerspective("employer")}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                  activeRolePerspective === "employer"
                    ? "bg-white text-sky-700 shadow-soft-xs font-extrabold"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span>Employer</span>
              </button>
            </div>
          </div>

          {/* Perspective Description Box */}
          <div className="p-6 rounded-2xl bg-slate-50/80 border border-border/80 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-white border border-border shrink-0 shadow-soft-xs">
              {activeRolePerspective === "student" && <GraduationCap className="h-6 w-6 text-primary" />}
              {activeRolePerspective === "institution" && <Building2 className="h-6 w-6 text-secondary" />}
              {activeRolePerspective === "employer" && <Briefcase className="h-6 w-6 text-sky-700" />}
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block">
                {activeRolePerspective === "student" && "How Learners Experience This Stage:"}
                {activeRolePerspective === "institution" && "How Schools & Colleges Guide This Stage:"}
                {activeRolePerspective === "employer" && "How Organizations Benefit At This Stage:"}
              </span>
              <p className="text-sm sm:text-base text-text-primary leading-relaxed font-medium">
                {activeRolePerspective === "student" && currentStep.student}
                {activeRolePerspective === "institution" && currentStep.institution}
                {activeRolePerspective === "employer" && currentStep.employer}
              </p>
            </div>
          </div>

          {/* Bottom Stepper Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={activeStepIndex === 0}
              className="text-xs font-bold text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed"
            >
              &larr; Previous Stage
            </button>
            <div className="flex gap-1.5">
              {LOOP_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === activeStepIndex ? "w-6 bg-primary" : "w-2 bg-slate-200"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveStepIndex((prev) => Math.min(LOOP_STEPS.length - 1, prev + 1))}
              disabled={activeStepIndex === LOOP_STEPS.length - 1}
              className="text-xs font-bold text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next Stage</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
