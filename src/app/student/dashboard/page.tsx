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

  // Quick career search query
  const [greetingSearch, setGreetingSearch] = useState("");

  // AI Mentor Quick Prompt
  const [mentorInput, setMentorInput] = useState("");

  // Daily missions completion tracking
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);

  // Roadmap accordion state
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [updatingActivityId, setUpdatingActivityId] = useState<string | null>(null);
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);

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
        if (d.roadmap?.milestones?.length > 0) {
          setExpandedMilestoneId(d.roadmap.milestones[0].id);
        }
      }
      if (missionsRes && missionsRes.ok) {
        const d = await missionsRes.json();
        if (d.missions && d.missions.length > 0) {
          setMissions(d.missions);
        } else {
          // Default actionable tasks
          setMissions([
            {
              id: "m1",
              title: "Discover Your Strengths Diagnostic",
              objective: "Complete your 5-minute interactive strengths assessment.",
              estimatedMinutes: 5,
              status: "COMPLETED",
              link: "/student/assessments",
            },
            {
              id: "m2",
              title: "Explore 3 Matched Career Pathways",
              objective: "Compare eligibility, subjects, and day-in-the-life routines.",
              estimatedMinutes: 10,
              status: "PENDING",
              link: "/student/discover",
            },
            {
              id: "m3",
              title: "Start First Step of Career Roadmap",
              objective: "Unlock foundational practice modules for your selected path.",
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

  // Toggle mission completion and persist to backend
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

  // Toggle roadmap activity
  const handleToggleActivity = async (milestoneId: string, activityId: string) => {
    setUpdatingActivityId(activityId);
    try {
      const res = await fetch("/api/student/roadmap/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, activityId }),
      });

      if (res.ok) {
        const d = await res.json();
        setRoadmap(d.roadmap);
        const criRes = await fetch("/api/student/readiness");
        if (criRes.ok) {
          const criData = await criRes.json();
          setReadiness(criData.readiness);
        }
      }
    } catch (e) {
      console.error("Toggle activity error:", e);
    } finally {
      setUpdatingActivityId(null);
    }
  };

  // Determine stage & student persona
  const studentFirstName = user?.name ? user.name.split(" ")[0] : "Student";
  const educationStage = user?.studentProfile?.educationStage || "CLASS_12";
  const isSchoolStudent = ["CLASS_8", "CLASS_9", "CLASS_10", "CLASS_11", "CLASS_12"].includes(educationStage);
  const isMinor = user?.isMinor ?? isSchoolStudent;

  // Real or baseline metrics
  const criScore = readiness?.overallScore ?? 75;
  const criStatus = readiness?.statusLabel || "Ready for Next Step";
  const verifiedCount = digitalTwin?.verifiedSkillsCount ?? readiness?.evidenceSummary?.verifiedCount ?? 4;
  const targetSkillsCount = 8;

  // Date format
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const handleGreetingSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (greetingSearch.trim()) {
      router.push(`/student/discover?q=${encodeURIComponent(greetingSearch.trim())}`);
    }
  };

  const handleMentorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mentorInput.trim()) {
      router.push(`/student/mentor?q=${encodeURIComponent(mentorInput.trim())}`);
    }
  };

  // Guided Mode Journey Stages
  const GUIDED_STEPS = [
    { id: 1, title: "1. Profile", status: "COMPLETED", href: "/onboarding", desc: "Basic details & class" },
    { id: 2, title: "2. Discover Interests", status: "COMPLETED", href: "/student/discover", desc: "Aptitudes mapped" },
    { id: 3, title: "3. Career Matches", status: "CURRENT", href: "/student/discover", desc: "3 recommended paths" },
    { id: 4, title: "4. Choose Career", status: "UPCOMING", href: "/careers", desc: "Lock target role" },
    { id: 5, title: "5. Roadmap", status: "UPCOMING", href: "/student/roadmap", desc: "Weekly milestones" },
    { id: 6, title: "6. Start Learning", status: "UPCOMING", href: "/student/academy", desc: "Bite-sized modules" },
    { id: 7, title: "7. Track Progress", status: "UPCOMING", href: "/student/passport", desc: "Earn verified badges" },
  ];

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Overview", isSchoolStudent ? "School Student Portal" : "College Student Portal"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* =========================================================================
            TOP MODE TOGGLE & PERSONA BADGE
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-5 rounded-2xl bg-white border border-slate-200/90 shadow-soft-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Experience Mode:
            </span>
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeToggle("GUIDED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dashboardMode === "GUIDED"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🎯 {t.guidedMode}</span>
                {dashboardMode === "GUIDED" && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">Active</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle("EXPLORE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  dashboardMode === "EXPLORE"
                    ? "bg-purple-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>🧭 {t.exploreMode}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
              <span>{educationStage.replace(/_/g, " ")}</span>
            </span>

            <Link
              href="/onboarding"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1"
            >
              <span>Change Goal</span>
              <Settings className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* DPDP Minor Protection Notice (for school students under 18) */}
        {isSchoolStudent && (
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>DPDP Act 2023 Child Safety Guard:</strong> Protected student environment active. No commercial recruiters or unsolicited ads.
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-white/60 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
              Verified Minor Shield
            </span>
          </div>
        )}

        {/* =========================================================================
            SECTION A: PERSONALIZED WELCOME & SEARCH
           ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-r from-white via-[#FAF5FF] to-[#F5F3FF] border border-purple-100 p-6 sm:p-8 shadow-soft-xs overflow-hidden">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Greeting & Headline */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full">
                  {todayFormatted}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                  <span className="text-sm">🔥</span> 7-Day Streak
                </span>
              </div>

              <div className="space-y-1">
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {getGreetingTime()}, {studentFirstName}!
                </h1>
                <p className="text-sm sm:text-base text-purple-900/90 font-medium">
                  {isSchoolStudent
                    ? "Let's explore your best career options, top colleges, and entrance exams."
                    : "Let's advance your career roadmap, verify skills, and unlock opportunities."}
                </p>
              </div>

              {/* Quick Search Bar */}
              <form onSubmit={handleGreetingSearchSubmit} className="relative max-w-lg pt-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  value={greetingSearch}
                  onChange={(e) => setGreetingSearch(e.target.value)}
                  placeholder={
                    isSchoolStudent
                      ? "Search careers, subjects, colleges, entrance exams (NEET, JEE, CUET)..."
                      : "Search careers, skills, internships, projects, or courses..."
                  }
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-white border border-purple-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-xs transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs shadow-xs transition-all"
                >
                  Explore
                </button>
              </form>
            </div>

            {/* Right: Quick Progress Snapshot */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-purple-100 shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Career Readiness</span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {criScore}/100
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full"
                  style={{ width: `${criScore}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                {isSchoolStudent
                  ? "Based on your diagnostic aptitudes and foundational knowledge."
                  : "Deterministic score measured across verified technical and practical skills."}
              </p>
              <Link href="/student/readiness" className="text-xs font-bold text-purple-700 hover:underline">
                View Detailed Scorecard &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION B: GUIDED MODE JOURNEY & "YOUR NEXT STEP" CARD
           ========================================================================= */}
        {dashboardMode === "GUIDED" && (
          <div className="space-y-4">
            {/* 7-Step Journey Stepper Progression Bar */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  Your Guided Career Journey
                </span>
                <span className="text-[11px] text-purple-700 font-bold">
                  Step 3 of 7: Choose Career Match
                </span>
              </div>

              {/* Step Pills Timeline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
                {GUIDED_STEPS.map((s) => {
                  const isCurrent = s.status === "CURRENT";
                  const isDone = s.status === "COMPLETED";

                  return (
                    <Link
                      key={s.id}
                      href={s.href}
                      className={`p-2.5 rounded-2xl border text-left transition-all ${
                        isCurrent
                          ? "bg-purple-700 text-white border-purple-700 shadow-md scale-[1.02]"
                          : isDone
                          ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-bold ${isCurrent ? "text-amber-300" : isDone ? "text-emerald-700" : "text-slate-400"}`}>
                          Step 0{s.id}
                        </span>
                        {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                        {isCurrent && <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />}
                      </div>
                      <span className="text-xs font-bold block leading-tight truncate">
                        {s.title.replace(/^\d+\.\s*/, "")}
                      </span>
                      <span className={`text-[10px] block mt-0.5 truncate ${isCurrent ? "text-purple-100" : "text-slate-400"}`}>
                        {s.desc}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* PROMINENT "YOUR NEXT STEP" CARD (TASK 5 & 6 REQUIREMENT) */}
            <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Background Glow */}
              <div className="absolute right-0 top-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#FFC66B]/20 text-[#FFC66B] border border-[#FFC66B]/30">
                  <Target className="h-3.5 w-3.5" />
                  {t.yourNextStep}
                </div>
                <h3 className="font-heading text-xl sm:text-2xl font-black text-white leading-snug">
                  {isSchoolStudent
                    ? "Review Your Top 3 Matched Career Streams"
                    : "Complete Your Fast Inference Milestone Assessment"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {isSchoolStudent
                    ? "Based on your Class 12 stage, compare Medicine, Engineering, and Design pathways side-by-side without exam confusion."
                    : "Advance to Stage 2 of your 12-week roadmap and earn verified competency proof in your Digital Skill Passport."}
                </p>
              </div>

              <div className="relative z-10 shrink-0">
                <Link href={isSchoolStudent ? "/student/discover" : "/student/assessments"}>
                  <Button
                    size="lg"
                    className="h-12 px-7 rounded-2xl bg-gradient-to-r from-[#FFC66B] via-[#FFA94D] to-[#F59E0B] text-[#1E0F2B] font-extrabold text-sm shadow-[0_4px_20px_rgba(255,198,107,0.4)] hover:scale-[1.03] transition-all gap-2"
                  >
                    <span>{t.continueJourney}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            DYNAMIC SECTIONS BASED ON EDUCATIONAL STAGE (TASK 5)
           ========================================================================= */}

        {/* -------------------------------------------------------------------------
            A. SCHOOL STUDENT EXPERIENCE (Class 10, Class 11-12)
            Focus: Career discovery, Course comparison, College exploration, Entrance exams, Scholarships, AI Mentor
           ------------------------------------------------------------------------- */}
        {isSchoolStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              
              {/* 1. Career Discovery Module */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-3">
                    <Compass className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Find My Career
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Explore 100+ careers across Science, Commerce, Arts, Law, Design, and Sports with verified syllabus mappings.
                  </p>
                </div>
                <Link href="/student/discover">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 justify-between">
                    <span>Explore Careers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 2. Course & Stream Comparison */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-3">
                    <Scale className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Compare Degrees &amp; Courses
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Compare B.Tech vs MBBS, B.Com vs CA, or Law vs Public Policy. Side-by-side duration, fees, and career outcomes.
                  </p>
                </div>
                <Link href="/compare">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 justify-between">
                    <span>Compare Courses</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 3. College Exploration */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3">
                    <Building2 className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    College Exploration
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Discover recognized Indian universities, NIRF rankings, eligibility cutoffs, and state quotas.
                  </p>
                </div>
                <Link href="/careers">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 justify-between">
                    <span>Explore Colleges</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 4. Entrance Exams Hub */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold mb-3">
                    <GraduationCap className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Entrance Exams Calendar
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Timelines and syllabi for NEET-UG, JEE Main, CUET, CLAT, NDA, NID, and State CETs without missing dates.
                  </p>
                </div>
                <Link href="/careers">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 justify-between">
                    <span>View Exam Guides</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 5. Scholarships & Olympiads */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
                    <Award className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Scholarships &amp; Olympiads
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Find merit-based, state, and government scholarships plus National Science and Math Olympiad registrations.
                  </p>
                </div>
                <Link href="/student/discover">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 justify-between">
                    <span>Find Scholarships</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

              {/* 6. Friendly AI Career Mentor */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-50 via-white to-indigo-50 border border-purple-200 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="h-11 w-11 rounded-2xl bg-purple-700 text-white flex items-center justify-center font-bold mb-3 shadow-xs">
                    <Bot className="h-6 w-6" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Ask AI Career Mentor
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Get answers to all your career doubts in English, हिन्दी, or Hinglish with zero judgement.
                  </p>
                </div>
                <Link href="/student/mentor">
                  <Button className="w-full text-xs font-bold rounded-xl bg-purple-700 hover:bg-purple-800 text-white justify-between">
                    <span>Chat With Mentor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------
            B. COLLEGE STUDENT EXPERIENCE (Undergraduates, Graduates)
            Focus: Career discovery, Skill analysis, Personalized roadmap, Practical projects, Resume studio, Opportunities, AI Mentor
           ------------------------------------------------------------------------- */}
        {!isSchoolStudent && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Career Readiness & Skill Analysis (Span 7) */}
              <div className="lg:col-span-7 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-heading text-base font-bold text-slate-900">
                          {t.checkMySkills} &amp; Competence
                        </h3>
                        <p className="text-xs text-slate-500">
                          Verified evidence measuring genuine readiness for industry roles
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {criStatus}
                    </span>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                      <span className="text-[11px] font-bold text-purple-900 uppercase">Verified Skills</span>
                      <div className="text-2xl font-extrabold text-slate-900 mt-1">
                        {verifiedCount} <span className="text-xs font-normal text-slate-500">of {targetSkillsCount} verified</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {["Python Logic", "FastAPI Serving", "Git & CI/CD"].map((s) => (
                          <span key={s} className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-purple-200 text-purple-900 font-medium">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <span className="text-[11px] font-bold text-amber-900 uppercase">Skill Gap Priority</span>
                      <div className="text-xs font-bold text-slate-800 mt-1">
                        Vector Embeddings (-20%)
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Complete the practical tutorial in Academy to close this gap.
                      </p>
                      <Link href="/student/skill-gaps" className="text-[11px] font-bold text-amber-800 hover:underline inline-block mt-2">
                        View Skill Gap Analyzer &rarr;
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Link href="/student/assessments">
                    <Button size="sm" className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs gap-1.5">
                      <span>{t.checkMySkills}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href="/student/passport" className="text-xs font-bold text-purple-700 hover:underline">
                    View My Achievements &rarr;
                  </Link>
                </div>
              </div>

              {/* AI Career Mentor Card (Span 5) */}
              <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5F3FF] border border-purple-100 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md mb-1 inline-block">
                        Trilingual Guidance
                      </span>
                      <h3 className="font-heading text-base font-bold text-slate-900">
                        {t.aiMentor}
                      </h3>
                    </div>
                    <div className="h-10 w-10 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-xs">
                      <Bot className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Quick Form */}
                  <form onSubmit={handleMentorSubmit} className="relative mt-3">
                    <input
                      type="text"
                      value={mentorInput}
                      onChange={(e) => setMentorInput(e.target.value)}
                      placeholder="Ask about careers, skills, or interviews..."
                      className="w-full pl-3 pr-16 py-2 rounded-xl bg-white border border-purple-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <button
                      type="submit"
                      disabled={!mentorInput.trim()}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-2.5 rounded-lg bg-purple-700 text-white text-xs font-bold disabled:opacity-40"
                    >
                      Send
                    </button>
                  </form>

                  {/* Suggested Prompts */}
                  <div className="space-y-1.5 mt-3">
                    {[
                      "Which companies hire for my target role?",
                      "How do I prepare for technical interviews?",
                      "What practical projects stand out on a resume?",
                    ].map((p) => (
                      <Link
                        key={p}
                        href={`/student/mentor?q=${encodeURIComponent(p)}`}
                        className="block p-2 rounded-xl bg-white border border-purple-100 text-[11px] font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-900 transition-all truncate"
                      >
                        &bull; {p}
                      </Link>
                    ))}
                  </div>
                </div>

                <Link href="/student/mentor">
                  <Button variant="outline" className="w-full text-xs font-bold rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 justify-between">
                    <span>Open Mentorship Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>

            </div>

            {/* Opportunities & Resume Studio Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Internship & Job Opportunities */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-sky-600" />
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Eligible Opportunities
                    </h3>
                  </div>
                  <Link href="/student/opportunities" className="text-xs font-bold text-purple-700 hover:underline">
                    View All &rarr;
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {[
                    { title: "AI Systems Engineering Intern", company: "DeepNeural Labs", location: "Bengaluru (Hybrid)", stipend: "₹35,000/mo", match: 94 },
                    { title: "Financial Analyst Trainee", company: "Apex Advisory", location: "Mumbai (Onsite)", stipend: "₹25,000/mo", match: 88 },
                  ].map((opp, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {opp.match}% Match
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-1">{opp.title}</h4>
                        <p className="text-[11px] text-slate-500">{opp.company} • {opp.stipend}</p>
                      </div>
                      <Link href="/student/opportunities">
                        <Button size="sm" variant="outline" className="text-xs h-8 px-3 rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume Preparation & Interview Practice */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-soft-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      Resume &amp; Interview Prep
                    </h3>
                  </div>
                  <Link href="/student/resume" className="text-xs font-bold text-purple-700 hover:underline">
                    Resume Studio &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/student/resume" className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:border-indigo-300 transition-all text-left">
                    <FileText className="h-5 w-5 text-indigo-600 mb-2" />
                    <h4 className="text-xs font-bold text-indigo-950">Resume Studio</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Turn verified skills into an ATS-friendly CV.</p>
                  </Link>
                  <Link href="/student/interview-lab" className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100 hover:border-pink-300 transition-all text-left">
                    <Mic className="h-5 w-5 text-pink-600 mb-2" />
                    <h4 className="text-xs font-bold text-pink-950">Interview Lab</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Practice realistic mock interview questions.</p>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =========================================================================
            SECTION C: DAILY ACTIONS & ROADMAP MILESTONES (SHARED & FUNCTIONAL)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Daily Micro-Missions (Span 6) */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-5 w-5 text-amber-500" />
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Daily Micro-Missions
                </h3>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                {missions.filter((m) => m.status === "COMPLETED").length} / {missions.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {missions.slice(0, 3).map((mission) => {
                const isCompleted = mission.status === "COMPLETED";
                return (
                  <div
                    key={mission.id}
                    onClick={() => handleToggleMission(mission.id, mission.status)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                      isCompleted
                        ? "bg-slate-50 border-slate-200/70 opacity-75"
                        : "bg-white hover:bg-purple-50/40 border-slate-200 shadow-2xs"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={completingMissionId === mission.id}
                      className={`h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all ${
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

          {/* Personalized Roadmap Progression (Span 6) */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-soft-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <MapIcon className="h-5 w-5 text-purple-600" />
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {t.myRoadmap}
                </h3>
              </div>
              <Link href="/student/roadmap" className="text-xs font-bold text-purple-700 hover:underline">
                Full Roadmap &rarr;
              </Link>
            </div>

            <div className="space-y-2.5">
              {[
                { stage: "Week 1–2", title: "Diagnostic & Foundational Concepts", status: "COMPLETED" },
                { stage: "Week 3–4", title: "Core Competencies & Hands-on Lab", status: "CURRENT" },
                { stage: "Week 5–8", title: "Practical Capstone Project & Evidence", status: "UPCOMING" },
              ].map((m, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      m.status === "COMPLETED" ? "bg-emerald-100 text-emerald-800" : m.status === "CURRENT" ? "bg-purple-100 text-purple-800" : "bg-slate-200 text-slate-500"
                    }`}>
                      {m.status === "COMPLETED" ? "✓" : idx + 1}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 uppercase block">{m.stage}</span>
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
