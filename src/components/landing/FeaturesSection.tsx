"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  GraduationCap,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  FileBadge,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  Activity,
  SlidersHorizontal,
  Bot,
  QrCode,
  Lock,
} from "lucide-react";
import { ScoreRing } from "@/components/ui/score-ring";

export function FeaturesSection() {
  const [activeSimScenario, setActiveSimScenario] = useState<"current" | "boosted">("boosted");

  return (
    <section id="innovations" className="py-20 lg:py-28 bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
            <BrainCircuit className="h-3.5 w-3.5" />
            Core Architectural Inventions
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Signature KAABIL Innovations
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Eight proprietary intelligence engines powering transparent skill verification, predictive guidance, and equitable career outcomes across India.
          </p>
        </div>

        {/* High-Impact Bento Grid Showcase (8 Innovations) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">

          {/* =========================================
              CARD 1: AI Career Mentor (Span 7)
             ========================================= */}
          <div className="lg:col-span-7 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-purple-50/60 via-white to-slate-50 border border-purple-100 shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-secondary/10 text-secondary">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-100 text-purple-800">
                  Trilingual Intelligence
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  AI Career Mentor
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Personalized, explainable career guidance in English, हिन्दी, and Hinglish tailored to your educational stream and learning pace.
                </p>
              </div>

              {/* Mini-Visualization: Conversational Chat Preview */}
              <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-soft-xs space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold shrink-0">
                    S
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-border text-xs text-text-primary max-w-xs">
                    &ldquo;Should I focus on NEET test series or Class 12 board chemistry first?&rdquo;
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 text-xs text-purple-950 leading-relaxed max-w-sm">
                    &ldquo;Board chemistry theory overlaps 85% with NEET inorganic. Balance with daily 15-minute diagnostic checks to boost your CRI.&rdquo;
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-text-muted font-bold">
                  <span>Language toggles:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">English</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">हिन्दी</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800">Hinglish</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Grounded in verified curriculum frameworks</span>
              <Link href="/student/mentor" className="text-secondary font-bold hover:underline flex items-center gap-1">
                Explore Mentor &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 2: Career Readiness Index (CRI) (Span 5)
             ========================================= */}
          <div className="lg:col-span-5 rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 border border-blue-100 shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                  <BrainCircuit className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-primary">
                  NSQF Aligned
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Career Readiness Index (CRI)
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Deterministic, non-hallucinatory score calculated from 5 verified capability dimensions.
                </p>
              </div>

              {/* Mini-Visualization: ScoreRing + 5 Breakdown Gauges */}
              <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-soft-xs flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="text-[11px] font-bold text-text-primary flex justify-between">
                    <span>Knowledge (25%)</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "90%" }} />
                  </div>

                  <div className="text-[11px] font-bold text-text-primary flex justify-between">
                    <span>Academics (20%)</span>
                    <span>85%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-secondary h-full rounded-full" style={{ width: "85%" }} />
                  </div>

                  <div className="text-[11px] font-bold text-text-primary flex justify-between">
                    <span>Skills (25%)</span>
                    <span>80%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div className="flex flex-col items-center shrink-0">
                  <ScoreRing score={84} size={70} strokeWidth={7} sublabel="CRI" animate={false} />
                  <span className="text-[9px] font-bold text-emerald-700 mt-1">Top 15th %ile</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Mathematical transparency</span>
              <Link href="/student/assessments" className="text-primary font-bold hover:underline flex items-center gap-1">
                Take CRI Diagnostic &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 3: Career Digital Twin (Span 6)
             ========================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white border border-border shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Layers className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Dynamic Capability Mirror
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Career Digital Twin
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Real-time algorithmic model connecting your current subjects to validated industry skill horizons.
                </p>
              </div>

              {/* Mini-Visualization: Horizon Projection Nodes */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border shadow-soft-xs flex items-center justify-between gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-border flex-1 text-center">
                  <span className="text-[10px] font-bold text-text-muted block">Current Stage</span>
                  <strong className="text-text-primary font-bold">Class 12 (PCM)</strong>
                </div>

                <span className="text-primary font-bold text-sm">&rarr;</span>

                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 flex-1 text-center">
                  <span className="text-[10px] font-bold text-primary block">Target Horizon</span>
                  <strong className="text-primary font-bold">AI Systems Eng.</strong>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex-1 text-center">
                  <span className="text-[10px] font-bold text-emerald-700 block">Gap Focus</span>
                  <strong className="text-emerald-800 font-bold">PyTorch Lvl 4</strong>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Recalibrates on every assessment</span>
              <Link href="/student/digital-twin" className="text-primary font-bold hover:underline flex items-center gap-1">
                View Digital Twin &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 4: Career What-If Simulator (Span 6)
             ========================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white border border-border shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-600">
                  <SlidersHorizontal className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Hypothetical Sandbox
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Career What-If Simulator
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Simulate the exact impact of learning a skill or clearing an assessment on your future readiness score.
                </p>
              </div>

              {/* Mini-Visualization: Interactive Simulation Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border shadow-soft-xs space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-primary">Scenario: + Cloud Architecture (Lvl 4)</span>
                  <button
                    onClick={() => setActiveSimScenario(activeSimScenario === "current" ? "boosted" : "current")}
                    className="text-[11px] font-bold text-primary underline"
                  >
                    Toggle Simulation
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-border">
                  <div>
                    <span className="text-[10px] text-text-muted block">Baseline CRI</span>
                    <strong className="text-text-primary font-bold text-sm">74%</strong>
                  </div>
                  <span className="text-emerald-600 font-extrabold text-sm">&rarr;</span>
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">Simulated Horizon</span>
                    <strong className="text-emerald-700 font-extrabold text-sm">
                      {activeSimScenario === "boosted" ? "88% (+14% Boost)" : "74% (Current)"}
                    </strong>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    High Impact
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Safe hypothetical scenario testing</span>
              <Link href="/student/simulator" className="text-primary font-bold hover:underline flex items-center gap-1">
                Open Simulator &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 5: Skill Gap Analyzer (Span 6)
             ========================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white border border-border shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                  <Activity className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  Industry Benchmarks
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Skill Gap Analyzer
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Pinpoints exact competency deltas against statutory benchmarks (AICTE, NMC, BCI, ICAI, NSDC).
                </p>
              </div>

              {/* Mini-Visualization: Required vs Current Gap Bars */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border shadow-soft-xs space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-text-primary text-[11px] mb-0.5">
                    <span>System Design & Architecture</span>
                    <span className="text-amber-700">Gap: Level 2 &rarr; Level 4</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full" style={{ width: "50%" }} title="Current" />
                    <div className="bg-amber-400 h-full" style={{ width: "50%" }} title="Target Gap" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-text-primary text-[11px] mb-0.5">
                    <span>Relational Database Indexing</span>
                    <span className="text-emerald-700">Complete (Level 4/4)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Prioritizes weekly learning tasks</span>
              <Link href="/student/skill-gaps" className="text-primary font-bold hover:underline flex items-center gap-1">
                Analyze Skill Gaps &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 6: Digital Skill Passport (Span 6)
             ========================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white border border-border shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                  <FileBadge className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Cryptographic Verification
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Digital Skill Passport
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Tamper-evident, HMAC-SHA256 verified credentials that prove real competence to colleges and employers.
                </p>
              </div>

              {/* Mini-Visualization: Cryptographic Credential Mockup */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/40 border border-emerald-200 shadow-soft-xs flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    <span>Python Production Inference</span>
                  </div>
                  <p className="text-[10px] text-text-secondary font-mono">
                    HASH: 7a8f9c2d1e... • Verified by AICTE Challenge
                  </p>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    Public Shareable Link & QR Available
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white border border-emerald-200 shadow-soft-xs shrink-0 text-emerald-800">
                  <QrCode className="h-8 w-8" />
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Replaces unverified resume bullet points</span>
              <Link href="/student/passport" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
                View Passport &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 7: Adaptive Career Roadmap (Span 6)
             ========================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white border border-border shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-blue-50 text-primary">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-primary">
                  12-Week Interactive Path
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Adaptive Career Roadmap
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Dynamic milestone trajectories adjusting weekly according to your study hours and challenge results.
                </p>
              </div>

              {/* Mini-Visualization: Step Progressive Milestone Timeline */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border shadow-soft-xs flex items-center justify-between text-xs">
                <div className="text-center">
                  <span className="h-6 w-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto text-[11px]">
                    ✓
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary mt-1 block">Week 1</span>
                </div>
                <div className="h-0.5 bg-emerald-400 flex-1 mx-2" />
                <div className="text-center">
                  <span className="h-6 w-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center mx-auto text-[11px]">
                    ✓
                  </span>
                  <span className="text-[10px] font-bold text-text-secondary mt-1 block">Week 2</span>
                </div>
                <div className="h-0.5 bg-primary flex-1 mx-2" />
                <div className="text-center">
                  <span className="h-6 w-6 rounded-full bg-primary text-white font-bold flex items-center justify-center mx-auto text-[11px] animate-pulse">
                    3
                  </span>
                  <span className="text-[10px] font-bold text-primary mt-1 block">Active</span>
                </div>
                <div className="h-0.5 bg-slate-200 flex-1 mx-2" />
                <div className="text-center">
                  <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-500 font-bold flex items-center justify-center mx-auto text-[11px]">
                    4
                  </span>
                  <span className="text-[10px] font-medium text-text-muted mt-1 block">Sprint</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Bite-sized daily micro-missions</span>
              <Link href="/student/dashboard" className="text-primary font-bold hover:underline flex items-center gap-1">
                View Roadmap &rarr;
              </Link>
            </div>
          </div>

          {/* =========================================
              CARD 8: Two-Way Explainable Talent Matching (Span 6)
             ========================================= */}
          <div className="lg:col-span-6 rounded-3xl p-6 sm:p-7 bg-white border border-border shadow-soft-xs hover:shadow-soft-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="p-2.5 rounded-2xl bg-teal-50 text-teal-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-100 text-teal-800">
                  Algorithmic Fairness
                </span>
              </div>

              <div>
                <h3 className="font-heading text-xl font-bold text-text-primary">
                  Explainable Talent Matching
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed">
                  Two-way matching strictly evaluated on verified competence, fully invariant to demographic traits.
                </p>
              </div>

              {/* Mini-Visualization: 5-Dimension Match Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-border shadow-soft-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">Candidate Match Score:</span>
                  <span className="font-extrabold text-sm text-teal-700">92% Compatibility</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                  <div className="p-1.5 rounded-lg bg-white border border-border">
                    <span className="text-text-muted block">Verified (35%)</span>
                    <strong className="text-text-primary">95% Fit</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-border">
                    <span className="text-text-muted block">Stage (25%)</span>
                    <strong className="text-text-primary">100% Fit</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-white border border-border">
                    <span className="text-text-muted block">Projects (15%)</span>
                    <strong className="text-text-primary">85% Fit</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-text-muted font-medium">Demographic-invariant mathematical guarantee</span>
              <Link href="/employer/matching" className="text-teal-700 font-bold hover:underline flex items-center gap-1">
                Recruiter Matcher &rarr;
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
