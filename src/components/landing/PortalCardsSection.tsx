"use client";

import React from "react";
import Link from "next/link";
import {
  GraduationCap,
  Building2,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  BrainCircuit,
  Award,
  Users,
  Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalCardsSection() {
  const portals = [
    {
      id: "student",
      role: "STUDENT",
      title: "Student Portal",
      tagline: "For School Students (Class 8+), College, Diploma & Job Seekers",
      description: "Discover careers, build skills and prepare for opportunities.",
      theme: {
        bg: "bg-gradient-to-b from-[#F0EBFF]/70 via-white to-white",
        border: "border-blue-200 hover:border-primary/60",
        badgeBg: "bg-primary/10 text-primary border-primary/20",
        iconBg: "bg-primary/10 text-primary",
        button: "bg-primary hover:bg-primary/95 text-white shadow-soft-xs",
        accent: "text-primary",
      },
      badge: "Learners & Aspirants",
      href: "/student/dashboard",
      features: [
        "AI Career Mentor in English, Hindi & Hinglish",
        "Career Digital Twin & Skill Genome",
        "Deterministic Career Readiness Index (CRI)",
        "Adaptive 12-Week Roadmap & Daily Micro-Missions",
        "Digital Skill Passport with HMAC-SHA256 Evidence",
      ],
      illustration: (
        <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-soft-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary">Aryan Sharma • PCM</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              84% CRI Ready
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "84%" }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-text-muted">
            <span>Next: PyTorch Inference</span>
            <span className="font-semibold text-primary">Week 3/12</span>
          </div>
        </div>
      ),
    },
    {
      id: "institution",
      role: "INSTITUTION",
      title: "Institution Console",
      tagline: "For Schools, Colleges, Polytechnics & Universities",
      description: "Understand student capabilities and improve educational outcomes.",
      theme: {
        bg: "bg-gradient-to-b from-[#D1FAE5]/50 via-white to-white",
        border: "border-emerald-200 hover:border-emerald-400",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-500/10 text-emerald-600",
        button: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft-xs",
        accent: "text-emerald-700",
      },
      badge: "Schools & Universities",
      href: "/institution/dashboard",
      features: [
        "Student Directory & Multi-Batch CSV Ingestion",
        "Cohort Skill Analytics & Stream Demand Heatmaps",
        "Early Intervention Queue for At-Risk Learners",
        "Targeted Upskilling & Workshop Coordination",
        "NIRF, NAAC & NBA Accreditation Telemetry",
      ],
      illustration: (
        <div className="p-4 rounded-2xl bg-white border border-emerald-100 shadow-soft-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary">Delhi Technical Campus</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              NAAC A+ • Verified
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Students</span>
              <span className="font-bold text-xs text-emerald-800">1,240</span>
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Avg CRI</span>
              <span className="font-bold text-xs text-emerald-800">76%</span>
            </div>
            <div className="p-1.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Interventions</span>
              <span className="font-bold text-xs text-amber-700">14 Triage</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "employer",
      role: "EMPLOYER",
      title: "Employer Workspace",
      tagline: "For Hospitals, Banks, Law Firms, Tech & Manufacturing",
      description: "Discover verified skills and manage recruitment.",
      theme: {
        bg: "bg-gradient-to-b from-purple-50/60 via-amber-50/20 to-white",
        border: "border-purple-200 hover:border-purple-400",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        iconBg: "bg-purple-500/10 text-secondary",
        button: "bg-secondary hover:bg-secondary/95 text-white shadow-soft-xs",
        accent: "text-secondary",
      },
      badge: "Verified Recruiters",
      href: "/employer/dashboard",
      features: [
        "Skills-First Job Requirements Across 13 Streams",
        "Two-Way Explainable AI Candidate Matcher",
        "Instant Digital Skill Passport Tamper Verification",
        "Practical Industry Challenges & Work Trials",
        "DPDP Child Safety: Minors Excluded from Recruitment",
      ],
      illustration: (
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-soft-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-text-primary">Apex Healthcare & Systems</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              MCA CIN Verified
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-purple-50/50 border border-purple-100">
            <span className="font-medium text-text-secondary">AI Clinical Engineer</span>
            <span className="font-bold text-purple-800">92% Match</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>Fairness Guaranteed • Demographic Invariant</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="portals" className="py-20 lg:py-28 bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Unified Connected Ecosystem
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary">
            Three Portals. One Intelligent Standard.
          </h2>
          <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
            KAABIL connects learners, educational institutions, and verified organizations through standardized skill benchmarks and explainable career progression.
          </p>
        </div>

        {/* 3 Portal Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {portals.map((portal) => (
            <div
              key={portal.id}
              className={`rounded-3xl border ${portal.theme.border} ${portal.theme.bg} p-6 sm:p-8 flex flex-col justify-between shadow-soft-xs hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden`}
            >
              <div className="space-y-6">
                {/* Header Row: Title & Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${portal.theme.badgeBg}`}>
                      {portal.badge}
                    </span>
                    <h3 className="font-heading text-2xl font-bold text-text-primary pt-2">
                      {portal.title}
                    </h3>
                  </div>
                </div>

                {/* Tagline & Description */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    {portal.tagline}
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    {portal.description}
                  </p>
                </div>

                {/* Original Interactive Illustration */}
                <div className="pt-1">
                  {portal.illustration}
                </div>

                {/* Key Features List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold text-text-primary block">
                    Core Capabilities:
                  </span>
                  <ul className="space-y-2 text-xs text-text-secondary">
                    {portal.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${portal.theme.accent}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-8 border-t border-border/80 mt-6">
                <Link href={portal.href} className="w-full block">
                  <Button
                    className={`w-full min-h-[48px] h-12 rounded-2xl font-bold text-xs gap-2 ${portal.theme.button}`}
                  >
                    <span>Enter {portal.title}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
