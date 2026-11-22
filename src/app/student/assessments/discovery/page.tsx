"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  Award,
  ShieldCheck,
  TrendingUp,
  Stethoscope,
  Binary,
  Coins,
  Scale,
  Palette,
  Sprout,
  Wrench,
  Microscope,
  Calculator,
  Atom,
  Feather,
  CheckSquare,
  FileSpreadsheet,
  Users,
  Lightbulb,
  Image,
  Cpu,
  Megaphone,
  HeartHandshake,
  BarChart3,
  FileText,
  ShieldAlert,
  DollarSign,
  Sun,
  Landmark,
  Laptop,
  GraduationCap,
  Code,
  Briefcase,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DISCOVERY_QUESTIONS, DiscoveryQuestion } from "@/data/discoveryQuestions";

// Icon mapping helper
const ICON_MAP: Record<string, React.ElementType> = {
  Stethoscope,
  Binary,
  Coins,
  Scale,
  Palette,
  Sprout,
  Wrench,
  Compass,
  Microscope,
  Calculator,
  Atom,
  TrendingUp,
  BookOpen,
  Terminal: Code,
  Feather,
  Sparkles,
  CheckSquare,
  FileSpreadsheet,
  Users,
  Lightbulb,
  Image,
  Cpu,
  Megaphone,
  HeartHandshake,
  BarChart3,
  Award,
  FileText,
  ShieldAlert,
  DollarSign,
  Sun,
  Landmark,
  Laptop,
  Cross: Stethoscope,
  GraduationCap,
  Code,
  Briefcase,
};

