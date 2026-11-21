"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ClipboardCheck,
  BookOpenCheck,
  ShieldCheck,
  Sparkles,
  Briefcase,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const JOURNEY_STEPS = [
  {
    step: "01",
    id: "discover",
    title: "Discover",
    subtitle: "Explore 13 Streams",
    description:
      "Uncover real aptitude across all 13 educational streams without societal bias. Find where your strengths meet market demand.",
    icon: Compass,
    cta: "Explore Careers",
    href: "/careers",
    badge: "Diagnostic",
  },
  {
    step: "02",
    id: "assess",
    title: "Assess",
    subtitle: "Calibrated Diagnostics",
    description:
      "Take domain-specific checkpoint evaluations to measure your genuine baseline against national industry benchmarks.",
    icon: ClipboardCheck,
    cta: "Take Assessment",
    href: "/student/assessments",
    badge: "Evaluation",
  },
  {
    step: "03",
    id: "learn",
    title: "Learn",
    subtitle: "Adaptive Roadmap",
    description:
      "Follow a personalized 12-week roadmap with bite-sized daily AI micro-missions and vetted learning resources.",
    icon: BookOpenCheck,
    cta: "View Roadmap",
    href: "/student/roadmap",
    badge: "Personalized",
  },
  {
    step: "04",
    id: "verify",
    title: "Verify",
    subtitle: "Tamper-Evident Passport",
    description:
      "Mint your cryptographic Digital Skill Passport. Turn tested abilities into verifiable HMAC-SHA256 credentials.",
    icon: ShieldCheck,
    cta: "Skill Passport",
    href: "/student/passport",
    badge: "Verified Proof",
  },
  {
    step: "05",
    id: "match",
    title: "Match",
    subtitle: "Explainable AI Match",
    description:
      "Connect with opportunities using deterministic skill matching. Understand exact fit scores with zero algorithmic rejection.",
    icon: Sparkles,
    cta: "See Matches",
    href: "/student/opportunities",
    badge: "Merit Matching",
  },
  {
    step: "06",
    id: "hire",
    title: "Get Hired",
    subtitle: "Direct Placement",
    description:
      "Step directly into campus placement drives and verified employer pipelines with audited evidence that speeds up hiring.",
    icon: Briefcase,
    cta: "Browse Jobs",
    href: "/student/opportunities",
    badge: "Employability",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-[#FAF8FC] border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-bold text-purple-900">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            The Universal Journey
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            How KAABIL Works
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            From initial discovery to verified employment: a transparent, evidence-based closed loop for every stream.
          </p>
        </div>

        {/* ==============================================================
            DESKTOP HORIZONTAL TIMELINE (Hidden on mobile)
           ============================================================== */}
        <div className="hidden lg:block relative mb-12">
          {/* Connector Line */}
          <div className="absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-purple-200 via-amber-200 to-emerald-200 -z-0" />

          <div className="grid grid-cols-6 gap-4 relative z-10">
            {JOURNEY_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={step.id}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={`p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between border cursor-pointer ${
                    isActive
                      ? "bg-[#1E0F2B] text-white border-[#FFC66B] shadow-xl scale-[1.02]"
                      : "bg-white text-slate-800 border-slate-200/80 hover:border-purple-300 shadow-soft-xs"
                  }`}
                >
                  <div>
                    {/* Top Step Pill & Node */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-all ${
                          isActive
                            ? "bg-[#FFC66B] text-[#1E0F2B]"
                            : "bg-purple-50 text-purple-800 border border-purple-100"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/15 text-[#FFC66B]"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {step.step}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider block mb-1 ${
                        isActive ? "text-[#FFC66B]" : "text-purple-700"
                      }`}
                    >
                      {step.subtitle}
                    </span>

                    <h3
                      className={`font-heading text-lg font-bold mb-2 ${
                        isActive ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={`text-xs leading-relaxed mb-4 ${
                        isActive ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  <Link href={step.href}>
                    <Button
                      size="sm"
                      className={`w-full h-8 text-xs font-bold rounded-xl transition-all gap-1.5 ${
                        isActive
                          ? "bg-[#FFC66B] hover:bg-[#FFA94D] text-[#1E0F2B]"
                          : "bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200/60"
                      }`}
                    >
                      <span>{step.cta}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==============================================================
            MOBILE & TABLET VERTICAL TIMELINE (Visible below lg)
           ============================================================== */}
        <div className="lg:hidden relative pl-6 border-l-2 border-purple-200 space-y-6">
          {JOURNEY_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs"
              >
                {/* Timeline Node Marker */}
                <div className="absolute -left-[37px] top-4 h-7 w-7 rounded-full bg-[#1E0F2B] border-2 border-[#FFC66B] flex items-center justify-center text-[10px] font-bold text-[#FFC66B]">
                  {step.step}
                </div>

                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      {step.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {step.badge}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {step.description}
                </p>

                <Link href={step.href}>
                  <Button
                    size="sm"
                    className="h-8 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 font-bold text-xs gap-1 border border-purple-200"
                  >
                    <span>{step.cta}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
