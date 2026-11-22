"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Award,
  Sparkles,
  Scale,
  Settings,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Bot,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { PortalLayout, NavItem } from "@/components/shared/PortalLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STUDENT_NAV: NavItem[] = [
  { title: "Dashboard", href: "/student/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: "AI Career Mentor", href: "/student/mentor", icon: <Sparkles className="h-4 w-4" />, badge: "AI" },
  { title: "Skill Assessments", href: "/student/assessments", icon: <Award className="h-4 w-4" />, badge: "Verify" },
  { title: "Career Digital Twin", href: "/student/digital-twin", icon: <BrainCircuit className="h-4 w-4" />, badge: "Twin" },
  { title: "AI Career Discovery", href: "/student/discover", icon: <Sparkles className="h-4 w-4" /> },
  { title: "Stream Selector", href: "/stream-selector", icon: <Compass className="h-4 w-4" /> },
  { title: "Compare Careers", href: "/compare", icon: <Scale className="h-4 w-4" /> },
  { title: "Explore Careers", href: "/careers", icon: <Compass className="h-4 w-4" /> },
  { title: "Settings & Privacy", href: "/student/settings", icon: <Settings className="h-4 w-4" /> },
];

export default function AssessmentResultPage() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    loadResult();
  }, [attemptId]);

  async function loadResult() {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/assessments/results/${attemptId}`);
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      }
    } catch (err) {
      console.error("[AssessmentResultPage] Failed to fetch result:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleCopyHash(hash: string) {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  }

  if (loading) {
    return (
      <PortalLayout
        portalName="Student Portal"
        portalRole="STUDENT"
        navItems={STUDENT_NAV}
        breadcrumbs={["Dashboard", "Skill Assessments", "Results"]}
      >
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-2 text-xs text-slate-500">Retrieving official assessment scorecard...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (!result) {
    return (
      <PortalLayout
        portalName="Student Portal"
        portalRole="STUDENT"
        navItems={STUDENT_NAV}
        breadcrumbs={["Dashboard", "Skill Assessments", "Results"]}
      >
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white dark:bg-slate-900 dark:border-slate-800">
          <Award className="mx-auto h-10 w-10 text-slate-500 dark:text-slate-400" />
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
            Assessment Result Not Found
          </h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            The attempt record could not be located.
          </p>
          <Link href="/student/assessments" className="mt-4 inline-block">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-semibold">
              Return to Assessments
            </Button>
          </Link>
        </div>
      </PortalLayout>
    );
  }

  const passed = result.passed;

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Dashboard", "Skill Assessments", "Results"]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Score & Verdict Hero */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 shadow-xs transition-all ${
            passed
              ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 via-white to-emerald-50/30 dark:border-emerald-900/50 dark:bg-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20"
              : "border-amber-200 bg-gradient-to-br from-amber-50/40 via-white to-slate-50 dark:border-amber-900/50 dark:bg-slate-900"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <Badge
                className={`text-xs gap-1.5 py-1 px-3 ${
                  passed
                    ? "bg-emerald-600 text-white"
                    : "bg-amber-600 text-white"
                }`}
              >
                {passed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Assessment Passed
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" /> Revision Recommended
                  </>
                )}
              </Badge>

              <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {result.assessmentTitle}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
                Skill Tested: <span className="font-semibold text-primary">{result.targetSkillName}</span> • Passing Threshold: {result.passingPercentage}%
              </p>
            </div>

            {/* Score Ring */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-5 shadow-xs shrink-0 dark:border-slate-800 dark:bg-slate-800">
              <div
                className={`text-4xl font-extrabold ${
                  passed ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {result.scorePercentage}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {result.totalScore} / {result.maxScore} Points
              </div>
            </div>
          </div>

          {/* CRI Impact Banner */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white/80 p-4 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-800/80">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className={`h-4 w-4 ${passed ? "text-emerald-600" : "text-amber-500"}`}
              />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Career Readiness Index (CRI) Impact
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              {result.criImpactSummary}
            </p>
          </div>
        </div>

        {/* Tamper-Evident Evidence Credential Card if Passed */}
        {passed && (
          <Card className="border-emerald-200 bg-emerald-50/20 dark:border-emerald-900/40 dark:bg-emerald-950/10">
            <CardHeader className="p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    KAABIL Verified Skill Evidence Credential
                  </CardTitle>
                </div>
                <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                  Tamper-Evident Proof
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                This verification record has been generated and cryptographically indexed into the student&apos;s Career Digital Twin. Employers and academic institutions can verify this evidence via the Digital Skill Passport.
              </p>

              <div className="rounded-lg bg-white p-3 border border-slate-200 space-y-2 dark:border-slate-800 dark:bg-slate-800">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Issuer:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    KAABIL Automated Assessment Engine (v1.0)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Verification Taxonomy:</span>
                  <span className="font-semibold text-emerald-600">
                    Layer 2: Automated Assessment (Verified)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Evidence ID:</span>
                  <span className="font-mono text-slate-600 dark:text-slate-400">
                    {result.evidenceId || attemptId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Demonstrated Strengths
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {result.strengths.map((str: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Areas for Development
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {result.improvements.map((imp: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Question Review Section */}
        {result.detailedQuestionResults && result.detailedQuestionResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Detailed Question Analysis & Explanations
            </h3>

            <div className="space-y-3">
              {result.detailedQuestionResults.map((q: any, idx: number) => (
                <Card
                  key={q.questionId}
                  className={`border-slate-200 dark:border-slate-800 ${
                    q.isCorrect
                      ? "border-l-4 border-l-emerald-500"
                      : "border-l-4 border-l-amber-500"
                  }`}
                >
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Question {idx + 1}
                      </span>
                      <Badge
                        variant={q.isCorrect ? "success" : "warning"}
                        className={`text-[10px] ${
                          q.isCorrect
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {q.isCorrect ? `+${q.pointsAwarded} Pts` : "0 Pts"}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200">
                      {q.questionText}
                    </p>

                    <div className="flex gap-4 text-xs pt-1">
                      <div>
                        <span className="text-slate-400">Your Choice: </span>
                        <span className="font-bold">
                          {q.selectedOptionKey ? `Option ${q.selectedOptionKey}` : "Unanswered"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">Correct: </span>
                        <span className="font-bold text-emerald-600">Option {q.correctOptionKey}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 block mb-0.5">
                        Conceptual Explanation:
                      </span>
                      {q.explanation}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <Link href="/student/assessments">
            <Button variant="outline" size="sm" className="text-xs">
              Back to Assessments
            </Button>
          </Link>

          <div className="flex gap-2">
            <Link href="/student/mentor">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <Bot className="h-3.5 w-3.5 text-primary" />
                <span>Discuss with AI Mentor</span>
              </Button>
            </Link>
            <Link href="/student/digital-twin">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-xs gap-1.5">
                <BrainCircuit className="h-3.5 w-3.5" />
                <span>View Digital Twin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
