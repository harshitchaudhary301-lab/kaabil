"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Compass,
  CheckCircle2,
  TrendingUp,
  BrainCircuit,
  Award,
  ShieldCheck,
  Stethoscope,
  Coins,
  Scale,
  Palette,
  Play,
  FileBadge,
  Layers,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";

type StreamKey = "STEM" | "Healthcare" | "Commerce" | "Law";

interface StreamPreset {
  role: string;
  streamName: string;
  council: string;
  cri: number;
  skills: { name: string; level: number }[];
  milestone: string;
  mentorPrompt: string;
  mentorReply: string;
  themeColor: string;
}

const STREAM_PRESETS: Record<StreamKey, StreamPreset> = {
  STEM: {
    role: "AI & Distributed Systems Engineer",
    streamName: "Non-Medical (PCM)",
    council: "AICTE • NSQF Level 7",
    cri: 84,
    skills: [
      { name: "Algorithmic Logic", level: 90 },
      { name: "PyTorch Inference", level: 85 },
      { name: "FastAPI Production", level: 80 },
    ],
    milestone: "FastAPI Production Inference Benchmark",
    mentorPrompt: "Which skills should I verify first for AI engineering?",
    mentorReply: "Your algorithmic baseline is strong (90%). Complete the PyTorch inference sprint next to unlock 88% CRI.",
    themeColor: "from-blue-600 to-indigo-600",
  },
  Healthcare: {
    role: "Clinical Diagnostics & Physician",
    streamName: "Medical (PCB)",
    council: "NMC • NEET-UG Benchmark",
    cri: 79,
    skills: [
      { name: "Clinical Anatomy", level: 92 },
      { name: "Pathology Vitals", level: 82 },
      { name: "Pharmacology", level: 75 },
    ],
    milestone: "Emergency Triage & Patient Vitals Protocol",
    mentorPrompt: "How do I balance hospital clinicals with board exams?",
    mentorReply: "Focus on 15-minute daily diagnostic checklists; practical application boosts your CRI without study burnout.",
    themeColor: "from-emerald-600 to-teal-600",
  },
  Commerce: {
    role: "Corporate Finance & Chartered Analyst",
    streamName: "Commerce & Finance",
    council: "ICAI • Ind AS Accredited",
    cri: 74,
    skills: [
      { name: "Statutory Auditing", level: 88 },
      { name: "GST Compliance", level: 80 },
      { name: "Financial Modeling", level: 72 },
    ],
    milestone: "Tax Credit Reconciliation & Corporate Audit",
    mentorPrompt: "What certifications best complement my B.Com?",
    mentorReply: "Financial Ind AS reconciliation is in highest demand. Completing module 3 moves your profile to Top 10%.",
    themeColor: "from-purple-600 to-indigo-600",
  },
  Law: {
    role: "Corporate Legal Counsel & Compliance",
    streamName: "Law & Jurisprudence",
    council: "BCI • CLAT Benchmark",
    cri: 82,
    skills: [
      { name: "Contract Redlining", level: 88 },
      { name: "Companies Act 2013", level: 85 },
      { name: "Due Diligence", level: 78 },
    ],
    milestone: "Drafting Cross-Border Indemnity Clauses",
    mentorPrompt: "How can I stand out in corporate law internships?",
    mentorReply: "Your contract redlining scores are exceptional. Add regulatory compliance evidence to your Skill Passport.",
    themeColor: "from-amber-600 to-rose-600",
  },
};

