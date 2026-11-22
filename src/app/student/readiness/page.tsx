// ==============================================================================
// KAABIL (काबिल) — Career Readiness Scorecard Page (Step 3.4 Elevated)
// Explainable Career Readiness Index, 5 Preparation Dimensions,
// Real Evidence Breakdown, Next Best Action, and Zero Fabrication.
// ==============================================================================

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ClipboardCheck,
  Map,
  Layers,
  Sparkles,
  BarChart2,
  Lock,
  Zap,
  Info,
  FolderGit2,
  BookOpen,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV_ITEMS } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { CareerReadinessResult } from "@/lib/readiness/cri-engine";

export default function CareerReadinessPage() {
  const [readiness, setReadiness] = useState<CareerReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");

  const fetchReadiness = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/student/readiness");
      if (res.ok) {
        const data = await res.json();
        setReadiness(data.readiness || null);
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const isInsufficient = !readiness || readiness.overallScore === null || readiness.isInsufficientEvidence;

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV_ITEMS}
      breadcrumbs={["Career Intelligence", "Career Readiness"]}
    >
      <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Control Bar: Language Switcher & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="p-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
                Employability & Readiness Intelligence
              </span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Career Readiness Index (CRI)
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50/80 p-0.5 text-xs">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "en" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "hi" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage("hinglish")}
                className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                  language === "hinglish" ? "bg-white text-purple-700 shadow-xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Hinglish
              </button>
            </div>

            <Button
              onClick={fetchReadiness}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-200 text-xs font-bold gap-1.5 text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-purple-600" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Link href="/student/passport">
              <Button
                size="sm"
                className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold gap-1.5"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Skill Passport</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Score Ring Card */}
          <div className="md:col-span-5 p-6 rounded-3xl bg-gradient-to-br from-[#1E0F2B] via-[#2F1944] to-[#1E0F2B] text-white flex flex-col justify-between shadow-md border border-purple-900/60">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Target Career: {readiness?.careerTitle || "Career Track"}
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isInsufficient ? "Needs Evidence" : readiness?.statusLabel || "Developing"}
                </span>
              </div>

              <div className="flex items-center justify-center py-6">
                {isInsufficient ? (
                  <div className="h-36 w-36 rounded-full border-4 border-dashed border-purple-400/30 flex flex-col items-center justify-center text-center p-3">
                    <AlertCircle className="h-8 w-8 text-amber-400 mb-1" />
                    <span className="text-[11px] font-bold text-purple-200">
                      Not enough info yet
                    </span>
                  </div>
                ) : (
                  <ScoreRing
                    score={readiness.overallScore!}
                    size={150}
                    strokeWidth={12}
                    label="CRI SCORE"
                    colorScheme="secondary"
                  />
                )}
              </div>

              <p className="text-xs text-purple-200 text-center leading-relaxed">
                {isInsufficient
                  ? "KAABIL never generates fabricated scores. Complete a diagnostic assessment or practical project to establish your verified readiness baseline."
                  : `Your preparation aligns with national standards for ${readiness.careerTitle}. Evaluated deterministically with zero hallucination.`}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-purple-300">
              <span>Audited Version:</span>
              <span className="font-mono text-[10px] text-amber-300">v1.0 • Cryptographic Audit</span>
            </div>
          </div>

          {/* 5-Dimension Preparation Rubric */}
          <div className="md:col-span-7 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                5-Dimension Preparation Rubric
              </h2>
              <span className="text-xs text-purple-700 font-bold font-mono bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Total: {readiness ? `${readiness.overallScore ?? 0} / 100 Points` : "Weighted Formula"}
              </span>
            </div>

            {readiness ? (
              <div className="space-y-3 pt-1">
                {/* Dim 1: Knowledge (20%) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">1. Domain Knowledge (Weight: 20%)</span>
                    <span className="font-bold text-purple-700">
                      {readiness.dimensions.careerKnowledge.score}% ({readiness.dimensions.careerKnowledge.weightedPoints} / 20 pts)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${readiness.dimensions.careerKnowledge.score}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {readiness.dimensions.careerKnowledge.evidencePoints[0] || readiness.dimensions.careerKnowledge.missingEvidence[0]}
                  </p>
                </div>

                {/* Dim 2: Education (25%) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">2. Education & Eligibility (Weight: 25%)</span>
                    <span className="font-bold text-indigo-700">
                      {readiness.dimensions.educationalPreparation.score}% ({readiness.dimensions.educationalPreparation.weightedPoints} / 25 pts)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${readiness.dimensions.educationalPreparation.score}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {readiness.dimensions.educationalPreparation.evidencePoints[0] || readiness.dimensions.educationalPreparation.missingEvidence[0]}
                  </p>
                </div>

                {/* Dim 3: Skill Genome (25%) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">3. Demonstrated Skills (Weight: 25%)</span>
                    <span className="font-bold text-emerald-700">
                      {readiness.dimensions.skillDevelopment.score}% ({readiness.dimensions.skillDevelopment.weightedPoints} / 25 pts)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${readiness.dimensions.skillDevelopment.score}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {readiness.dimensions.skillDevelopment.evidencePoints[0] || readiness.dimensions.skillDevelopment.missingEvidence[0]}
                  </p>
                </div>

                {/* Dim 4: Practical Projects (15%) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">4. Practical Projects (Weight: 15%)</span>
                    <span className="font-bold text-blue-700">
                      {readiness.dimensions.practicalLearning.score}% ({readiness.dimensions.practicalLearning.weightedPoints} / 15 pts)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${readiness.dimensions.practicalLearning.score}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {readiness.dimensions.practicalLearning.evidencePoints[0] || readiness.dimensions.practicalLearning.missingEvidence[0]}
                  </p>
                </div>

                {/* Dim 5: Learning Sprints (15%) */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-800">5. Learning Sprints (Weight: 15%)</span>
                    <span className="font-bold text-amber-700">
                      {readiness.dimensions.milestoneProgress.score}% ({readiness.dimensions.milestoneProgress.weightedPoints} / 15 pts)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: `${readiness.dimensions.milestoneProgress.score}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {readiness.dimensions.milestoneProgress.evidencePoints[0] || readiness.dimensions.milestoneProgress.missingEvidence[0]}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-gray-500">
                Loading preparation rubric...
              </div>
            )}
          </div>
        </div>

        {/* Student-Friendly Next Best Action Box */}
        {readiness?.nextBestAction && (
          <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50/80 via-white to-indigo-50/50 p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-600 text-white text-[10px] font-bold">
                    <Zap className="mr-1 h-3 w-3 fill-white" />
                    RECOMMENDED NEXT ACTION
                  </Badge>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +{readiness.nextBestAction.impactPoints} Readiness Points
                  </span>
                </div>
                <h4 className="mt-2 text-base font-bold text-gray-900">
                  {language === "hi" && readiness.nextBestAction.titleHi
                    ? readiness.nextBestAction.titleHi
                    : language === "hinglish" && readiness.nextBestAction.titleHinglish
                    ? readiness.nextBestAction.titleHinglish
                    : readiness.nextBestAction.title}
                </h4>
                <p className="mt-0.5 text-xs text-gray-600 max-w-2xl leading-relaxed">
                  {readiness.nextBestAction.description}
                </p>
              </div>

              <Link href={readiness.nextBestAction.actionUrl}>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs">
                  Take Action &rarr;
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Action Pathway Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/student/assessments" className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 w-fit mb-3">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Take Skill Assessment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pass proctored diagnostic checkpoints to earn verified skill points.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-600">
              <span>Start Assessment</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </Link>

          <Link href="/student/learning-plan" className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 w-fit mb-3">
                <FolderGit2 className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Build Portfolio Projects
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Submit practical deliverables across STEM, Healthcare, Commerce, and Arts.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600">
              <span>Explore Projects Hub</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </Link>

          <Link href="/student/skill-tree" className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 w-fit mb-3">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Career Skill Tree
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Explore prerequisite graphs and track mastery across 134 pathways.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-indigo-600">
              <span>View Skill Tree</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </Link>

          <Link href="/student/passport" className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 w-fit mb-3">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900">
                Digital Skill Passport
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View cryptographically signed credentials and verified evidence history.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600">
              <span>Open Passport</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </div>
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
          <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
          <span>
            <strong>Official Guidance Disclaimer:</strong> {readiness?.disclaimer || "The Career Readiness Index (CRI) is an educational preparation assessment framework. It measures alignment with published educational benchmarks and does NOT predict admission probability, competitive exam rank, or guaranteed employment."}
          </span>
        </div>
      </div>
    </PortalLayout>
  );
}
