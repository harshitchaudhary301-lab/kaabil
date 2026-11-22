"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Compass,
  GraduationCap,
  BookOpen,
  Target,
  Award,
  Layers,
  HelpCircle,
  Building2,
  Map,
  Wrench,
  Loader2,
  Shield,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// Education Stage Options
const STUDY_OPTIONS = [
  {
    id: "CLASS_10",
    title: "Class 10",
    subtitle: "Secondary School",
    description: "Preparing for stream selection (Science, Commerce, Arts, or Vocational).",
    icon: BookOpen,
    color: "from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200",
    activeColor: "ring-blue-500 border-blue-500 bg-blue-50/70 text-blue-950",
  },
  {
    id: "CLASS_12",
    title: "Class 11–12",
    subtitle: "Senior Secondary",
    description: "Choosing degree courses, college cutoffs, entrance exams, or diplomas.",
    icon: GraduationCap,
    color: "from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200",
    activeColor: "ring-purple-500 border-purple-500 bg-purple-50/70 text-purple-950",
  },
  {
    id: "UNDERGRADUATE",
    title: "College / UG",
    subtitle: "Undergraduate Degree",
    description: "Enrolled in BA, BSc, BTech, BCom, Law, Design, or Polytechnic.",
    icon: Building2,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200",
    activeColor: "ring-emerald-500 border-emerald-500 bg-emerald-50/70 text-emerald-950",
  },
  {
    id: "POSTGRADUATE",
    title: "Graduate",
    subtitle: "Master's or Early Career",
    description: "Postgraduate student, working professional, or preparing for job transition.",
    icon: Award,
    color: "from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200",
    activeColor: "ring-amber-500 border-amber-500 bg-amber-50/70 text-amber-950",
  },
];

// Career Clarity Options
const CLARITY_OPTIONS = [
  {
    id: "CLEAR",
    title: "Yes, I know my goal.",
    subtitle: "Goal is Set",
    description: "I already have a specific dream role or degree in mind and want a direct roadmap.",
    icon: Target,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200",
    activeColor: "ring-emerald-500 border-emerald-500 bg-emerald-50/70 text-emerald-950",
  },
  {
    id: "FEW_OPTIONS",
    title: "I have a few options.",
    subtitle: "Comparing Paths",
    description: "I am deciding between 2 or 3 careers and want to compare pros, cons, and salary trends.",
    icon: Layers,
    color: "from-purple-500/10 to-indigo-500/10 text-purple-700 border-purple-200",
    activeColor: "ring-purple-500 border-purple-500 bg-purple-50/70 text-purple-950",
  },
  {
    id: "CONFUSED",
    title: "No, I am confused.",
    subtitle: "Need Guidance",
    description: "I feel overwhelmed with choices and want friendly guidance to discover where I fit.",
    icon: HelpCircle,
    color: "from-amber-500/10 to-rose-500/10 text-amber-700 border-amber-200",
    activeColor: "ring-amber-500 border-amber-500 bg-amber-50/70 text-amber-950",
  },
];

// Primary Need Options
const NEED_OPTIONS = [
  {
    id: "DISCOVER_CAREER",
    title: "Discover my career.",
    subtitle: "Career Exploration",
    description: "Find career paths matched to my natural interests, personality, and strengths.",
    icon: Compass,
    color: "from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200",
    activeColor: "ring-blue-500 border-blue-500 bg-blue-50/70 text-blue-950",
  },
  {
    id: "COURSES_COLLEGES",
    title: "Find courses and colleges.",
    subtitle: "Education Pathways",
    description: "Explore top colleges, degree comparisons, entrance exams, and eligibility.",
    icon: Building2,
    color: "from-purple-500/10 to-pink-500/10 text-purple-700 border-purple-200",
    activeColor: "ring-purple-500 border-purple-500 bg-purple-50/70 text-purple-950",
  },
  {
    id: "LEARN_SKILLS",
    title: "Learn new skills.",
    subtitle: "Skill Building",
    description: "Check my skill baseline and start practical, bite-sized learning modules.",
    icon: Wrench,
    color: "from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200",
    activeColor: "ring-amber-500 border-amber-500 bg-amber-50/70 text-amber-950",
  },
  {
    id: "BUILD_ROADMAP",
    title: "Build my career roadmap.",
    subtitle: "Action Plan",
    description: "Get a clear, week-by-week personalized progression plan towards my goal.",
    icon: Map,
    color: "from-emerald-500/10 to-teal-500/10 text-emerald-700 border-emerald-200",
    activeColor: "ring-emerald-500 border-emerald-500 bg-emerald-50/70 text-emerald-950",
  },
];