export function HeroSection() {
  const [activeStream, setActiveStream] = useState<StreamKey>("STEM");
  const preset = STREAM_PRESETS[activeStream];

  return (
    <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 bg-[#F8FAFC]">
      {/* Soft Ambient Mesh Background (Layered & Non-Intrusive) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-12 left-1/4 w-[500px] h-[360px] bg-blue-100/60 rounded-full blur-[140px]" />
        <div className="absolute top-24 right-1/4 w-[420px] h-[320px] bg-purple-100/60 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-[380px] h-[280px] bg-sky-100/50 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* =========================================
              LEFT COLUMN: Hero Copy & Value Proposition
             ========================================= */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 shadow-soft-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="font-heading text-xs sm:text-sm font-bold text-primary tracking-wide">
                Your Future. Powered by Intelligence.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.12]">
              Every Stream. <br />
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
                Every Skill.
              </span>{" "}
              <br />
              Every Future.
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto lg:mx-0">
              Discover your strengths, explore career possibilities, build verified skills and unlock opportunities — all in one intelligent platform.
            </p>

            {/* Action CTA Buttons (Proper padding, min 48px height, visible text) */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/careers" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] h-13 px-7 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-bold text-sm shadow-soft-md hover:shadow-soft-lg hover:scale-[1.02] active:scale-95 transition-all gap-2"
                >
                  <Compass className="h-4 w-4" />
                  <span>Explore Your Career</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px] h-13 px-6 rounded-2xl border-border hover:bg-slate-50 text-text-primary font-bold text-sm hover:border-primary/40 shadow-soft-xs hover:shadow-soft-sm transition-all gap-2"
                >
                  <Play className="h-4 w-4 text-primary fill-primary/20" />
                  <span>See How KAABIL Works</span>
                </Button>
              </a>
            </div>

            {/* Trust Badges - Strictly Contained Within Left Column */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2.5 gap-x-5 text-xs text-text-secondary font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border shadow-soft-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>All 13 Streams Supported</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border shadow-soft-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>DPDP Act 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-border shadow-soft-xs">
                <BrainCircuit className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Explainable AI Benchmarks</span>
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: Original Visual Career Ecosystem
              (Layered Glass Canvas, Strictly Self-Contained)
             ========================================= */}
          <div className="lg:col-span-6">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-3xl p-5 sm:p-7 bg-white/95 backdrop-blur-xl border border-blue-100 shadow-soft-xl overflow-hidden">
              
              {/* Top Bar: Interactive Stream Selector Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-border/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
                      Interactive Career Ecosystem
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted mt-0.5">
                    Select a stream to preview real-time intelligence
                  </p>
                </div>

                {/* Simulated Data Badge */}
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-border self-start sm:self-auto">
                  Interactive Demo Preview
                </span>
              </div>

              {/* Stream Switcher Pills */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-border/80 mb-5">
                {(["STEM", "Healthcare", "Commerce", "Law"] as const).map((stream) => (
                  <button
                    key={stream}
                    onClick={() => setActiveStream(stream)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl transition-all ${
                      activeStream === stream
                        ? "bg-white text-primary shadow-soft-xs font-extrabold"
                        : "text-text-secondary hover:text-text-primary hover:bg-white/50"
                    }`}
                  >
                    {stream}
                  </button>
                ))}
              </div>

              {/* Center Stage: Career Horizon & CRI Score Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 border border-border/80 shadow-soft-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md inline-block">
                      {preset.streamName} • Digital Twin
                    </span>
                    <h3 className="font-heading text-lg font-bold text-text-primary leading-snug">
                      {preset.role}
                    </h3>
                    <p className="text-xs text-text-secondary font-medium">{preset.council}</p>
                  </div>

                  {/* Animated ScoreRing CRI Display */}
                  <div className="flex flex-col items-center shrink-0">
                    <ScoreRing
                      score={preset.cri}
                      size={74}
                      strokeWidth={7}
                      sublabel="CRI"
                      animate={true}
                    />
                    <span className="text-[9px] font-bold text-emerald-700 mt-1">
                      Top 15th %ile
                    </span>
                  </div>
                </div>

                {/* Granular Competencies Progress Stack */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
                    <span>Active Competency Radar</span>
                    <span className="text-emerald-700 flex items-center gap-1 text-[11px] font-bold">
                      <Award className="h-3.5 w-3.5" />
                      Passport Verified
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {preset.skills.map((skill, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[11px] font-medium text-text-secondary">
                          <span>{skill.name}</span>
                          <span className="font-bold text-text-primary">{skill.level}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${preset.themeColor} rounded-full transition-all duration-500`}
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Feature Layers (AI Mentor Bubble + Passport Credential) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {/* Micro-Card 1: AI Career Mentor Preview */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded-lg bg-secondary/15 text-secondary">
                      <Sparkles className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      AI Mentor Preview
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed line-clamp-3">
                    &ldquo;{preset.mentorReply}&rdquo;
                  </p>
                  <div className="mt-2 pt-2 border-t border-purple-200/50 flex items-center justify-between text-[10px] text-purple-700 font-bold">
                    <span>Trilingual (EN / HI / Hinglish)</span>
                    <span>Active</span>
                  </div>
                </div>

                {/* Micro-Card 2: Digital Skill Passport Preview */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="p-1 rounded-lg bg-emerald-500/15 text-emerald-600">
                      <FileBadge className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-bold text-text-primary">
                      Digital Skill Passport
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-900">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>HMAC-SHA256 Signed</span>
                    </div>
                    <p className="text-[10px] text-text-muted font-mono truncate">
                      ID: KBL-2026-IND-V4
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-emerald-200/50 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                    <span>Tamper-Evident</span>
                    <span>QR Verifiable</span>
                  </div>
                </div>
              </div>

              {/* Bottom Subtle Bar with Educational Streams Icons */}
              <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between text-xs text-text-secondary">
                <span className="font-semibold text-text-muted text-[11px]">
                  All 13 Streams Supported:
                </span>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span title="STEM"><GraduationCap className="h-4 w-4 text-blue-600" /></span>
                  <span title="Healthcare"><Stethoscope className="h-4 w-4 text-emerald-600" /></span>
                  <span title="Commerce"><Coins className="h-4 w-4 text-indigo-600" /></span>
                  <span title="Law"><Scale className="h-4 w-4 text-amber-600" /></span>
                  <span title="Creative Arts"><Palette className="h-4 w-4 text-pink-600" /></span>
                  <Link href="/careers" className="text-primary font-bold hover:underline text-[11px] ml-1">
                    +8 More &rarr;
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
