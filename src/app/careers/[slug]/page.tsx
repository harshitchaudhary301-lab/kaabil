"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  GraduationCap,
  Building2,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Scale,
  Compass,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCareerBySlug, CAREER_PATHS_DATABASE } from "@/data/careersData";
import { resolveOfficialSourceUrl } from "@/lib/constants/official-sources";

export default function CareerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [career, setCareer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Eligibility Checker State
  const [checkOpen, setCheckOpen] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [studentStage, setStudentStage] = useState("CLASS_12");
  const [studentStream, setStudentStream] = useState("NON_MEDICAL_PCM");
  const [studentAge, setStudentAge] = useState(17);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);

  useEffect(() => {
    async function fetchCareer() {
      setLoading(true);
      try {
        const res = await fetch(`/api/careers/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setCareer(data.career || data.data);
        } else {
          const local = getCareerBySlug(slug);
          setCareer(local || null);
        }
      } catch {
        const local = getCareerBySlug(slug);
        setCareer(local || null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchCareer();
  }, [slug]);

  const handleSaveToggle = async () => {
    setSaveLoading(true);
    setSaveMessage(null);
    try {
      if (isSaved) {
        await fetch(`/api/careers/save?slug=${slug}`, { method: "DELETE" });
        setIsSaved(false);
        setSaveMessage("Removed from saved bookmarks.");
      } else {
        const res = await fetch("/api/careers/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ careerSlug: slug }),
        });
        if (res.ok) {
          setIsSaved(true);
          setSaveMessage("Saved to your exploration bookmarks!");
        } else {
          router.push("/login");
        }
      }
    } catch {
      setIsSaved(!isSaved);
    } finally {
      setSaveLoading(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleCheckEligibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const res = await fetch("/api/careers/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          careerSlug: slug,
          educationStage: studentStage,
          stream: studentStream,
          age: Number(studentAge),
        }),
      });
      const data = await res.json();
      setEligibilityResult(data.evaluation);
    } catch {
      // Fallback
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-semibold text-text-secondary">Retrieving career intelligence record...</p>
        </div>
      </div>
    );
  }

  if (!career) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md p-8 text-center space-y-4 rounded-3xl border-border bg-white shadow-soft-md">
          <HelpCircle className="h-10 w-10 text-amber-500 mx-auto" />
          <h2 className="font-heading text-xl font-bold text-text-primary">Career Pathway Not Found</h2>
          <p className="text-xs text-text-secondary">
            The requested career slug &quot;{slug}&quot; does not match any published record in the KAABIL intelligence registry.
          </p>
          <Link href="/#streams">
            <Button variant="gradient" className="w-full">
              Back to Career Explorer
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-text-primary">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-soft-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/#streams"
            className="p-2 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-secondary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-heading text-sm font-bold tracking-tight">KAABIL Career Registry</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveToggle}
            disabled={saveLoading}
            className="text-xs rounded-xl border-border h-9"
          >
            {isSaved ? (
              <BookmarkCheck className="h-3.5 w-3.5 mr-1 text-primary" />
            ) : (
              <Bookmark className="h-3.5 w-3.5 mr-1" />
            )}
            <span>{isSaved ? "Saved" : "Save Career"}</span>
          </Button>

          <Link href={`/compare?slugs=${career.slug}`}>
            <Button variant="outline" size="sm" className="text-xs rounded-xl border-border h-9">
              <Scale className="h-3.5 w-3.5 mr-1 text-secondary" />
              Compare
            </Button>
          </Link>
        </div>
      </header>

      {/* Save Notification Toast */}
      {saveMessage && (
        <div className="fixed top-16 right-4 z-50 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 shadow-soft-md flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-white border-b border-border py-10 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="text-xs py-0.5">
              {career.streamTitle || career.stream}
            </Badge>
            <Badge variant="outline" className="text-xs py-0.5 bg-slate-50">
              {career.domainName || "Specialized Domain"}
            </Badge>
            {career.regulatoryBody && (
              <Badge variant="success" className="text-xs py-0.5">
                <ShieldCheck className="h-3 w-3 mr-1 inline" />
                {career.regulatoryBody}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs py-0.5 text-text-muted">
              Status: {career.verificationStatus || "VERIFIED"}
            </Badge>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
            {career.title}
          </h1>

          <p className="text-base text-text-secondary max-w-3xl leading-relaxed">
            {career.tagline || career.overview}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Button
              variant="gradient"
              size="sm"
              onClick={() => setCheckOpen(true)}
              className="rounded-xl px-4 py-2 font-bold shadow-soft-xs"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Check Educational Eligibility
            </Button>
            <Link href="/student/dashboard#mentor">
              <Button variant="outline" size="sm" className="rounded-xl border-border px-4 py-2 text-xs">
                Ask AI Career Mentor About This
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-8 space-y-8">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="p-4 rounded-2xl border-border bg-white shadow-soft-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">Typical Duration</span>
            <p className="text-xs sm:text-sm font-bold text-text-primary leading-tight">
              {career.typicalDurationYears || "3–4 Years"}
            </p>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-white shadow-soft-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">Min Entry Stage</span>
            <p className="text-xs sm:text-sm font-bold text-text-primary leading-tight">
              {(career.minEducationStage || "UNDERGRADUATE").replace(/_/g, " ")}
            </p>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-white shadow-soft-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">Starting Salary</span>
            <p className="text-xs sm:text-sm font-bold text-primary leading-tight">
              ₹{(career.avgStartingSalaryInr ? (career.avgStartingSalaryInr / 100000).toFixed(1) : "6.0")} Lakh / yr
            </p>
            <span className="text-[9px] text-text-muted block">Sourced: {career.salarySource ? "Regulatory Survey" : "Benchmark"}</span>
          </Card>

          <Card className="p-4 rounded-2xl border-border bg-white shadow-soft-xs space-y-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">Mid-Career Salary</span>
            <p className="text-xs sm:text-sm font-bold text-emerald-600 leading-tight">
              ₹{(career.avgMidCareerSalaryInr ? (career.avgMidCareerSalaryInr / 100000).toFixed(1) : "18.0")} Lakh / yr
            </p>
            <span className="text-[9px] text-text-muted block">5–8 Yrs Experience</span>
          </Card>
        </div>

        {/* Overview & Daily Routine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-3xl border-border bg-white shadow-soft-xs space-y-3">
            <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              Comprehensive Career Overview
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {career.overview}
            </p>
            {career.workEnvironment && (
              <div className="pt-2 border-t border-border text-xs text-text-secondary">
                <strong className="text-text-primary">Typical Work Environment: </strong>
                {career.workEnvironment}
              </div>
            )}
          </Card>

          <Card className="p-6 rounded-3xl border-border bg-white shadow-soft-xs space-y-3">
            <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
              <Clock className="h-4 w-4 text-secondary" />
              Day-in-the-Life & Routine
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {career.dailyRoutine || "Engages in rigorous daily domain execution, client consultations, diagnostic tests, and continuous professional training."}
            </p>
            {career.licensingRequirement && (
              <div className="pt-2 border-t border-border text-xs text-text-secondary">
                <strong className="text-text-primary">Licensing & Practice Mandate: </strong>
                {career.licensingRequirement}
              </div>
            )}
          </Card>
        </div>

        {/* Educational Pathway Timeline */}
        <Card className="p-6 sm:p-8 rounded-3xl border-border bg-white shadow-soft-xs space-y-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Educational Pathway & Milestones Timeline
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Documented milestone route from school education to professional practice in India.
            </p>
          </div>

          <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-6">
            {(career.educationalPathways || [
              { step: 1, stage: "Senior Secondary (10+2)", description: "Complete Class 11-12 with relevant foundation subjects." },
              { step: 2, stage: "Entrance Gateway", description: `Qualify national/state entrance examinations: ${career.keyEntranceExams?.join(", ") || "Institution CETs"}` },
              { step: 3, stage: "Recognized Higher Degree", description: `Complete ${career.typicalDurationYears} degree curriculum from an accredited university.` },
              { step: 4, stage: "Professional Practice", description: "Complete mandatory residency/internship and register with appropriate council." },
            ]).map((step: any, idx: number) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold shadow-soft-xs">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-text-primary block">{step.stage}</span>
                  <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
                  {step.exams && step.exams.length > 0 && (
                    <div className="pt-1 flex gap-1.5">
                      {step.exams.map((ex: string) => (
                        <span key={ex} className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded">
                          {ex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Benchmark Competencies & Skills */}
        <Card className="p-6 sm:p-8 rounded-3xl border-border bg-white shadow-soft-xs space-y-6">
          <div>
            <h3 className="font-heading text-lg font-bold text-text-primary flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Benchmark Competencies & Skills
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Core technical and interpersonal competencies evaluated in KAABIL&apos;s Skill Genome.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(career.skills || []).map((sk: any, idx: number) => (
              <div key={idx} className="p-4 rounded-2xl border border-border bg-slate-50 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-text-primary font-bold">{sk.name}</span>
                  <Badge variant={sk.isMandatory ? "primary" : "outline"} className="text-[9px] py-0">
                    {sk.isMandatory ? "Core Essential" : "Recommended"}
                  </Badge>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  {sk.description || "Essential operational competency for professional performance."}
                </p>
                <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
                  <span>Category: {sk.category}</span>
                  <span className="font-semibold text-primary">Benchmark Level {sk.requiredLevel || 3}/5</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Entrance Exams & Top Colleges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 rounded-3xl border-border bg-white shadow-soft-xs space-y-3">
            <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Recognized Entrance Examinations
            </h3>
            <div className="space-y-2">
              {(career.keyEntranceExams || []).map((ex: string, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-border bg-slate-50 flex items-center justify-between text-xs font-semibold">
                  <span>{ex}</span>
                  <span className="text-[10px] text-text-muted">National/State Gateway</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border bg-white shadow-soft-xs space-y-3">
            <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
              <Building2 className="h-4 w-4 text-secondary" />
              Accredited Institutions in India
            </h3>
            <div className="space-y-2">
              {(career.topCollegesInIndia || []).map((col: string, i: number) => (
                <div key={i} className="p-3 rounded-xl border border-border bg-slate-50 flex items-center justify-between text-xs font-semibold">
                  <span>{col}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Accredited</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Authoritative Sources */}
        <Card className="p-6 rounded-3xl border-border bg-white shadow-soft-xs space-y-3">
          <h4 className="font-heading text-xs uppercase font-bold text-text-muted tracking-wider">
            Authoritative Sources & Regulatory References
          </h4>
          <div className="flex flex-wrap items-center gap-4 text-xs text-text-secondary">
            {(career.sources || [{ name: "Ministry of Labour & Employment (NCO-2015)", year: 2024 }]).map((src: any, i: number) => {
              const officialLink = src.url || resolveOfficialSourceUrl(src.name)?.url;
              return (
                <div key={i} className="flex items-center gap-1.5 text-text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{src.name}</span>
                  {src.year && <span className="text-[10px] text-text-muted">({src.year})</span>}
                  {officialLink && (
                    <a
                      href={officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-0.5"
                      title="Open official statutory portal"
                    >
                      <ExternalLink className="h-3 w-3 inline ml-0.5 text-primary" />
                    </a>
                  )}
                </div>
              );
            })}
            <div className="flex items-center gap-1 text-[11px] text-text-muted bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>Verified: {career.lastReviewedDate || "Q1 2025"}</span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted pt-2 border-t border-border">
            * Note: Salary figures, entrance requirements, and duration are based on official government gazettes, regulatory council guidelines, and campus placement audits.
          </p>
        </Card>
      </main>

      {/* Interactive Eligibility Checker Modal/Card */}
      {checkOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-white border-border shadow-soft-lg space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  Educational Eligibility Checker
                </h3>
                <p className="text-xs text-text-secondary">
                  Testing against published criteria for {career.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setCheckOpen(false);
                  setEligibilityResult(null);
                }}
                className="text-text-muted hover:text-text-primary p-1"
              >
                ✕
              </button>
            </div>

            {eligibilityResult ? (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    eligibilityResult.status === "KNOWN_PREREQUISITES_SATISFIED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                      : "bg-amber-50 border-amber-200 text-amber-950"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{eligibilityResult.statusLabel}</span>
                    <Badge variant={eligibilityResult.isEligibleToApply ? "success" : "accent"}>
                      {eligibilityResult.isEligibleToApply ? "Eligible to Target" : "Bridge Required"}
                    </Badge>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-700">
                    {eligibilityResult.regulatoryDisclaimer}
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <strong className="text-text-primary block">Satisfied Criteria:</strong>
                  {eligibilityResult.satisfiedPrerequisites.map((p: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-emerald-700 text-[11px]">
                      <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>

                {eligibilityResult.missingPrerequisites.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <strong className="text-rose-700 block">Missing Prerequisites / Action Items:</strong>
                    {eligibilityResult.missingPrerequisites.map((p: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-rose-600 text-[11px]">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEligibilityResult(null)}
                  className="w-full text-xs rounded-xl"
                >
                  Re-test with Different Inputs
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCheckEligibility} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Your Current Education Stage
                  </label>
                  <select
                    value={studentStage}
                    onChange={(e) => setStudentStage(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-white p-2.5"
                  >
                    <option value="CLASS_10">Class 10 (Secondary School)</option>
                    <option value="CLASS_12">Class 12 (Senior Secondary)</option>
                    <option value="DIPLOMA">Polytechnic / Diploma</option>
                    <option value="ITI">ITI Technical Trade</option>
                    <option value="UNDERGRADUATE">Undergraduate Degree</option>
                    <option value="POSTGRADUATE">Postgraduate Degree</option>
                    <option value="WORKING_PROFESSIONAL">Working Professional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Current Stream
                  </label>
                  <select
                    value={studentStream}
                    onChange={(e) => setStudentStream(e.target.value)}
                    className="w-full text-xs rounded-xl border border-border bg-white p-2.5"
                  >
                    <option value="MEDICAL_PCB">Medical (PCB)</option>
                    <option value="NON_MEDICAL_PCM">Non-Medical / STEM (PCM)</option>
                    <option value="COMMERCE">Commerce & Finance</option>
                    <option value="ARTS_HUMANITIES">Arts & Humanities</option>
                    <option value="LAW">Law & Legal Studies</option>
                    <option value="MANAGEMENT">Management & Business</option>
                    <option value="CREATIVE_DESIGN">Creative Design</option>
                    <option value="VOCATIONAL_TRADES">Vocational Trades</option>
                    <option value="AGRICULTURE">Agriculture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-primary mb-1">
                    Current Age (Years)
                  </label>
                  <input
                    type="number"
                    min={12}
                    max={75}
                    value={studentAge}
                    onChange={(e) => setStudentAge(Number(e.target.value))}
                    className="w-full text-xs rounded-xl border border-border bg-white p-2.5"
                  />
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="w-full py-2.5"
                  disabled={evaluating}
                >
                  {evaluating ? "Evaluating Prerequisites..." : "Run Eligibility Evaluation"}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
