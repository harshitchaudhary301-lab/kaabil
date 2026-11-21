"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden py-20 lg:py-28 bg-gradient-to-b from-white via-slate-50 to-blue-50/30 border-t border-border">
      {/* Background Soft Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-xs font-bold text-secondary">
          <Sparkles className="h-4 w-4" />
          <span>Universal Career & Skill Platform</span>
        </div>

        {/* Heading Exactly as Requested */}
        <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.12]">
          Your Future Starts With{" "}
          <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
            KAABIL.
          </span>
        </h2>

        {/* Supporting Text Exactly as Requested */}
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Explore your potential. Build meaningful skills. Take your next step with confidence.
        </p>

        {/* Dual CTA Buttons (min 48px height, visible text) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link href="/register" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto min-h-[48px] h-13 px-8 rounded-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-white font-bold text-sm shadow-soft-md hover:shadow-soft-lg hover:scale-[1.02] active:scale-95 transition-all gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto min-h-[48px] h-13 px-7 rounded-2xl border-border bg-white hover:bg-slate-50 text-text-primary font-bold text-sm shadow-soft-xs hover:shadow-soft-sm transition-all"
            >
              <span>Sign In to Existing Account</span>
            </Button>
          </Link>
        </div>

        {/* DPDP and Transparency Safeguards */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-text-secondary font-semibold">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>All 13 Streams Supported</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>DPDP Act (2023) Child Privacy Protected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Zero Hallucination AI Guarantee</span>
          </div>
        </div>

      </div>
    </section>
  );
}