export default function SmartOnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();

  // Current Screen: 1, 2, or 3
  const [currentStep, setCurrentStep] = useState(1);

  // Selections
  const [educationStage, setEducationStage] = useState<string>("CLASS_12");
  const [goalClarity, setGoalClarity] = useState<string>("CONFUSED");
  const [primaryNeed, setPrimaryNeed] = useState<string>("DISCOVER_CAREER");

  // Loading & error state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load existing progress draft
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/student/onboarding/progress");
        if (res.ok) {
          const data = await res.json();
          if (data.stepData) {
            const d = data.stepData;
            if (d.educationStage) setEducationStage(d.educationStage);
            if (d.goalClarity) setGoalClarity(d.goalClarity);
            if (d.primaryNeed) setPrimaryNeed(d.primaryNeed);
            if (data.currentStep && data.currentStep >= 1 && data.currentStep <= 3) {
              setCurrentStep(data.currentStep);
            }
          }
        }
      } catch {
        // Ignore offline or initial state
      }
    }
    loadProgress();
  }, []);

  // Save intermediate step progress
  const saveStepProgress = async (step: number) => {
    try {
      await fetch("/api/student/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStep: step,
          stepData: {
            educationStage,
            goalClarity,
            primaryNeed,
          },
        }),
      });
    } catch {
      // Ignore background save
    }
  };

  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep < 3) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveStepProgress(nextStep);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveStepProgress(prevStep);
    }
  };

  const handleSkip = () => {
    router.push("/student/dashboard");
  };

  // Final submission to complete onboarding
  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    // Minor determination
    const isMinor = ["CLASS_10", "CLASS_12"].includes(educationStage);

    // Map primaryStream cleanly
    let primaryStream = "UNDECIDED";
    if (educationStage === "CLASS_12") {
      primaryStream = "NON_MEDICAL_PCM"; // sensible default, customizable in dashboard
    } else if (educationStage === "UNDERGRADUATE") {
      primaryStream = "NON_MEDICAL_PCM";
    }

    const payload = {
      educationStage,
      primaryStream,
      selectedStreams: [primaryStream],
      goalClarity,
      primaryNeed,
      guardianConsent: isMinor,
      interests: [
        primaryNeed === "DISCOVER_CAREER" ? "Career Exploration" : "Skill Development",
      ],
      careerGoal: {
        goalType: goalClarity,
        notes: `Focus: ${primaryNeed}`,
      },
      learningPreferences: {
        preferredPace: "BALANCED",
        preferredStyle: "PRACTICAL",
        weeklyHoursAvailable: 10,
        primaryLanguage: "hinglish",
        allowAiMentoring: true,
      },
    };

    try {
      const res = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not save preferences.");
      }

      // Store local preference hint for dashboard mode personalization
      try {
        localStorage.setItem(
          "kaabil_student_onboarding_state",
          JSON.stringify({ educationStage, goalClarity, primaryNeed })
        );
      } catch {
        // ignore
      }

      router.push("/student/dashboard");
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "Failed to complete onboarding. Redirecting to dashboard...");
      setTimeout(() => router.push("/student/dashboard"), 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Progress percentage
  const progressPercent = Math.round((currentStep / 3) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F8FAFC] via-[#FAF8FC] to-[#F1F5F9] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-6">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#FFC66B] via-[#FFA94D] to-[#F59E0B] text-[#1E0F2B] font-black shadow-soft-xs group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-heading text-lg font-black text-slate-900 block leading-tight">
              KAABIL <span className="text-purple-600 font-normal text-xs">| स्मार्ट ऑनबोर्डिंग</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              3 Quick Questions • Personalized For You
            </span>
          </div>
        </Link>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="text-xs font-semibold text-slate-500 hover:text-purple-800 transition-colors px-3 py-1.5 rounded-full hover:bg-white border border-transparent hover:border-slate-200"
        >
          {t.skipButton} &rarr;
        </button>
      </header>

      {/* Main Centered Content */}
      <main className="max-w-2xl w-full mx-auto my-auto py-4">
        {/* Animated Progress Indicator */}
        <div className="mb-8 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 text-purple-700">
              <span className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
              {t.onboardingStep} {currentStep} of 3:{" "}
              <span className="text-slate-900 font-extrabold">
                {currentStep === 1 && "Current Education"}
                {currentStep === 2 && "Career Goal Clarity"}
                {currentStep === 3 && "Your Primary Focus"}
              </span>
            </span>
            <span className="text-purple-700 font-extrabold">{progressPercent}%</span>
          </div>

          {/* Stepper Bar */}
          <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden flex gap-1.5 p-0.5">
            {[1, 2, 3].map((stepIdx) => (
              <div
                key={stepIdx}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                  stepIdx < currentStep
                    ? "bg-emerald-500"
                    : stepIdx === currentStep
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xs"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Question Cards with Animated Presence */}
        <AnimatePresence mode="wait">
          {/* =========================================================================
              QUESTION 1: WHAT ARE YOU CURRENTLY STUDYING?
             ========================================================================= */}
          {currentStep === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 inline-block">
                  Question 01
                </span>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  What are you currently studying?
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Select your current educational stage so we can curate the right pathways for you.
                </p>
              </div>

              {/* 4 Illustrated Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STUDY_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = educationStage === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setEducationStage(item.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 relative group flex flex-col justify-between ${
                        isSelected
                          ? `${item.activeColor} ring-2 shadow-md scale-[1.01]`
                          : "border-slate-200/90 bg-white hover:border-purple-300 hover:bg-slate-50/60 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-3">
                        <div
                          className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold transition-all ${
                            isSelected
                              ? "bg-purple-700 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 group-hover:bg-purple-50 group-hover:text-purple-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-purple-700 text-white"
                              : "border-2 border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-heading text-base font-bold text-slate-900">
                            {item.title}
                          </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-700 block mt-0.5">
                          {item.subtitle}
                        </span>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Minor Shield note */}
              {["CLASS_10", "CLASS_12"].includes(educationStage) && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Student Safe:</strong> As a school learner, you will see zero recruiter commercialization. Your space is 100% focused on self-discovery.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* =========================================================================
              QUESTION 2: IS YOUR CAREER GOAL CLEAR?
             ========================================================================= */}
          {currentStep === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 inline-block">
                  Question 02
                </span>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Is your career goal clear?
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Be honest! There is no wrong answer. This determines how KAABIL guides you.
                </p>
              </div>

              {/* 3 Illustrated Cards */}
              <div className="grid grid-cols-1 gap-3.5">
                {CLARITY_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = goalClarity === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setGoalClarity(item.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 relative group flex items-start gap-4 ${
                        isSelected
                          ? `${item.activeColor} ring-2 shadow-md scale-[1.01]`
                          : "border-slate-200/90 bg-white hover:border-purple-300 hover:bg-slate-50/60 shadow-xs"
                      }`}
                    >
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold shrink-0 transition-all ${
                          isSelected
                            ? "bg-purple-700 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700 group-hover:bg-purple-50 group-hover:text-purple-700"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-heading text-base font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <div
                            className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                              isSelected
                                ? "bg-purple-700 text-white"
                                : "border-2 border-slate-300"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>
                        <span className="text-[11px] font-semibold text-purple-700 block mt-0.5">
                          {item.subtitle}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* =========================================================================
              QUESTION 3: WHAT DO YOU NEED HELP WITH?
             ========================================================================= */}
          {currentStep === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center sm:text-left space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 inline-block">
                  Question 03
                </span>
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  What do you need help with?
                </h1>
                <p className="text-xs sm:text-sm text-slate-600">
                  Pick your primary focus so we can customize your first step.
                </p>
              </div>

              {/* 4 Illustrated Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {NEED_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = primaryNeed === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPrimaryNeed(item.id)}
                      className={`p-5 rounded-3xl border-2 text-left transition-all duration-200 relative group flex flex-col justify-between ${
                        isSelected
                          ? `${item.activeColor} ring-2 shadow-md scale-[1.01]`
                          : "border-slate-200/90 bg-white hover:border-purple-300 hover:bg-slate-50/60 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between w-full mb-3">
                        <div
                          className={`h-11 w-11 rounded-2xl flex items-center justify-center font-bold transition-all ${
                            isSelected
                              ? "bg-purple-700 text-white shadow-xs"
                              : "bg-slate-100 text-slate-700 group-hover:bg-purple-50 group-hover:text-purple-700"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <div
                          className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-purple-700 text-white"
                              : "border-2 border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-heading text-base font-bold text-slate-900">
                          {item.title}
                        </h3>
                        <span className="text-[11px] font-semibold text-purple-700 block mt-0.5">
                          {item.subtitle}
                        </span>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Actions Bar (Back & Continue / Finish) */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="rounded-2xl h-11 px-5 border-slate-200 text-xs font-bold gap-2 text-slate-700 hover:bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="rounded-2xl h-12 px-7 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs sm:text-sm font-bold shadow-md gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Personalizing Experience...</span>
              </>
            ) : currentStep < 3 ? (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Open My Dashboard</span>
                <Sparkles className="h-4 w-4 text-[#FFC66B]" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-2xl w-full mx-auto text-center pt-4 text-slate-400 text-[11px]">
        You can always update these preferences later from your Student Settings or Dashboard.
      </footer>
    </div>
  );
}
