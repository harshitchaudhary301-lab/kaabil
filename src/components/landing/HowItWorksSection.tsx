"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  ClipboardCheck,
  BookOpenCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
  const { t } = useLanguage();

  const journeySteps = [
    {
      step: "01",
      id: "discover",
      title: t.step1Title,
      subtitle: "Discover Your Strengths",
      description: t.step1Desc,
      icon: Compass,
      cta: "Find My Career",
      href: "/careers",
      badge: "Easy 5-Min Quiz",
    },
    {
      step: "02",
      id: "choose",
      title: t.step2Title,
      subtitle: "Explore 100+ Careers",
      description: t.step2Desc,
      icon: GraduationCap,
      cta: "Explore Pathways",
      href: "/careers",
      badge: "All 13 Streams",
    },
    {
      step: "03",
      id: "roadmap",
      title: t.step3Title,
      subtitle: "Step-by-Step Roadmaps",
      description: t.step3Desc,
      icon: BookOpenCheck,
      cta: "View Roadmap",
      href: "/student/roadmap",
      badge: "Personalized",
    },
    {
      step: "04",
      id: "learn",
      title: t.step4Title,
      subtitle: "Check My Skills",
      description: t.step4Desc,
      icon: ClipboardCheck,
      cta: "Check Skills",
      href: "/student/assessments",
      badge: "Bite-Sized",
    },
    {
      step: "05",
      id: "unlock",
      title: t.step5Title,
      subtitle: "My Achievements",
      description: t.step5Desc,
      icon: Award,
      cta: "View Achievements",
      href: "/student/passport",
      badge: "Verified Proof",
    },
  ];

  return (
    <section id="student-journey" className="py-20 lg:py-28 bg-[#FAF8FC] border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-bold text-purple-900">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Clear Guidance • Zero Confusion
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            {t.journeyTitle}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            {t.journeySubtitle}
          </p>
        </div>

        {/* ==============================================================
            DESKTOP HORIZONTAL TIMELINE (Hidden on mobile)
           ============================================================== */}
        <div className="hidden lg:block relative mb-12">
          {/* Connector Line */}
          <div className="absolute top-7 left-12 right-12 h-0.5 bg-gradient-to-r from-purple-200 via-amber-200 to-emerald-200 -z-0" />

          <div className="grid grid-cols-5 gap-4 relative z-10">
            {journeySteps.map((step, idx) => {
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
                      {step.badge}
                    </span>

                    <h3 className="font-heading text-base font-bold mb-2">
                      {step.title}
                    </h3>

                    <p
                      className={`text-xs leading-relaxed ${
                        isActive ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <Link href={step.href}>
                      <span
                        className={`text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                          isActive
                            ? "text-[#FFC66B] hover:text-[#FFA94D]"
                            : "text-purple-700 hover:text-purple-900"
                        }`}
                      >
                        <span>{step.cta}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==============================================================
            MOBILE VERTICAL TIMELINE (Visible on mobile/tablet)
           ============================================================== */}
        <div className="lg:hidden space-y-4">
          {journeySteps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-bold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                        {step.badge}
                      </span>
                      <h3 className="font-heading text-sm font-bold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {step.step}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={step.href}
                    className="text-xs font-bold text-purple-700 flex items-center gap-1"
                  >
                    <span>{step.cta}</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner Call to Action */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#251336] via-[#2F1944] to-[#1E0F2B] text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h4 className="font-heading text-lg sm:text-xl font-bold text-[#FFF5E9]">
              Ready to take your first confident step?
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              100% Free for students. No paid subscriptions, no ads, and full privacy protection under the DPDP Act.
            </p>
          </div>
          <Link href="/register" className="shrink-0">
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#FFC66B] to-[#FFA94D] text-[#1E0F2B] font-extrabold text-xs sm:text-sm h-11 px-6 rounded-xl hover:opacity-95 shadow-md gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
