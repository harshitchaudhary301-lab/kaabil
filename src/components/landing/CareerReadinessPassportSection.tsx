"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  TrendingUp,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Sparkles,
  ArrowRight,
  FolderGit2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function CareerReadinessPassportSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="readiness-passport" className="py-20 lg:py-28 bg-white border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1 text-xs font-bold text-purple-900">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Verifiable Competency Proof
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Career Readiness &amp; Digital Skill Passport
          </h2>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Move beyond static paper resumes. Measure genuine readiness and share cryptographically verifiable proof of competence.
          </p>

          {/* Mandatory Demo Data Notice */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 shadow-soft-xs">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>DEMONSTRATION SAMPLE PROFILE • ALL DATA BELOW IS SYNTHETIC DEMO BENCHMARK</span>
          </div>
        </div>

        {/* 2-Column Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==============================================================
              LEFT COLUMN: Realistic Career Readiness Index (CRI) Example
             ============================================================== */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-purple-50/50 via-white to-slate-50 border border-purple-100 shadow-soft-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 block">
                  Deterministic Employability Score
                </span>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mt-0.5">
                  Career Readiness Index (CRI)
                </h3>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Placement Ready
              </span>
            </div>

            {/* Overall Score Highlight */}
            <div className="p-5 rounded-2xl bg-[#1E0F2B] text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-[#FFC66B] font-bold block">
                  Target Career Goal
                </span>
                <span className="font-heading text-lg font-bold text-white">
                  AI Systems Engineer (STEM PCM)
                </span>
                <span className="text-xs text-slate-300 block mt-0.5">
                  Target Horizon: Campus Placement Season 2027
                </span>
              </div>

              <div className="text-center pl-4 border-l border-white/15">
                <span className="font-heading text-4xl font-extrabold text-[#FFC66B]">
                  84
                </span>
                <span className="text-[11px] text-slate-300 block font-semibold">
                  / 100 CRI
                </span>
              </div>
            </div>

            {/* 5 Preparation Dimensions Breakdown */}
            <div className="space-y-3.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                5-Dimension Verification Breakdown:
              </span>

              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>1. Academic Baseline (25% weight)</span>
                    <span className="font-bold text-slate-900">88%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>2. Verified Technical Skills (30% weight)</span>
                    <span className="font-bold text-purple-700">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>3. Practical Project Portfolio (20% weight)</span>
                    <span className="font-bold text-emerald-700">80%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: "80%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>4. Interview Lab Benchmarks (15% weight)</span>
                    <span className="font-bold text-blue-700">82%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: "82%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>5. Industry Certifications (10% weight)</span>
                    <span className="font-bold text-amber-700">86%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: "86%" }} />
                  </div>
                </div>
              </div>
            </div>

            <Link href="/register" className="block pt-2">
              <Button
                size="lg"
                className="w-full h-11 rounded-2xl bg-[#1E0F2B] hover:bg-[#2F1944] text-[#FFC66B] font-bold text-xs gap-2"
              >
                <span>Calculate Your Personalized CRI</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* ==============================================================
              RIGHT COLUMN: Shareable Digital Skill Passport Example
             ============================================================== */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-soft-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block">
                  Cryptographic Credential
                </span>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mt-0.5">
                  Digital Skill Passport
                </h3>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                <ShieldCheck className="h-3.5 w-3.5 text-purple-700" />
                HMAC-SHA256 Signed
              </span>
            </div>

            {/* Passport Credential Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#1E0F2B] text-white space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-[#FFC66B] font-bold uppercase tracking-wider block">
                    Verified Candidate
                  </span>
                  <span className="font-heading text-lg font-bold text-white">
                    Aryan Sharma
                  </span>
                  <span className="text-xs text-slate-300 block">
                    Delhi Technical Campus • B.Tech AI &amp; DS
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                  <QrCode className="h-8 w-8 text-[#FFC66B]" />
                </div>
              </div>

              {/* Cryptographic Checksum */}
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-[10px] text-slate-300 truncate">
                sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677...
              </div>

              {/* Verified Assessments List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Verified Competencies:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="font-medium text-slate-200 block">Python Logic</span>
                    <span className="font-bold text-[#FFC66B]">92% Verified</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="font-medium text-slate-200 block">PyTorch Inference</span>
                    <span className="font-bold text-[#FFC66B]">88% Verified</span>
                  </div>
                </div>
              </div>

              {/* Verified Project Evidence */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-[#FFC66B]" />
                  <span className="font-medium text-slate-200">Autonomous Healthcare Diagnostic</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400">100% Tests Pass</span>
              </div>
            </div>

            {/* Shareable Verification Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-11 px-5 rounded-xl border-slate-200 text-xs font-bold gap-2 text-slate-800 hover:bg-slate-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Passport Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-purple-700" />
                    <span>Copy Shareable Link</span>
                  </>
                )}
              </Button>

              <Link href="/verify/demo-passport-token" className="w-full sm:flex-1">
                <Button
                  size="sm"
                  className="w-full h-11 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold gap-1.5"
                >
                  <span>Verify Demo Signature</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
