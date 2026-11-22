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
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PortalCardsSection() {
  const portals = [
    {
      id: "student",
      role: "STUDENT",
      title: "For Students",
      tagline: "Discover careers, assess skills, learn and grow.",
      description:
        "Explore all 13 streams, take diagnostic evaluations, bridge skill gaps with adaptive roadmaps, and build verified credentials.",
      theme: {
        bg: "bg-gradient-to-b from-[#F0EBFF]/70 via-white to-white",
        border: "border-purple-200 hover:border-purple-400",
        badgeBg: "bg-purple-100 text-purple-900 border-purple-200",
        iconBg: "bg-purple-500/10 text-purple-700",
        button: "bg-[#1E0F2B] hover:bg-[#2F1944] text-[#FFC66B] shadow-soft-xs",
        accent: "text-purple-700",
      },
      badge: "Learners & Aspirants",
      href: "/student/dashboard",
      cta: "Explore Student Portal",
      features: [
        "AI Career Mentor in English, Hindi & Hinglish",
        "Deterministic Career Readiness Index (CRI)",
        "Adaptive 12-Week Roadmap & Daily Micro-Missions",
        "Digital Skill Passport with HMAC-SHA256 Evidence",
        "DPDP Child Safety: Minors protected from recruitment",
      ],
      illustration: (
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-soft-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Aryan Sharma • PCM Track</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              84% CRI Ready
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: "84%" }} />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Next: PyTorch Model Inference</span>
            <span className="font-semibold text-purple-700">Week 3/12</span>
          </div>
        </div>
      ),
    },
    {
      id: "institution",
      role: "INSTITUTION",
      title: "For Institutions",
      tagline: "Understand student readiness, organize training and improve placement support.",
      description:
        "Manage cohorts, analyze department-wide skill metrics, schedule training workshops, and organize high-yield placement drives.",
      theme: {
        bg: "bg-gradient-to-b from-[#D1FAE5]/50 via-white to-white",
        border: "border-emerald-200 hover:border-emerald-400",
        badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-500/10 text-emerald-600",
        button: "bg-emerald-700 hover:bg-emerald-800 text-white shadow-soft-xs",
        accent: "text-emerald-700",
      },
      badge: "Schools & Universities",
      href: "/institution/dashboard",
      cta: "Open Institution Console",
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
            <span className="font-bold text-slate-800">Delhi Technical Campus</span>
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
              <span className="text-[10px] text-slate-500 block">Triage</span>
              <span className="font-bold text-xs text-amber-700">14 Active</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "employer",
      role: "EMPLOYER",
      title: "For Employers",
      tagline: "Find relevant candidates through transparent, skills-based matching.",
      description:
        "Post competency-based opportunities, evaluate candidates with explainable AI match rubrics, and schedule verified interviews.",
      theme: {
        bg: "bg-gradient-to-b from-purple-50/60 via-amber-50/20 to-white",
        border: "border-purple-200 hover:border-purple-400",
        badgeBg: "bg-purple-100 text-purple-800 border-purple-200",
        iconBg: "bg-purple-500/10 text-purple-700",
        button: "bg-purple-800 hover:bg-purple-900 text-white shadow-soft-xs",
        accent: "text-purple-700",
      },
      badge: "Verified Recruiters",
      href: "/employer/dashboard",
      cta: "Launch Employer Portal",
      features: [
        "Skills-First Job Requirements Across 13 Streams",
        "Two-Way Explainable AI Candidate Matcher",
        "Instant Digital Skill Passport Tamper Verification",
        "Practical Industry Challenges & Work Trials",
        "Zero Algorithmic Bias: Objective Competency Focus",
      ],
      illustration: (
        <div className="p-4 rounded-2xl bg-white border border-purple-100 shadow-soft-xs space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">Apex Healthcare Systems</span>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              MCA CIN Verified
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] p-2 rounded-xl bg-purple-50/50 border border-purple-100">
            <span className="font-medium text-slate-700">AI Clinical Systems Engineer</span>
            <span className="font-bold text-purple-900">92% Match</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" />
            <span>Fairness Audited • Demographic Invariant</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="portals" className="py-20 lg:py-28 bg-[#FAF8FC] border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-bold text-purple-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Unified Ecosystem
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            One Platform, Three Powerful Experiences
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Purpose-built workspaces connecting learners, educators, and recruiters through standardized skill benchmarks.
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
                <div className="space-y-1.5">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border ${portal.theme.badgeBg}`}>
                    {portal.badge}
                  </span>
                  <h3 className="font-heading text-2xl font-bold text-slate-900 pt-2">
                    {portal.title}
                  </h3>
                  <p className="text-xs font-bold text-purple-800">
                    {portal.tagline}
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {portal.description}
                  </p>
                </div>

                {/* Illustration Card */}
                <div>{portal.illustration}</div>

                {/* Core Capabilities */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-900 block">
                    Core Capabilities:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {portal.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${portal.theme.accent}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-8">
                <Link href={portal.href} className="w-full">
                  <Button
                    size="lg"
                    className={`w-full h-12 rounded-2xl font-bold text-xs gap-2 transition-all ${portal.theme.button}`}
                  >
                    <span>{portal.cta}</span>
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