export default function DiscoveryAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [language, setLanguage] = useState<"en" | "hi" | "hinglish">("en");
  const [educationStage, setEducationStage] = useState<string>("CLASS_12");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [autoSavedTime, setAutoSavedTime] = useState<string | null>(null);

  // Fetch active session user's education stage
  useEffect(() => {
    async function loadUserStage() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          const stage = data?.user?.studentProfile?.educationStage;
          if (stage) {
            setEducationStage(stage);
          }
        }
      } catch {
        // ignore
      }
    }
    loadUserStage();
  }, []);

  // Restore saved state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("kaabil_discovery_answers");
      if (saved) {
        setAnswers(JSON.parse(saved));
        setAutoSavedTime("Restored from draft");
      }
    } catch {
      // ignore
    }
  }, []);

  // Autosave to localStorage whenever answers change
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      try {
        localStorage.setItem("kaabil_discovery_answers", JSON.stringify(answers));
        setAutoSavedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } catch {
        // ignore
      }
    }
  }, [answers]);

  const currentQ: DiscoveryQuestion = DISCOVERY_QUESTIONS[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / DISCOVERY_QUESTIONS.length) * 100);

  const getQuestionTitle = (q: DiscoveryQuestion) => {
    if (language === "hi") return q.hindiTitle;
    if (language === "hinglish") return q.hinglishTitle;
    return q.title;
  };

  const getQuestionSubtitle = (q: DiscoveryQuestion) => {
    if (language === "hi") return q.hindiSubtitle;
    if (language === "hinglish") return q.hinglishSubtitle;
    return q.subtitle;
  };

  const getOptionLabel = (opt: any) => {
    if (language === "hi") return opt.hindiLabel || opt.label;
    if (language === "hinglish") return opt.hinglishLabel || opt.label;
    return opt.label;
  };

  const handleSelectOption = (optionId: string) => {
    if (currentQ.isMultiSelect) {
      const currentList: string[] = answers[currentQ.id] || [];
      // Handle 'not_sure' mutually exclusive logic
      if (optionId === "not_sure") {
        setAnswers({ ...answers, [currentQ.id]: ["not_sure"] });
        return;
      }

      let updated = currentList.filter((id) => id !== "not_sure");
      if (updated.includes(optionId)) {
        updated = updated.filter((id) => id !== optionId);
      } else {
        const max = currentQ.maxSelections || 4;
        if (updated.length < max) {
          updated.push(optionId);
        }
      }
      setAnswers({ ...answers, [currentQ.id]: updated });
    } else {
      setAnswers({ ...answers, [currentQ.id]: optionId });
    }
  };

  const isOptionSelected = (optionId: string) => {
    const current = answers[currentQ.id];
    if (Array.isArray(current)) {
      return current.includes(optionId);
    }
    return current === optionId;
  };

  const canProceed = () => {
    const current = answers[currentQ.id];
    if (Array.isArray(current)) {
      return current.length > 0;
    }
    return !!current;
  };

  const handleNext = () => {
    if (currentStep < DISCOVERY_QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to restart this discovery assessment?")) {
      setAnswers({});
      setCurrentStep(0);
      setResult(null);
      localStorage.removeItem("kaabil_discovery_answers");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/assessment/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: answers,
          educationStage,
          preferredLanguage: language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        localStorage.removeItem("kaabil_discovery_answers");
      } else {
        alert("Unable to generate results. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Dashboard", "Career Discovery Assessment"]}
    >
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Transparent Educational Disclaimer Banner */}
        <div className="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50/70 p-3.5 text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0" />
            <span>
              <strong>Educational Self-Exploration:</strong> This tool maps your stated interests and strengths to verified Indian career pathways. It is not a clinical or psychological test.
            </span>
          </div>
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-white/80 rounded-lg p-0.5 border border-purple-200">
            <button
              onClick={() => setLanguage("en")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === "en" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage("hi")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === "hi" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage("hinglish")}
              className={`px-2 py-0.5 rounded text-xs font-medium transition ${
                language === "hinglish" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>

        {!result ? (
          /* ========================================================================= */
          /* ASSESSMENT QUESTIONS VIEW (1 QUESTION PER SCREEN) */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Header & Progress Indicator */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    Question {currentStep + 1} of {DISCOVERY_QUESTIONS.length}
                  </Badge>
                  <span className="text-xs text-slate-500 font-medium">
                    Dimension: {currentQ.dimension.replace(/_/g, " ")}
                  </span>
                </div>
                {autoSavedTime && (
                  <span className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Autosaved {autoSavedTime}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-indigo-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Card with Framer Motion Transition */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <Card className="border border-slate-200/90 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50/50 via-white to-indigo-50/30 pb-4 border-b border-slate-100">
                    <CardTitle className="text-xl md:text-2xl text-slate-900 font-bold leading-snug">
                      {getQuestionTitle(currentQ)}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {getQuestionSubtitle(currentQ)}
                    </p>
                  </CardHeader>

                  <CardContent className="p-6">
                    {/* Scenario prompt if present */}
                    {currentQ.scenario && (
                      <div className="mb-4 rounded-xl bg-amber-50/70 border border-amber-200/80 p-3.5 text-xs text-amber-900 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Situation:</strong> {language === "hi" && currentQ.hindiScenario ? currentQ.hindiScenario : currentQ.scenario}
                        </span>
                      </div>
                    )}

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {currentQ.options.map((opt) => {
                        const isSelected = isOptionSelected(opt.id);
                        const IconComponent = ICON_MAP[opt.iconName] || Sparkles;

                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectOption(opt.id)}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all relative ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                            }`}
                          >
                            <div
                              className={`p-2 rounded-lg shrink-0 ${
                                isSelected
                                  ? "bg-primary text-white"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>

                            <div className="flex-1 pr-6">
                              <h4
                                className={`text-sm font-semibold leading-tight ${
                                  isSelected ? "text-primary" : "text-slate-800"
                                }`}
                              >
                                {getOptionLabel(opt)}
                              </h4>
                              {opt.description && (
                                <p className="text-xs text-slate-500 mt-1 leading-normal">
                                  {opt.description}
                                </p>
                              )}
                            </div>

                            {/* Selection checkmark */}
                            <div className="absolute right-3.5 top-3.5">
                              {isSelected ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border border-slate-300" />
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2 border-slate-200 text-slate-600"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || submitting}
                  className="gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white font-medium px-6 shadow-sm"
                >
                  {submitting ? (
                    "Analyzing..."
                  ) : currentStep === DISCOVERY_QUESTIONS.length - 1 ? (
                    <>
                      Complete Assessment <Sparkles className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Next Question <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* ASSESSMENT RESULTS VIEW */
          /* ========================================================================= */
          <div className="space-y-6">
            {/* Results Hero */}
            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs mb-2">
                    <CheckCircle2 className="h-3 w-3 mr-1 inline" /> Discovery Profile Ready
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Your Personalized Career Discovery Profile
                  </h2>
                  <p className="text-sm text-slate-600 mt-1 max-w-xl">
                    Based on your stated interests, strengths, and workstyle, here are your top-matched educational streams and explainable career pathways.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setResult(null);
                    setCurrentStep(0);
                  }}
                  className="gap-2 self-start md:self-auto border-purple-200 text-purple-700 bg-white"
                >
                  <RotateCcw className="h-4 w-4" /> Retake Assessment
                </Button>
              </div>

              {/* Identified Strengths & Stream Alignment Badges */}
              <div className="mt-6 pt-5 border-t border-purple-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Primary Stream Alignment
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-primary text-white text-xs px-3 py-1 font-semibold">
                      {result.assessmentResult?.primaryStream}
                    </Badge>
                    {result.assessmentResult?.topStreams?.map((st: string) => (
                      <Badge key={st} variant="outline" className="bg-white border-slate-200 text-slate-700 text-xs">
                        {st}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Identified Strengths & Traits
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.assessmentResult?.identifiedTraits?.map((tr: string) => (
                      <Badge key={tr} variant="secondary" className="bg-purple-100/70 text-purple-800 text-xs">
                        {tr}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Uncertainty Notice if "Not Sure" was selected */}
              {result.assessmentResult?.choseNotSure && (
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <Compass className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Open Exploration Mode:</strong> You indicated uncertainty in some areas. KAABIL has prioritized versatile foundational pathways that keep your options open across disciplines.
                  </div>
                </div>
              )}
            </div>

            {/* Top Recommended Career Pathways (Top 3-5 with Full Explainability) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Top Recommended Career Pathways
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent scoring distinguishing interest alignment from formal regulatory prerequisites
                  </p>
                </div>
                <Link href="/student/discover">
                  <Button variant="ghost" className="text-xs text-primary gap-1">
                    Explore All Careers <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {result.recommendations?.map((rec: any, index: number) => {
                  const career = rec.career;
                  const isTopMatch = index === 0;

                  return (
                    <Card
                      key={career.id}
                      className={`border transition-all overflow-hidden ${
                        isTopMatch
                          ? "border-primary/40 bg-gradient-to-br from-white via-purple-50/20 to-white shadow-md ring-1 ring-primary/20"
                          : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <CardHeader className="p-5 pb-3">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isTopMatch && (
                                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-semibold">
                                  Top Recommendation
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs text-primary bg-primary/5 border-primary/20">
                                {career.streamTitle}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-slate-600 bg-slate-50">
                                {career.domainName}
                              </Badge>
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 pt-1">
                              {career.title}
                            </h4>
                            <p className="text-xs text-slate-600">
                              {career.tagline}
                            </p>
                          </div>

                          {/* Match Score Indicator */}
                          <div className="text-right shrink-0">
                            <div className="text-2xl font-black text-primary leading-none">
                              {rec.compatibilityScore}%
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium">
                              Interest Fit ({rec.scoreCategory?.replace(/_/g, " ")})
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-5 pt-2 space-y-4">
                        {/* Why Suited Explanation */}
                        <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3.5 text-xs text-purple-950">
                          <div className="font-semibold text-purple-900 mb-1 flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-purple-600" /> Why this career suits you:
                          </div>
                          <p>{rec.whySuited}</p>
                        </div>

                        {/* Breakdown Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {/* Aligned Strengths */}
                          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 space-y-1.5">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Aligned Strengths:
                            </span>
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                              {rec.alignedStrengths?.slice(0, 3).map((st: string, i: number) => (
                                <li key={i}>{st}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Skills to Improve */}
                          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 space-y-1.5">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> Skills to Build:
                            </span>
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                              {rec.skillsToImprove?.slice(0, 3).map((sk: string, i: number) => (
                                <li key={i}>{sk}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {/* Eligibility & Next Action */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-slate-800">
                              Prerequisite Status:
                            </span>
                            <Badge
                              variant="outline"
                              className={
                                rec.eligibility?.isEligibleToApply
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }
                            >
                              {rec.eligibility?.statusLabel || "Prerequisites Required"}
                            </Badge>
                          </div>

                          {rec.additionalQualificationsRequired && (
                            <p className="text-slate-600">
                              <strong>Prerequisite requirement:</strong> {rec.additionalQualificationsRequired}
                            </p>
                          )}

                          <div className="pt-1.5 border-t border-slate-200 text-primary font-medium flex items-center gap-1.5">
                            <ArrowRight className="h-3.5 w-3.5" /> Recommended Next Action: {rec.recommendedNextAction}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-1">
                          <Link href={`/careers/${career.slug}`} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                            View Full Career Blueprint <ChevronRight className="h-3.5 w-3.5" />
                          </Link>

                          <div className="flex items-center gap-2">
                            <Link href={`/compare?c1=${career.slug}`}>
                              <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200">
                                Compare
                              </Button>
                            </Link>
                            <Link href="/student/roadmap">
                              <Button size="sm" className="text-xs h-8 bg-primary text-white">
                                Start Roadmap
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
