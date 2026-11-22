"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  SlidersHorizontal,
  Map,
  ShieldCheck,
  FileText,
  Briefcase,
  ArrowRight,
  Bot,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const features = [
    {
      id: "mentor",
      title: "AI Career Mentor",
      badge: "Trilingual Guidance",
      icon: Sparkles,
      iconColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description:
        "Empathetic, explainable career guidance in English, हिन्दी, and Hinglish grounded in curated educational pathways and official curriculum frameworks.",
      href: "/student/mentor",
      cta: "Chat with Mentor",
      visualization: (
        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs space-y-2">
          <div className="flex items-center justify-between text-[10px] text-purple-900 font-bold">
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3 text-purple-700" /> KAABIL AI Mentor
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-200/60 text-purple-800">
              हिन्दी / Hinglish / Eng
            </span>
          </div>
          <p className="text-[11px] text-slate-700 italic">
            &ldquo;Aapke Class 12 board marks ke basis par, biomedical engineering aur clinical analytics dono strong pathways hain. Pehle 5-min diagnostic quiz dekhein?&rdquo;
          </p>
        </div>
      ),
    },
    {
      id: "skill-gaps",
      title: "What Should I Learn?",
      badge: "Skill Clarity",
      icon: SlidersHorizontal,
      iconColor: "text-purple-600 bg-purple-600/10 border-purple-600/20",
      description:
        "Understand exactly which skills you already have, and which ones you need for your dream career without confusing industry jargon.",
      href: "/student/skill-gaps",
      cta: "Explore Skills",
      visualization: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between text-[11px]">
            <span className="font-semibold text-slate-700">Core Problem Solving</span>
            <span className="font-bold text-emerald-600">On Track: 85%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: "85%" }} />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Current: 85%</span>
            <span>Target: 100%</span>
          </div>
        </div>
      ),
    },
    {
      id: "roadmap",
      title: "My Career Roadmap",
      badge: "Step-by-Step",
      icon: Map,
      iconColor: "text-blue-600 bg-blue-600/10 border-blue-600/20",
      description:
        "Clear, bite-sized weekly milestones tailored to your current grade—so you always know your exact next step.",
      href: "/student/roadmap",
      cta: "View Roadmap",
      visualization: (
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
            <span>Week 3: Core Foundations</span>
            <span className="text-emerald-700 flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3" /> 2/3 Complete
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-700">
            <input type="checkbox" checked readOnly className="rounded text-blue-600" />
            <span className="line-through text-slate-400">Foundation Concepts</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-700">
            <input type="checkbox" readOnly className="rounded text-blue-600" />
            <span className="font-semibold text-slate-800">Hands-on Mini Practice</span>
          </div>
        </div>
      ),
    },
    {
      id: "assessments",
      title: "Check My Skills & Achievements",
      badge: "Verified Proof",
      icon: ShieldCheck,
      iconColor: "text-emerald-600 bg-emerald-600/10 border-emerald-600/20",
      description:
        "Fun, pressure-free skill checkpoints that award verifiable digital achievement badges you can share with pride.",
      href: "/student/assessments",
      cta: "Check My Skills",
      visualization: (
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-950 text-[11px]">Skill Checkpoint</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Verified 92%
            </span>
          </div>
          <div className="text-[10px] text-emerald-800 flex items-center gap-1">
            <Award className="h-3 w-3 text-emerald-600" /> Recognized Certificate &amp; Digital Badge
          </div>
        </div>
      ),
    },
    {
      id: "resume",
      title: "AI Resume Studio",
      badge: "Verified Competency CV",
      icon: FileText,
      iconColor: "text-indigo-600 bg-indigo-600/10 border-indigo-600/20",
      description:
        "Transform verified test scores and completed challenges into clean, ATS-optimized resumes that prove real competence to recruiters.",
      href: "/student/resume",
      cta: "Build My Resume",
      visualization: (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
            <span>Verified Skills Profile</span>
            <span className="text-[10px] text-emerald-700 font-extrabold">ATS Ready</span>
          </div>
          <div className="flex flex-wrap gap-1 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 font-medium">Python 92%</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-medium">PyTorch 88%</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-medium">FastAPI 85%</span>
          </div>
        </div>
      ),
    },
    {
      id: "jobs",
      title: "Jobs and Internships",
      badge: "Explainable Match",
      icon: Briefcase,
      iconColor: "text-rose-600 bg-rose-600/10 border-rose-600/20",
      description:
        "Connect with verified employers through transparent skill matching. Zero bias, clear match breakdowns, and direct interview scheduling.",
      href: "/student/opportunities",
      cta: "Browse Opportunities",
      visualization: (
        <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-[11px]">AI Systems Engineer Intern</span>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
              88% Fit
            </span>
          </div>
          <div className="text-[10px] text-slate-600">
            Apex Systems • Technical Rubric Matched
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-bold text-purple-900">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Complete Career Toolkit
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Everything You Need for a Future-Ready Career
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Six integrated intelligence modules designed to discover potential, build verified skills, and connect with opportunities.
          </p>
        </div>

        {/* 6 Premium Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group p-6 rounded-3xl border border-slate-200/80 bg-white hover:border-purple-300 shadow-soft-xs hover:shadow-soft-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Icon & Badge */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${feat.iconColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* Micro-visualization preview */}
                  <div className="pt-2">{feat.visualization}</div>
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-5 mt-4 border-t border-slate-100">
                  <Link href={feat.href} className="w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs font-bold text-purple-900 hover:text-purple-700 hover:bg-purple-50 rounded-xl px-3 group-hover:translate-x-0.5 transition-all"
                    >
                      <span>{feat.cta}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
