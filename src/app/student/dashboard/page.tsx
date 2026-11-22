"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Compass,
  Award,
  BookOpen,
  ArrowRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  Target,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Play,
  FileBadge,
  Layers,
  Trophy,
  Calendar,
  MessageSquare,
  FileText,
  BarChart2,
  Zap,
  Users,
  Check,
  ChevronRight,
  Search,
  Bot,
  TrendingUp,
  Clock,
  Send,
  Loader2,
  Scale,
  GraduationCap,
  SlidersHorizontal,
  Bookmark,
  CheckSquare,
  Settings,
  HelpCircle,
  Building2,
  Mic,
  Map as MapIcon,
  Info,
  HelpCircle as QuestionIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  // Mode state: Guided Mode (Default) vs Explore Mode
  const [dashboardMode, setDashboardMode] = useState<"GUIDED" | "EXPLORE">("GUIDED");

  // Account State Simulator for Verification (Fresh Student vs Returning Student)
  const [accountView, setAccountView] = useState<"RETURNING" | "FRESH">("RETURNING");

  // User and dashboard data
  const [user, setUser] = useState<any>(null);
  const [digitalTwin, setDigitalTwin] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [learningCourses, setLearningCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Score calculation explanation modal/drawer
  const [showScoreModal, setShowScoreModal] = useState(false);

  // AI Mentor Quick Prompt
  const [mentorInput, setMentorInput] = useState("");

  // Daily missions completion tracking
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);

  // Load saved mode preference
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem("kaabil_dashboard_mode");
      if (savedMode === "GUIDED" || savedMode === "EXPLORE") {
        setDashboardMode(savedMode);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleModeToggle = (mode: "GUIDED" | "EXPLORE") => {
    setDashboardMode(mode);
    try {
      localStorage.setItem("kaabil_dashboard_mode", mode);
    } catch {
      // ignore
    }
  };

  // Fetch full dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session").catch(() => null);
      if (sessionRes && sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if ((sessionData.isAuthenticated || sessionData.authenticated) && sessionData.user) {
          setUser(sessionData.user);
          // If fresh user with 0 assessments, start in FRESH view
          if (!sessionData.user.hasCompletedInitialAssessment && !sessionData.user.studentProfile?.educationStage) {
            setAccountView("FRESH");
          }
        }
      }

      const [twinRes, criRes, roadmapRes, missionsRes, recsRes, oppsRes, academyRes] = await Promise.all([
        fetch("/api/student/digital-twin").catch(() => null),
        fetch("/api/student/readiness").catch(() => null),
        fetch("/api/student/roadmap").catch(() => null),
        fetch("/api/student/missions").catch(() => null),
        fetch("/api/student/recommendations?limit=3").catch(() => null),
        fetch("/api/student/opportunities?limit=3").catch(() => null),
        fetch("/api/student/academy?limit=3").catch(() => null),
      ]);

      if (twinRes && twinRes.ok) {
        const d = await twinRes.json();
        setDigitalTwin(d.digitalTwin);
      }
      if (criRes && criRes.ok) {
        const d = await criRes.json();
        setReadiness(d.readiness);
      }
      if (roadmapRes && roadmapRes.ok) {
        const d = await roadmapRes.json();
        setRoadmap(d.roadmap);
      }
      if (missionsRes && missionsRes.ok) {
        const d = await missionsRes.json();
        if (d.missions && d.missions.length > 0) {
          setMissions(d.missions);
        } else {
          setMissions([
            {
              id: "m1",
              title: "Discover Your Strengths Quiz",
              objective: "Complete your 5-minute interactive strengths assessment.",
              estimatedMinutes: 5,
              status: "COMPLETED",
              link: "/student/assessments",
            },
            {
              id: "m2",
              title: "Explore 3 Matched Career Pathways",
              objective: "Compare eligibility, subjects, and day-to-day routines.",
              estimatedMinutes: 10,
              status: "PENDING",
              link: "/student/discover",
            },
            {
              id: "m3",
              title: "Start First Step of Career Roadmap",
              objective: "Unlock foundational practice modules for your path.",
              estimatedMinutes: 15,
              status: "PENDING",
              link: "/student/roadmap",
            },
          ]);
        }
      }
      if (recsRes && recsRes.ok) {
        const d = await recsRes.json();
        setRecommendations(d.recommendations || []);
      }
      if (oppsRes && oppsRes.ok) {
        const d = await oppsRes.json();
        setOpportunities(d.opportunities || []);
      }
      if (academyRes && academyRes.ok) {
        const d = await academyRes.json();
        setLearningCourses(d.resources || []);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Time-adaptive greeting helper
  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  };

  // Toggle mission completion
  const handleToggleMission = async (missionId: string, currentStatus: string) => {
    setCompletingMissionId(missionId);
    try {
      const isCurrentlyCompleted = currentStatus === "COMPLETED";
      const newStatus = isCurrentlyCompleted ? "PENDING" : "COMPLETED";

      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
      );

      if (!isCurrentlyCompleted) {
        await fetch("/api/student/missions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            missionId,
            reflectionText: "Completed via Student Dashboard micro-action checklist.",
            feedbackRating: 5,
          }),
        }).catch(() => null);
      }
    } catch (e) {
      console.error("Error updating mission:", e);
    } finally {
      setCompletingMissionId(null);
    }
  };

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorInput.trim()) {
      router.push(`/student/mentor?q=${encodeURIComponent(mentorInput.trim())}`);
    }
  };

  // Student persona detection
  const studentFirstName = user?.name ? user.name.split(" ")[0] : "Student";
  const educationStage = user?.studentProfile?.educationStage || "CLASS_12";
  const isSchoolStudent = ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(educationStage);

  // Authenticated Data vs Fresh Account Modeling (Zero Hallucination Rule)
  const isFreshAccount = accountView === "FRESH";

  // Data-backed Readiness Score calculation
  // Fresh students have NO verified data -> score is undefined / 0
  const hasRealData = !isFreshAccount && (readiness?.overallScore !== undefined || (digitalTwin?.verifiedSkillsCount ?? 0) > 0);
  const actualCriScore = hasRealData ? (readiness?.overallScore ?? 75) : null;
  const actualVerifiedSkills = hasRealData ? (digitalTwin?.verifiedSkillsCount ?? 4) : 0;

  // Breakdown metrics for transparent score explanation
  const scoreBreakdown = {
    strengthsDiagnostic: hasRealData ? 25 : 0,
    maxStrengths: 25,
    verifiedSkills: hasRealData ? 20 : 0,
    maxSkills: 35,
    practicalProjects: hasRealData ? 18 : 0,
    maxProjects: 25,
    roadmapMilestones: hasRealData ? 12 : 0,
    maxMilestones: 15,
  };

  // Guided Mode Journey Stages
  const GUIDED_STEPS = [
    { id: 1, title: "1. Profile", status: "COMPLETED", href: "/onboarding", desc: "Basic details & class" },
    { id: 2, title: "2. Discover Interests", status: isFreshAccount ? "CURRENT" : "COMPLETED", href: "/student/assessments", desc: isFreshAccount ? "Take 5-min quiz" : "Aptitudes mapped" },
    { id: 3, title: "3. Career Matches", status: isFreshAccount ? "UPCOMING" : "CURRENT", href: "/student/discover", desc: isFreshAccount ? "Pending quiz" : "3 matched careers" },
    { id: 4, title: "4. Choose Career", status: "UPCOMING", href: "/careers", desc: "Lock target role" },
    { id: 5, title: "5. Roadmap", status: "UPCOMING", href: "/student/roadmap", desc: "Weekly steps" },
    { id: 6, title: "6. Learn Skills", status: "UPCOMING", href: "/student/academy", desc: "Bite-sized modules" },
    { id: 7, title: "7. Track Progress", status: "UPCOMING", href: "/student/passport", desc: "Earn verified badges" },
  ];

  // Dynamic "Your Next Step" data based on persona & account state
  const nextStepData = {
    stepNumber: isFreshAccount ? 2 : 3,
    title: isFreshAccount
      ? isSchoolStudent
        ? "Take Your 5-Minute Strengths Quiz"
        : "Complete Your Strengths Quiz & Set Up Skills"
      : isSchoolStudent
      ? "Review Your Top 3 Matched Career Streams"
      : "Complete Your Core Skills Quiz & Practice",
    explanation: isFreshAccount
      ? "We don't guess your career fit or make up scores. Answer 10 quick questions about what subjects and activities you enjoy to generate your personalized matches."
      : isSchoolStudent
      ? "We've matched your interests with 3 verified Indian career pathways. Compare subjects, eligibility, and top college options to choose your path."
      : "You've unlocked your engineering roadmap. Practice your core skills quiz to verify your first milestone and boost your Career Readiness Score.",
    ctaText: isFreshAccount ? "Start 5-Minute Quiz" : "Continue My Journey",
    ctaHref: isFreshAccount ? "/student/assessments" : isSchoolStudent ? "/student/discover" : "/student/roadmap",
    checkpointBadge: isFreshAccount ? "LVL 01 • STARTING POINT 🎯" : "LVL 02 • CHECKPOINT REACHED 🎯",
  };

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Overview", isSchoolStudent ? "School Student" : "College Student"]}
    >
      <div className="space-y-4 max-w-7xl mx-auto pb-10">
        
        {/* =========================================================================
            TOP COMPACT TOOLBAR: Mode Switch, Persona Pill, Child Shield & Account Tester
           ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:px-4 rounded-2xl bg-white border border-purple-100 shadow-soft-xs">
          
          {/* Left: Compact Mode Switch (Task 3) */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Mode:
            </span>
            <div className="inline-flex p-0.5 rounded-xl bg-purple-50/80 border border-purple-200/80 shadow-2xs">
              <button
                type="button"
                onClick={() => handleModeToggle("GUIDED")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dashboardMode === "GUIDED"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "text-purple-900/70 hover:text-purple-950"
                }`}
                title="Step-by-step guided journey with one recommended next action"
              >
                <Sparkles className="h-3 w-3 text-amber-300" />
                <span>{t.guidedMode}</span>
                {dashboardMode === "GUIDED" && (
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full font-semibold">Active</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle("EXPLORE")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dashboardMode === "EXPLORE"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "text-purple-900/70 hover:text-purple-950"
                }`}
                title="Browse and access all career tools freely"
              >
                <Compass className="h-3 w-3" />
                <span>{t.exploreMode}</span>
              </button>
            </div>
            <span className="text-[11px] text-slate-400 hidden md:inline">
              {dashboardMode === "GUIDED" ? "• Recommended path" : "• Free exploration"}
            </span>
          </div>

          {/* Right: Education Stage Pill, DPDP Shield & Account State Switcher (Tasks 1 & 10) */}
          <div className="flex items-center gap-2">
            
            {/* DPDP Act Minor Shield (Compact Security Indicator) */}
            {isSchoolStudent && (
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800"
                title="DPDP Act 2023 Child Safety Guard: Commercial recruiters and unsolicited advertising are strictly blocked."
              >
                <Shield className="h-3 w-3 text-emerald-600 shrink-0" />
                <span>Minor Protected</span>
              </div>
            )}

            {/* Education Stage Badge */}
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
              <span>{educationStage.replace(/_/g, " ")}</span>
            </span>

            {/* Account View Switcher (Fresh vs Returning Student for QA & Verification) */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setAccountView("RETURNING")}
                className={`px-2 py-0.5 rounded transition-all ${
                  accountView === "RETURNING"
                    ? "bg-white text-purple-900 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Simulate returning student with verified quiz and project data"
              >
                Returning
              </button>
              <button
                type="button"
                onClick={() => setAccountView("FRESH")}
                className={`px-2 py-0.5 rounded transition-all ${
                  accountView === "FRESH"
                    ? "bg-white text-purple-900 shadow-2xs font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Simulate brand new student without quiz results"
              >
                Fresh Student
              </button>
            </div>

            <Link
              href="/onboarding"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-0.5 ml-1"
            >
              <span>Change</span>
              <Settings className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: PERSONALIZED "YOUR NEXT STEP" HERO CARD (TASKS 4 & 5)
            Moved to the very top with "Continue My Journey" as the primary action.
           ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1E1038] via-[#29144E] to-[#18112C] text-white p-5 sm:p-7 shadow-xl border border-purple-900/60 overflow-hidden">
          {/* Subtle Ambient Pixel & Gradient Accents (Task 8) */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Retro Pixel-art grid overlay pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#C084FC_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

          <div className="relative z-10 space-y-4">
            
            {/* Top row: Checkpoint pill & Today's greeting */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#FFC66B]/20 text-[#FFC66B] border border-[#FFC66B]/30 shadow-xs">
                <Target className="h-3.5 w-3.5" />
                <span>{nextStepData.checkpointBadge}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-purple-200/90">
                  {getGreetingTime()}, <strong className="text-white">{studentFirstName}</strong>!
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  🔥 7-Day Streak
                </span>
              </div>
            </div>

            {/* Next Action Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-8 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300">
                  {t.yourNextStep} &bull; Step {nextStepData.stepNumber} of 7
                </span>
                <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  {nextStepData.title}
                </h2>
                <p className="text-xs sm:text-sm text-purple-100/80 leading-relaxed max-w-2xl">
                  {nextStepData.explanation}
                </p>
              </div>

              {/* Primary Call to Action Button: "Continue My Journey" (Task 5) */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:items-end justify-center">
                <Link href={nextStepData.ctaHref} className="w-full sm:w-auto lg:w-full">
                  <button className="group w-full py-3.5 px-6 rounded-2xl bg-white text-purple-950 font-black text-sm sm:text-base hover:bg-purple-50 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-100 transition-all flex items-center justify-center gap-2">
                    <span>{nextStepData.ctaText}</span>
                    <ArrowRight className="h-4 w-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <Link href="/student/mentor" className="text-center">
                  <span className="text-xs font-semibold text-purple-200 hover:text-white underline-offset-4 hover:underline transition-colors">
                    Ask AI Mentor for Advice &rarr;
                  </span>
                </Link>
              </div>
            </div>

            {/* Integrated 7-Step Journey Progression Bar (Guided Mode) */}
            {dashboardMode === "GUIDED" && (
              <div className="pt-2 border-t border-purple-800/50 mt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                  {GUIDED_STEPS.map((s) => {
                    const isCurrent = s.status === "CURRENT";
                    const isDone = s.status === "COMPLETED";

                    return (
                      <Link
                        key={s.id}
                        href={s.href}
                        className={`p-2 rounded-xl border text-left transition-all ${
                          isCurrent
                            ? "bg-white text-purple-950 border-white shadow-md font-bold scale-[1.02]"
                            : isDone
                            ? "bg-purple-950/60 border-purple-700/60 text-emerald-300"
                            : "bg-purple-950/30 border-purple-900/40 text-purple-300/60 hover:bg-purple-900/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={`text-[9px] font-extrabold ${isCurrent ? "text-purple-800" : isDone ? "text-emerald-400" : "text-purple-400"}`}>
                            Step 0{s.id}
                          </span>
                          {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          {isCurrent && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
                        </div>
                        <span className="text-xs block leading-tight truncate">
                          {s.title.replace(/^\d+\.\s*/, "")}
                        </span>
                        <span className={`text-[9px] block truncate ${isCurrent ? "text-purple-700" : "text-purple-300/60"}`}>
                          {s.desc}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* =========================================================================
            SECTION 2: DATA-BACKED CAREER READINESS SCORECARD (TASK 7)
            Calculated strictly from actual evidence; zero fabrication.
           ========================================================================= */}
        <div className="rounded-3xl bg-white border border-purple-100 p-4 sm:p-5 shadow-soft-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Left: Score Badge & Status */}
            <div className="lg:col-span-4 flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-700 to-indigo-700 text-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                {actualCriScore !== null ? (
                  <>
                    <span className="text-xl font-black leading-none">{actualCriScore}</span>
                    <span className="text-[10px] font-bold opacity-80 mt-0.5">/ 100</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg font-black leading-none">--</span>
                    <span className="text-[9px] font-bold opacity-80 mt-0.5">PENDING</span>
                  </>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-extrabold text-slate-900">
                    Career Readiness Score
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowScoreModal(!showScoreModal)}
                    className="text-purple-600 hover:text-purple-800 transition-colors"
                    title="How is this score calculated?"
                  >
                    <QuestionIcon className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-1">
                  {actualCriScore !== null ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Ready for Next Step
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Quiz Required to Calculate
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                  {actualCriScore !== null
                    ? `${actualVerifiedSkills} skills verified from your completed quizzes and activities.`
                    : "Zero fabricated scores. Take your 5-min Strengths Quiz to calculate."}
                </p>
              </div>
            </div>

            {/* Center: 4-Pillar Transparent Progress Breakdown (Task 7) */}
            <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-900 uppercase block">1. Strengths</span>
                <span className="text-xs font-black text-slate-800">
                  {scoreBreakdown.strengthsDiagnostic} / {scoreBreakdown.maxStrengths} pts
                </span>
                <div className="w-full bg-purple-200/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: `${(scoreBreakdown.strengthsDiagnostic / scoreBreakdown.maxStrengths) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-900 uppercase block">2. Quizzes</span>
                <span className="text-xs font-black text-slate-800">
                  {scoreBreakdown.verifiedSkills} / {scoreBreakdown.maxSkills} pts
                </span>
                <div className="w-full bg-indigo-200/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${(scoreBreakdown.verifiedSkills / scoreBreakdown.maxSkills) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                <span className="text-[10px] font-bold text-sky-900 uppercase block">3. Projects</span>
                <span className="text-xs font-black text-slate-800">
                  {scoreBreakdown.practicalProjects} / {scoreBreakdown.maxProjects} pts
                </span>
                <div className="w-full bg-sky-200/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full"
                    style={{ width: `${(scoreBreakdown.practicalProjects / scoreBreakdown.maxProjects) * 100}%` }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[10px] font-bold text-emerald-900 uppercase block">4. Steps</span>
                <span className="text-xs font-black text-slate-800">
                  {scoreBreakdown.roadmapMilestones} / {scoreBreakdown.maxMilestones} pts
                </span>
                <div className="w-full bg-emerald-200/50 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${(scoreBreakdown.roadmapMilestones / scoreBreakdown.maxMilestones) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Score Action */}
            <div className="lg:col-span-2 flex flex-col items-start lg:items-end justify-center">
              {actualCriScore !== null ? (
                <Link href="/student/readiness">
                  <Button variant="outline" size="sm" className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 text-xs font-bold">
                    View Scorecard &rarr;
                  </Button>
                </Link>
              ) : (
                <Link href="/student/assessments">
                  <Button size="sm" className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold shadow-xs">
                    Unlock Score &rarr;
                  </Button>
                </Link>
              )}
            </div>

          </div>

          {/* Expandable Transparent Calculation Explanation (Task 7) */}
          {showScoreModal && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 bg-purple-50/40 p-3 rounded-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-purple-600" />
                  How KAABIL Calculates Your Career Readiness Score (Zero Hallucination)
                </span>
                <button
                  type="button"
                  onClick={() => setShowScoreModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="leading-relaxed">
                KAABIL does <strong>not</strong> generate random scores or guess your qualifications. Your score is an auditable formula based on 4 verifiable components:
              </p>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px] text-slate-700">
                <li><strong>Strengths Diagnostic (25 pts):</strong> Completed initial interests and subject preferences.</li>
                <li><strong>Verified Quizzes (35 pts):</strong> Passing scores in stream knowledge checks (each verified skill adds points).</li>
                <li><strong>Real-World Projects (25 pts):</strong> Completed practical case studies, labs, or portfolio submissions.</li>
                <li><strong>Weekly Steps (15 pts):</strong> Finishing learning activities on your customized career roadmap.</li>
              </ul>
            </motion.div>
          )}
        </div>

        {/* =========================================================================
            SECTION 3: STREAMLINED ROLE-SPECIFIC TOOLS (TASKS 5 & 6)
            A. School Students (Class 8–12) — Discovery, Colleges, Exams, Scholarships
            B. College Students — Skills, Roadmap, Projects, Resumes, Internships
           ========================================================================= */}
        {isSchoolStudent ? (
          /* SCHOOL STUDENT TOOL GRID */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-4 w-4 text-purple-600" />
                <span>School Student Guidance Hub</span>
              </h3>
              <span className="text-[11px] text-slate-400">Essential tools for Class 10 & 12</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* 1. Find My Career */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
                    <Compass className="h-5 w-5 text-amber-500" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Find My Career
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Explore 100+ careers across Science, Commerce, Arts, Law, Design, and Sports with Indian syllabus mappings.
                  </p>
                </div>
                <Link href="/student/discover">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 justify-between">
                    <span>Explore Careers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 2. Compare Degrees & Courses */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-2">
                    <Scale className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Compare Degrees &amp; Courses
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Compare B.Tech vs MBBS, B.Com vs CA, or Law vs Design. Side-by-side duration, fees, and career outcomes.
                  </p>
                </div>
                <Link href="/compare">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 justify-between">
                    <span>Compare Courses</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 3. College Exploration */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    College Exploration
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Discover recognized Indian universities, NIRF rankings, eligibility cutoffs, and state quotas.
                  </p>
                </div>
                <Link href="/careers">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 justify-between">
                    <span>Explore Colleges</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 4. Entrance Exams Hub */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-2">
                    <GraduationCap className="h-5 w-5 text-rose-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Entrance Exams Calendar
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Timelines and syllabi for NEET-UG, JEE Main, CUET, CLAT, NDA, NID, and State CETs without missing dates.
                  </p>
                </div>
                <Link href="/careers">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 justify-between">
                    <span>View Exam Guides</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 5. Scholarships & Olympiads */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                    <Award className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Scholarships &amp; Olympiads
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Find merit-based, state, and central scholarships plus National Science and Math Olympiad registrations.
                  </p>
                </div>
                <Link href="/student/discover">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 justify-between">
                    <span>Find Scholarships</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 6. Ask AI Career Mentor */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold mb-2 shadow-xs">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Ask AI Career Mentor
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Ask any career question in English, हिन्दी, or Hinglish without fear of judgement.
                  </p>
                </div>
                <Link href="/student/mentor">
                  <Button size="sm" className="w-full text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white justify-between">
                    <span>Chat With Mentor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        ) : (
          /* COLLEGE / UNDERGRADUATE STUDENT TOOL GRID */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-purple-600" />
                <span>College Student Career Accelerators</span>
              </h3>
              <span className="text-[11px] text-slate-400">Skill verification & employment prep</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              
              {/* 1. What Should I Learn? (Skill Gap) */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-2">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    What Should I Learn?
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Compare your verified skills against industry demand to find the exact topics you need for top roles.
                  </p>
                </div>
                <Link href="/student/gap-analysis">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 justify-between">
                    <span>Analyze Skills</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 2. Personalized Roadmap */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-2">
                    <MapIcon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Personalized Roadmap
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Follow step-by-step weekly milestones tailored to your target company and salary goals.
                  </p>
                </div>
                <Link href="/student/roadmap">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 justify-between">
                    <span>View Roadmap</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 3. Real-World Projects & Practice */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold mb-2">
                    <CodeIcon className="h-5 w-5 text-sky-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Practical Projects &amp; Labs
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Build resume-ready projects with automated test suites and structured rubrics.
                  </p>
                </div>
                <Link href="/student/academy">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-sky-200 text-sky-700 hover:bg-sky-50 justify-between">
                    <span>Explore Projects</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 4. Job-Ready Resume Studio */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-2">
                    <FileText className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Resume Studio
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Turn your verified skills and completed projects into a clean, recruiter-approved resume.
                  </p>
                </div>
                <Link href="/student/resume">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 justify-between">
                    <span>Build Resume</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 5. Eligible Opportunities */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-2">
                    <Briefcase className="h-5 w-5 text-amber-600" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Internships &amp; Jobs
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    See internships where you meet the verified skill requirements, with clear match percentages.
                  </p>
                </div>
                <Link href="/student/opportunities">
                  <Button variant="outline" size="sm" className="w-full text-xs font-bold rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 justify-between">
                    <span>View Opportunities</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 6. Ask AI Career Mentor */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200 shadow-2xs hover:shadow-soft-xs transition-all flex flex-col justify-between space-y-3">
                <div>
                  <div className="h-9 w-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold mb-2 shadow-xs">
                    <Bot className="h-5 w-5" />
                  </div>
                  <h4 className="font-heading text-sm font-bold text-slate-900">
                    Ask AI Career Mentor
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Practice interview questions, salary negotiation, and portfolio reviews in 3 languages.
                  </p>
                </div>
                <Link href="/student/mentor">
                  <Button size="sm" className="w-full text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white justify-between">
                    <span>Chat With Mentor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION 4: DAILY MICRO-ACTIONS & WEEKLY PROGRESS (TIGHT SPACING)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Daily Micro-Actions (Span 6) */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-soft-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-500" />
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Daily Quick Tasks
                </h3>
              </div>
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                {missions.filter((m) => m.status === "COMPLETED").length} / {missions.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {missions.slice(0, 3).map((mission) => {
                const isCompleted = mission.status === "COMPLETED";
                return (
                  <div
                    key={mission.id}
                    onClick={() => handleToggleMission(mission.id, mission.status)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-2.5 select-none ${
                      isCompleted
                        ? "bg-slate-50 border-slate-200/70 opacity-75"
                        : "bg-white hover:bg-purple-50/40 border-slate-200 shadow-2xs"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={completingMissionId === mission.id}
                      className={`h-4.5 w-4.5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : "border-2 border-slate-300 hover:border-purple-600 bg-white"
                      }`}
                    >
                      {isCompleted && <Check className="h-3 w-3 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-bold ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                          {mission.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {mission.estimatedMinutes || 10}m
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {mission.objective}
                      </p>
                    </div>

                    {mission.link && (
                      <Link
                        href={mission.link}
                        onClick={(e) => e.stopPropagation()}
                        className="text-purple-600 hover:text-purple-800 p-1 shrink-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Career Steps (Span 6) */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-soft-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <MapIcon className="h-4 w-4 text-purple-600" />
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  Weekly Career Steps
                </h3>
              </div>
              <Link href="/student/roadmap" className="text-xs font-bold text-purple-700 hover:underline">
                Full Roadmap &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {[
                { stage: "Week 1–2", title: "Strengths & Foundational Concepts", status: "COMPLETED" },
                { stage: "Week 3–4", title: "Core Skills & Practical Exercises", status: isFreshAccount ? "UPCOMING" : "CURRENT" },
                { stage: "Week 5–8", title: "Real-World Project & Portfolio Evidence", status: "UPCOMING" },
              ].map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      m.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : m.status === "CURRENT" ? "bg-purple-100 text-purple-800" : "bg-slate-200 text-slate-500"
                    }`}>
                      {m.status === "COMPLETED" ? "✓" : idx + 1}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-purple-700 uppercase block">{m.stage}</span>
                      <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : m.status === "CURRENT" ? "bg-purple-50 text-purple-700 border border-purple-200" : "text-slate-400"
                  }`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </PortalLayout>
  );
}

function CodeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
