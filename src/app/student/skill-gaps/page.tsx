"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  BrainCircuit,
  Compass,
  Award,
  Sparkles,
  TrendingUp,
  Settings,
  Scale,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  BookOpen,
  HelpCircle,
  FileBadge,
  Layers,
  Target,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CAREER_PATHS_DATABASE } from "@/data/careersData";
import { SkillGapAnalysisResult, SkillGapItem } from "@/lib/skill-gap/skill-gap-engine";



export default function SkillGapAnalyzerPage() {
  const [selectedCareer, setSelectedCareer] = useState<string>("ai-systems-engineer");
  const [analysis, setAnalysis] = useState<SkillGapAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async (slug: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/student/skill-gaps?careerSlug=${slug}`);
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else if (data.success && data.analyses?.length > 0) {
        setAnalysis(data.analyses[0]);
      } else {
        setError(data.error || "Could not generate skill gap analysis.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load skill gap data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(selectedCareer);
  }, [selectedCareer]);

  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      const res = await fetch("/api/student/skill-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetCareerSlug: selectedCareer }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch {
      // ignore
    } finally {
      setRecalculating(false);
    }
  };

  const filteredGaps = (analysis?.skillGaps || []).filter((g) => {
    if (filterSeverity === "ALL") return true;
    if (filterSeverity === "CRITICAL") return g.gapSeverity === "CRITICAL";
    if (filterSeverity === "MODERATE") return g.gapSeverity === "MODERATE";
    if (filterSeverity === "DEMONSTRATED") return g.gapStatus === "DEMONSTRATED";
    return true;
  });

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Student", "Skill Gap Analyzer"]}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-soft-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-bold font-heading text-slate-900">
                Intelligent Skill Gap Analyzer
              </h1>
              <Badge variant="outline" className="text-xs bg-slate-50">
                v1.0 Explainable
              </Badge>
            </div>
            <p className="text-sm text-slate-500 max-w-2xl">
              Deterministic, evidence-based diagnostic comparing your profile against verified statutory council & industry competency benchmarks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCareer}
              onChange={(e) => setSelectedCareer(e.target.value)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 shadow-soft-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {CAREER_PATHS_DATABASE.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title} ({c.stream.replace("_", " ")})
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRecalculate}
              disabled={recalculating}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${recalculating ? "animate-spin" : ""}`} />
              Recalculate
            </Button>

            <Link href={`/student/skill-tree?careerSlug=${selectedCareer}`}>
              <Button size="sm" variant="outline" className="gap-1.5 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100">
                <BrainCircuit className="h-3.5 w-3.5 text-purple-600" />
                Interactive Skill Tree
              </Button>
            </Link>

            <Link href="/student/mentor">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/95 text-white">
                <Sparkles className="h-3.5 w-3.5" />
                Ask AI Mentor
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card className="border-rose-200 bg-rose-50/50">
            <CardContent className="p-6 flex items-center gap-3 text-rose-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Unable to compute skill gaps</p>
                <p className="text-xs text-rose-600">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {!loading && analysis && (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                    <span>Overall Skill Coverage</span>
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {analysis.overallCoveragePercent}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Weighted</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-500"
                      style={{ width: `${analysis.overallCoveragePercent}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                    <span>Mandatory Competency</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {analysis.mandatoryCoveragePercent}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Core Requirements</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${analysis.mandatoryCoveragePercent}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                    <span>Evidence Quality Score</span>
                    <FileBadge className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {analysis.evidenceQualityScore}%
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Platform Verified</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className="bg-accent h-full rounded-full transition-all duration-500"
                      style={{ width: `${analysis.evidenceQualityScore}%` }}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-2">
                    <span>Target Career</span>
                    <Badge variant="outline" className="text-[10px] bg-slate-50">
                      {analysis.regulatoryBody || "Standard"}
                    </Badge>
                  </div>
                  <div className="text-sm font-bold text-slate-900 truncate" title={analysis.targetCareerTitle}>
                    {analysis.targetCareerTitle}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Stream: <span className="font-semibold text-slate-700">{analysis.targetStream.replace("_", " ")}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Analyzed at: {new Date(analysis.analyzedAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Priority Development Roadmap Action Banner */}
            {analysis.priorityDevelopmentAreas.length > 0 && (
              <Card className="border-primary/20 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Priority Development Actions (Top Gaps to Close)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {analysis.priorityDevelopmentAreas.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-white/90 border border-slate-200 shadow-soft-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900">{p.skillName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" /> ~{p.estimatedWeeks} wks
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 line-clamp-2">{p.reason}</p>
                        <p className="text-[10px] text-primary font-semibold flex items-center gap-1 pt-1">
                          <ArrowRight className="h-3 w-3" /> {p.suggestedActivity}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommended Assessments to Close Gaps */}
            {analysis.recommendedAssessments.length > 0 && (
              <Card className="border-emerald-200 bg-emerald-50/30">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <span className="font-bold text-sm text-slate-900">
                        Recommended Skill Verification Challenges
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-emerald-100/60 text-emerald-800">
                        Mint Verified SkillEvidence
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 max-w-2xl">
                      Take these objective assessments to turn missing or self-reported competencies into tamper-evident credentials in your Digital Skill Passport.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {analysis.recommendedAssessments.map((ra) => (
                      <Link
                        key={ra.assessmentId}
                        href={`/student/assessments/${ra.assessmentSlug}`}
                      >
                        <Button size="sm" variant="outline" className="bg-white hover:bg-emerald-50 text-xs border-emerald-300 text-emerald-800">
                          {ra.skillName} &rarr;
                        </Button>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Competency Gap Matrix */}
            <Card className="border-slate-200 bg-white shadow-soft-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Detailed Skill Competency Matrix
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Required proficiency vs current demonstrated evidence for {analysis.targetCareerTitle}
                  </p>
                </div>
                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {["ALL", "CRITICAL", "MODERATE", "DEMONSTRATED"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterSeverity(f)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        filterSeverity === f
                          ? "bg-primary text-white shadow-soft-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Skill & Category</th>
                      <th className="py-3 px-4">Level (Req / Current)</th>
                      <th className="py-3 px-4">Gap Status</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Evidence Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredGaps.map((g, idx) => {
                      const statusBadges: Record<string, { label: string; class: string }> = {
                        DEMONSTRATED: { label: "Demonstrated", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                        DEVELOPING: { label: "Developing", class: "bg-amber-50 text-amber-700 border-amber-200" },
                        SELF_REPORTED: { label: "Self Reported", class: "bg-blue-50 text-blue-700 border-blue-200" },
                        MISSING_EVIDENCE: { label: "Missing Evidence", class: "bg-slate-100 text-slate-700 border-slate-200" },
                        LEARNING_REQUIREMENT: { label: "Recommended", class: "bg-purple-50 text-purple-700 border-purple-200" },
                        EDUCATIONAL_PREREQUISITE: { label: "Prerequisite", class: "bg-rose-50 text-rose-700 border-rose-200" },
                      };

                      const severityBadges: Record<string, { label: string; class: string }> = {
                        CRITICAL: { label: "Critical", class: "bg-rose-100 text-rose-800" },
                        MODERATE: { label: "Moderate", class: "bg-amber-100 text-amber-800" },
                        MINOR: { label: "Minor", class: "bg-blue-100 text-blue-800" },
                        NONE: { label: "Satisfied", class: "bg-emerald-100 text-emerald-800" },
                      };

                      return (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div>{g.skillName}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {g.category} &bull; {g.isMandatory ? "Mandatory" : "Recommended"} (Wt: {g.importanceWeight})
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-700">
                                {g.currentLevel} / {g.requiredLevel}
                              </span>
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    g.currentLevel >= g.requiredLevel
                                      ? "bg-emerald-500"
                                      : g.currentLevel > 0
                                      ? "bg-amber-500"
                                      : "bg-slate-300"
                                  }`}
                                  style={{
                                    width: `${Math.min((g.currentLevel / g.requiredLevel) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                statusBadges[g.gapStatus]?.class || "bg-slate-100"
                              }`}
                            >
                              {statusBadges[g.gapStatus]?.label || g.gapStatus}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                severityBadges[g.gapSeverity]?.class || "bg-slate-100"
                              }`}
                            >
                              {severityBadges[g.gapSeverity]?.label || g.gapSeverity}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 max-w-xs text-slate-500 text-[11px] truncate" title={g.evidenceSummary}>
                            {g.evidenceSummary}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            {g.assessmentAvailable && g.relatedAssessmentSlug ? (
                              <Link href={`/student/assessments/${g.relatedAssessmentSlug}`}>
                                <Button size="sm" variant="outline" className="text-[11px] h-7 px-2.5">
                                  Assess
                                </Button>
                              </Link>
                            ) : (
                              <Link href="/student/mentor">
                                <Button size="sm" variant="ghost" className="text-[11px] h-7 px-2.5 text-slate-500">
                                  Guidance
                                </Button>
                              </Link>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            {/* Educational Prerequisites & Statutory Regulatory Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary" />
                    Educational Progression Benchmarks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.educationalGaps.map((eg, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                    >
                      {eg.isMet ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900">{eg.requirement}</p>
                        <p className="text-[11px] text-slate-500">{eg.gapNote}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-soft-xs">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-accent" />
                    Statutory Council & Certification Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.certificationGaps.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No statutory licensing required for this entry-level profile.</p>
                  ) : (
                    analysis.certificationGaps.map((cg, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50"
                      >
                        <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{cg.name}</p>
                            <Badge variant="outline" className="text-[9px]">
                              {cg.issuingBody}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{cg.gapNote}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Explainable Scoring Methodology & Disclaimer Card */}
            <Card className="border-slate-200 bg-slate-50/50">
              <CardContent className="p-4 text-xs text-slate-500 space-y-1">
                <p>
                  <strong>Scoring Formula:</strong>{" "}
                  <code className="text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {analysis.scoringFormula}
                  </code>
                </p>
                <p>
                  <strong>Pedagogical Disclaimer:</strong> {analysis.disclaimer}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
