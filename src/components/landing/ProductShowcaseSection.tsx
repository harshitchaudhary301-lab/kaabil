"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BrainCircuit,
  GraduationCap,
  Building2,
  Briefcase,
  Award,
  ArrowRight,
  Bot,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  FileBadge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { SkillRadar } from "@/components/ui/skill-radar";

type ShowcaseTab = "student" | "mentor" | "twin" | "institution" | "employer";

interface TabMeta {
  id: ShowcaseTab;
  title: string;
  badge: string;
  icon: React.ReactNode;
}

const TABS: TabMeta[] = [
  { id: "student", title: "Student Command Center", badge: "Core Portal", icon: <GraduationCap className="h-4 w-4" /> },
  { id: "mentor", title: "AI Career Mentor", badge: "Trilingual", icon: <Sparkles className="h-4 w-4" /> },
  { id: "twin", title: "Career Digital Twin", badge: "Simulation", icon: <BrainCircuit className="h-4 w-4" /> },
  { id: "institution", title: "Institution Analytics", badge: "Accreditation", icon: <Building2 className="h-4 w-4" /> },
  { id: "employer", title: "Employer Matching", badge: "Explainable AI", icon: <Briefcase className="h-4 w-4" /> },
];

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>("student");

  return (
    <section id="product-preview" className="py-20 lg:py-28 bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
            <Layers className="h-3.5 w-3.5" />
            Live Platform Capability Matrix
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Experience KAABIL in Action
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            Inspect authentic interfaces designed for students, educators, and enterprise recruitment teams.
          </p>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 border border-border/80 max-w-4xl mx-auto mb-10 shadow-soft-xs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-white text-primary shadow-soft-xs font-extrabold scale-102"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/60"
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* Main Product Stage Canvas */}
        <div className="rounded-3xl p-6 sm:p-9 bg-[#F8FAFC] border border-blue-100/80 shadow-soft-md relative overflow-hidden">
          
          {/* Top Stage Bar: Watermark + Active Label */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-text-primary">
                Previewing: {TABS.find((t) => t.id === activeTab)?.title}
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-white text-slate-600 border border-border self-start sm:self-auto shadow-soft-xs">
              Simulated Interactive Demonstration Preview
            </span>
          </div>

          {/* =========================================
              TAB 1: Student Command Center
             ========================================= */}
          {activeTab === "student" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* CRI & Skills Bento (Span 7) */}
                <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-border shadow-soft-xs space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary block">
                        Student Career Command Center
                      </span>
                      <h4 className="font-heading text-lg font-bold text-text-primary mt-0.5">
                        Career Readiness Index (CRI)
                      </h4>
                      <p className="text-xs text-text-secondary">Aryan Sharma • Higher Secondary (PCM)</p>
                    </div>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Top 15th Percentile
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-1">
                    <div className="sm:col-span-4 flex flex-col items-center justify-center p-3 bg-slate-50 rounded-2xl border border-border">
                      <ScoreRing score={84} size={88} strokeWidth={8} sublabel="CRI" animate={false} />
                      <span className="text-[10px] font-bold text-emerald-700 mt-1">Competent</span>
                    </div>

                    <div className="sm:col-span-8 space-y-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Career Knowledge</span>
                          <span className="font-bold">90%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: "90%" }} />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Educational Preparation</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="bg-secondary h-full rounded-full" style={{ width: "85%" }} />
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span>Skill Genome Verification</span>
                          <span className="font-bold">80%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: "80%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5-Axis Radar (Span 5) */}
                <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-border shadow-soft-xs flex flex-col items-center justify-between">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-primary">Competency Radar</span>
                    <span className="text-[10px] font-bold text-text-muted">5-AXIS BENCHMARK</span>
                  </div>
                  <SkillRadar
                    size={210}
                    skills={[
                      { label: "Knowledge", value: 90 },
                      { label: "Academics", value: 85 },
                      { label: "Skills", value: 80 },
                      { label: "Practical", value: 75 },
                      { label: "Milestones", value: 85 },
                    ]}
                  />
                  <span className="text-[11px] text-text-muted mt-2">
                    Benchmarked against AICTE Industry Standard
                  </span>
                </div>
              </div>

              {/* Bottom Row: 12-Week Roadmap + Daily Mission */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      12-Week Adaptive Roadmap
                    </span>
                    <h5 className="font-bold text-sm text-text-primary">
                      Week 3: FastAPI Production Inference
                    </h5>
                    <p className="text-[11px] text-text-secondary mt-0.5">3 of 4 activities completed</p>
                  </div>
                  <Link href="/student/dashboard">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1">
                      Dashboard <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-border flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                      Daily AI Mission (10-15 Min)
                    </span>
                    <h5 className="font-bold text-sm text-text-primary">
                      FastAPI Route Validation & Pydantic Schemas
                    </h5>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">✓ Completed Today</p>
                  </div>
                  <span className="text-xs font-bold text-primary px-3 py-1.5 rounded-xl bg-primary/10">
                    +15 XP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 2: AI Career Mentor
             ========================================= */}
          {activeTab === "mentor" && (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-white border border-border shadow-soft-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">Universal AI Career Mentor</h4>
                      <p className="text-[11px] text-text-muted">Trilingual Contextual Model • Active Session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                      हिन्दी / Hinglish / English
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs shrink-0">
                      A
                    </div>
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-border max-w-lg text-text-primary">
                      &ldquo;I am in Class 11 PCM. Should I prioritize JEE Advanced physics or build machine learning projects if I want a career in AI?&rdquo;
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary/15 flex items-center justify-center text-secondary shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-text-primary leading-relaxed max-w-xl space-y-2">
                      <p>
                        <strong>Clear Strategic Guidance:</strong> For 11th and 12th, your academic foundation in calculus, vectors, and linear algebra is paramount—machine learning algorithms are rooted in this exact mathematics.
                      </p>
                      <p className="text-text-secondary">
                        Dedicate 80% of weekly effort to JEE physics/math foundations and 20% to weekend coding sprints. This maintains a <strong>85%+ CRI</strong> trajectory while keeping premier tier-1 engineering admissions open.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>Explainable AI • Non-hallucinatory curriculum advice</span>
                  <Link href="/student/mentor">
                    <Button size="sm" className="bg-primary text-white rounded-xl text-xs gap-1.5 font-bold">
                      Open Full Mentor Console &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 3: Career Digital Twin
             ========================================= */}
          {activeTab === "twin" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-white border border-border shadow-soft-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Algorithmic Capability Model
                    </span>
                    <h4 className="font-heading text-lg font-bold text-text-primary mt-0.5">
                      Career Digital Twin v2.0
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Calibrated: Today
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted block">
                      Current Capability Node
                    </span>
                    <h5 className="font-bold text-sm text-text-primary mt-1">Class 12 (PCM)</h5>
                    <span className="text-xs text-text-secondary mt-0.5 block">14 Documented Skills</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">
                      Target Career Horizon
                    </span>
                    <h5 className="font-bold text-sm text-primary mt-1">AI Systems Engineer</h5>
                    <span className="text-xs text-text-secondary mt-0.5 block">AICTE Accredited</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Priority Growth Delta
                    </span>
                    <h5 className="font-bold text-sm text-amber-900 mt-1">System Design (Lvl 3)</h5>
                    <span className="text-xs text-amber-700 mt-0.5 block">Unlocks +12% CRI</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-border flex items-center justify-between text-xs">
                  <span>Want to test hypothetical future acquisitions?</span>
                  <Link href="/student/simulator">
                    <Button size="sm" variant="outline" className="rounded-xl text-xs gap-1 font-bold">
                      Launch What-If Simulator &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 4: Institution Analytics
             ========================================= */}
          {activeTab === "institution" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-white border border-border shadow-soft-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                      Academic Cohort Intelligence
                    </span>
                    <h4 className="font-heading text-lg font-bold text-text-primary mt-0.5">
                      Delhi Technical Campus • Accreditation Telemetry
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    NAAC A+ Accredited
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-border">
                    <span className="text-[10px] text-text-muted block">Enrolled Students</span>
                    <strong className="text-lg font-extrabold text-text-primary">1,240</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-border">
                    <span className="text-[10px] text-text-muted block">Average CRI Score</span>
                    <strong className="text-lg font-extrabold text-secondary">76.4%</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-border">
                    <span className="text-[10px] text-text-muted block">Onboarding Rate</span>
                    <strong className="text-lg font-extrabold text-emerald-700">92%</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-border">
                    <span className="text-[10px] text-text-muted block">Active Interventions</span>
                    <strong className="text-lg font-extrabold text-amber-700">14 Triage</strong>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-border flex items-center justify-between text-xs">
                  <span>Export standardized NIRF & NBA compliance spreadsheets</span>
                  <Link href="/institution/dashboard">
                    <Button size="sm" className="bg-secondary text-white rounded-xl text-xs gap-1 font-bold">
                      Open Institution Console &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              TAB 5: Employer Matching
             ========================================= */}
          {activeTab === "employer" && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-white border border-border shadow-soft-xs space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Two-Way Explainable Matching Engine
                    </span>
                    <h4 className="font-heading text-lg font-bold text-text-primary mt-0.5">
                      Apex Healthcare & Systems • Talent Pool Discovery
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Demographic Invariant
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-border space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-sm text-text-primary">Aryan Sharma (Adult Candidate • 18+)</h5>
                      <span className="text-[11px] text-text-muted">Target: AI Clinical Diagnostic Engineer</span>
                    </div>
                    <span className="text-sm font-extrabold text-teal-700 bg-teal-100/60 px-3 py-1 rounded-xl">
                      92% Compatibility
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] pt-1">
                    <div className="p-2 rounded-xl bg-white border border-border">
                      <span className="text-text-muted block">Verified Skills (35%)</span>
                      <strong className="text-text-primary font-bold">95% Fit</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-border">
                      <span className="text-text-muted block">Academic Stage (25%)</span>
                      <strong className="text-text-primary font-bold">100% Fit</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-border">
                      <span className="text-text-muted block">Practical Evidence (15%)</span>
                      <strong className="text-text-primary font-bold">85% Fit</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-border flex items-center justify-between text-xs">
                  <span className="text-text-secondary">DPDP Act (2023) Safeguards: Minors strictly excluded</span>
                  <Link href="/employer/dashboard">
                    <Button size="sm" className="bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs gap-1 font-bold">
                      Open Employer Workspace &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
}
