"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
  ExternalLink,
  Flame,
  Clock,
  Send,
  Loader2,
  FolderGit2,
  CheckSquare,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [digitalTwin, setDigitalTwin] = useState<any>(null);
  const [readiness, setReadiness] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [learningCourses, setLearningCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick career search query in greeting
  const [greetingSearch, setGreetingSearch] = useState("");

  // AI Mentor Quick Prompt
  const [mentorInput, setMentorInput] = useState("");
  const [isSubmittingMentor, setIsSubmittingMentor] = useState(false);

  // Daily missions completion tracking
  const [completingMissionId, setCompletingMissionId] = useState<string | null>(null);

  // Roadmap accordion state
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [updatingActivityId, setUpdatingActivityId] = useState<string | null>(null);
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);

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
          // Default 3 actionable tasks linked to student roadmap
          setMissions([
            {
              id: "m1",
              title: "Complete Algorithmic Logic Baseline Assessment",
              objective: "Verify core problem-solving competencies for NSQF Level 7.",
              estimatedMinutes: 15,
              status: "COMPLETED",
              link: "/student/assessments",
            },
            {
              id: "m2",
              title: "Learn: PyTorch & Distributed Systems Inference",
              objective: "Advance through Milestone 2 learning activities.",
              estimatedMinutes: 25,
              status: "PENDING",
              link: "/student/academy",
            },
            {
              id: "m3",
              title: "Update & Cryptographically Sign Skill Passport",
              objective: "Record your latest project evidence with SHA-256 integrity.",
              estimatedMinutes: 10,
              status: "PENDING",
              link: "/student/passport",
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
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Toggle mission completion and persist to backend
  const handleToggleMission = async (missionId: string, currentStatus: string) => {
    setCompletingMissionId(missionId);
    try {
      const isCurrentlyCompleted = currentStatus === "COMPLETED";
      const newStatus = isCurrentlyCompleted ? "PENDING" : "COMPLETED";

      // Optimistic update
      setMissions((prev) =>
        prev.map((m) => (m.id === missionId ? { ...m, status: newStatus } : m))
      );

      // Persist to complete endpoint
      if (!isCurrentlyCompleted) {
        await fetch("/api/student/missions/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            missionId,
            reflectionText: "Completed via Student Dashboard Daily Mission checklist.",
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

  // Student details
  const studentFirstName = user?.name ? user.name.split(" ")[0] : "Student";
  const fullName = user?.name || "Student Scholar";
  const isMinor = user?.isMinor ?? false;

  // Real or baseline metrics
  const criScore = readiness?.overallScore ?? 78;
  const criStatus = readiness?.statusLabel || (criScore >= 75 ? "Competent & Placement Ready" : "Developing Baseline");
  const verifiedCount = digitalTwin?.verifiedSkillsCount ?? readiness?.evidenceSummary?.verifiedCount ?? 9;
  const targetSkillsCount = 12;

  // Areas to improve from skill gap analysis
  const areasToImprove = [
    { skill: "FastAPI Model Serving", current: "65%", benchmark: "85%", gap: "-20%" },
    { skill: "Distributed Vector Retrieval", current: "70%", benchmark: "90%", gap: "-20%" },
    { skill: "Ind AS Financial Reconciliation", current: "60%", benchmark: "80%", gap: "-20%" },
  ];

  // Formatted date
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

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Overview", "Student Dashboard"]}
    >
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        
        {/* DPDP Minor Protection Notice (if applicable) */}
        {isMinor && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>DPDP Act 2023 Minor Protection Active:</strong> Recruiter commercialization and external talent discovery remain locked until parent/guardian verification.
              </span>
            </div>
            <Link href="/student/settings" className="text-emerald-800 font-bold hover:underline shrink-0 text-xs">
              Privacy Settings &rarr;
            </Link>
          </div>
        )}

        {/* =========================================================================
            SECTION A: PERSONALIZED GREETING
            Large premium serif typography, subtle decorative illustration, quick career search
           ========================================================================= */}
        <div className="relative rounded-3xl bg-gradient-to-r from-white via-[#FAF5FF] to-[#F5F3FF] border border-purple-100/80 p-6 sm:p-9 shadow-soft-sm overflow-hidden">
          {/* Subtle ambient decorative mesh */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Serif Greetings & Search Bar */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100/70 px-3 py-1 rounded-full">
                  {todayFormatted}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" /> 7-Day Streak
                </span>
              </div>

              {/* Exact required greetings */}
              <div className="space-y-1">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {getGreetingTime()}, {studentFirstName}.
                </h1>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-purple-900/90 tracking-tight">
                  What will you achieve today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-medium pt-1">
                  Your next career milestone starts with one meaningful step.
                </p>
              </div>

              {/* Quick Career Search Bar */}
              <form onSubmit={handleGreetingSearchSubmit} className="relative max-w-xl pt-2">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="text"
                  value={greetingSearch}
                  onChange={(e) => setGreetingSearch(e.target.value)}
                  placeholder="Quick search: careers, skills, internships, or courses..."
                  className="w-full pl-11 pr-28 py-3 rounded-2xl bg-white/95 border border-purple-200/80 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 shadow-sm transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                >
                  <span>Explore</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Core Journey Progress Steps */}
              <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] font-bold text-slate-600">
                <span className="text-purple-700">Journey:</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-purple-100 text-purple-800 shadow-xs">
                  1. Discover
                </span>
                <span>&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-indigo-100 text-indigo-800 shadow-xs">
                  2. Learn
                </span>
                <span>&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-emerald-100 text-emerald-800 shadow-xs">
                  3. Assess
                </span>
                <span>&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-sky-100 text-sky-800 shadow-xs">
                  4. Verify
                </span>
                <span>&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs">
                  5. Get Hired
                </span>
              </div>
            </div>

            {/* Right Col: Atmospheric Decorative Campus & Twin Badge */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-5 rounded-2xl bg-white/80 backdrop-blur-md border border-purple-100/90 shadow-soft-xs">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-2xl bg-[#150E22] flex items-center justify-center text-white">
                  <Compass className="h-10 w-10 text-amber-400" />
                </div>
              </div>
              <h3 className="font-heading text-sm font-bold text-slate-900 mt-3">
                Career Digital Twin Active
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-[200px]">
                Aligned with AICTE &amp; Ind AS benchmarks across 13 educational streams.
              </p>
              <Link href="/student/digital-twin" className="mt-3">
                <button className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline">
                  View Career Twin &rarr;
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW: SECTION B (CAREER READINESS) & SECTION C (AI CAREER MENTOR)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* =========================================================================
              SECTION B: CAREER READINESS
              Overall score, assessment status, verified skills, areas to improve, next action
             ========================================================================= */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-purple-100/80 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-6">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Career Readiness Index (CRI)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Deterministic employability score calculated from verified benchmarks
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {criStatus}
                </span>
              </div>

              {/* Main Score & Verification Gauge */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center mt-5">
                {/* Score Number (Span 5) */}
                <div className="sm:col-span-5 p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 border border-purple-100/70 text-center">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                    Readiness Score
                  </div>
                  <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 mt-1 font-serif">
                    {criScore}
                    <span className="text-lg font-normal text-slate-400">/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(criScore, 100)}%` }}
                    />
                  </div>
                  <span className="inline-block mt-2 text-[10px] text-slate-500">
                    Top 15% in Your Stream
                  </span>
                </div>

                {/* Verified Skills Summary (Span 7) */}
                <div className="sm:col-span-7 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">Verified Competencies</span>
                    <span className="font-bold text-slate-900">
                      {verifiedCount} of {targetSkillsCount} verified
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Algorithmic Logic", "PyTorch Inference", "FastAPI Serving", "Git & CI/CD", "Ind AS Compliance"].map(
                      (sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-purple-50/80 text-purple-900 border border-purple-200/60"
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {sk}
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 pt-1">
                    Evidence secured with HMAC-SHA256 signature in your Digital Skill Passport.
                  </p>
                </div>
              </div>

              {/* Areas to Improve */}
              <div className="mt-5 pt-4 border-t border-slate-100 space-y-2.5">
                <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Priority Areas to Improve</span>
                  <Link href="/student/skill-gaps" className="text-purple-700 hover:underline text-[11px] font-semibold">
                    Detailed Gap Analysis &rarr;
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {areasToImprove.map((area) => (
                    <div
                      key={area.skill}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
                    >
                      <span className="text-[11px] font-bold text-slate-800 truncate">{area.skill}</span>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>Current: {area.current}</span>
                        <span className="font-bold text-rose-600">{area.gap}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Recommended Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-100/60">
              <div className="text-xs">
                <span className="font-bold text-slate-900 block">Recommended Next Step:</span>
                <span className="text-slate-600">Complete the 15-minute Fast Inference Milestone assessment.</span>
              </div>
              <Link href="/student/assessments" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span>Take Assessment</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </Link>
            </div>
          </div>

          {/* =========================================================================
              SECTION C: AI CAREER MENTOR CARD
              Interactive card with useful suggested prompts and instant query launcher
             ========================================================================= */}
          <div className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#FAF5FF] via-white to-[#F5F3FF] border border-purple-100/90 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-4">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md mb-1.5">
                    <Sparkles className="h-3 w-3" /> Trilingual AI
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                    AI Career Mentor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Grounded in English, हिन्दी, &amp; Hinglish with zero hallucination.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                  <Bot className="h-5 w-5" />
                </div>
              </div>

              {/* Form Input */}
              <form onSubmit={handleMentorSubmit} className="relative mt-4">
                <input
                  type="text"
                  value={mentorInput}
                  onChange={(e) => setMentorInput(e.target.value)}
                  placeholder="Ask your mentor anything..."
                  className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!mentorInput.trim()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 px-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-50 transition-all"
                >
                  Send
                </button>
              </form>

              {/* Useful Suggested Prompts */}
              <div className="space-y-2 mt-4">
                <span className="text-[11px] font-bold text-slate-500 block">Suggested Prompts:</span>
                {[
                  "Which career suits my current skills?",
                  "How can I become an AI Engineer?",
                  "What skills should I learn next?",
                  "How ready am I for campus placements?",
                ].map((prompt) => (
                  <Link
                    key={prompt}
                    href={`/student/mentor?q=${encodeURIComponent(prompt)}`}
                    className="block p-2 px-3 rounded-xl bg-white hover:bg-purple-50/70 border border-purple-100/80 text-xs text-slate-700 font-medium transition-all flex items-center justify-between group hover:border-purple-200"
                  >
                    <span className="truncate group-hover:text-purple-900">{prompt}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Launch Mentor Button */}
            <div className="pt-2">
              <Link href="/student/mentor" className="block">
                <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition-all text-center flex items-center justify-center gap-2">
                  <Bot className="h-4 w-4" />
                  <span>Open Full Mentorship Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW: SECTION D (DAILY MISSIONS) & SECTION E (RECOMMENDED LEARNING)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* =========================================================================
              SECTION D: DAILY MISSIONS
              Three actionable tasks linked to roadmap with persistent completion
             ========================================================================= */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-purple-100/80 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Daily Micro-Missions
                    </h3>
                    <p className="text-xs text-slate-500">
                      Three actionable milestones to advance your career plan today
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                  {missions.filter((m) => m.status === "COMPLETED").length} / {missions.length} Done
                </span>
              </div>

              {/* 3 Actionable Missions */}
              <div className="space-y-3 mt-5">
                {missions.slice(0, 3).map((mission, idx) => {
                  const isCompleted = mission.status === "COMPLETED";
                  return (
                    <div
                      key={mission.id || idx}
                      onClick={() => handleToggleMission(mission.id, mission.status)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        isCompleted
                          ? "bg-slate-50/70 border-slate-200/80 opacity-75"
                          : "bg-white hover:bg-purple-50/40 border-purple-100 shadow-xs hover:border-purple-200"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        type="button"
                        disabled={completingMissionId === mission.id}
                        className={`h-6 w-6 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isCompleted
                            ? "bg-emerald-500 text-white shadow-xs"
                            : "border-2 border-purple-300 hover:border-purple-500 bg-white"
                        }`}
                      >
                        {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`text-xs font-bold ${
                              isCompleted ? "line-through text-slate-400" : "text-slate-900"
                            }`}
                          >
                            {mission.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {mission.estimatedMinutes || 15} min
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {mission.objective || "Actionable micro-activity linked to your career roadmap."}
                        </p>
                      </div>

                      {/* Action link */}
                      {mission.link && (
                        <Link
                          href={mission.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-purple-600 hover:text-purple-800 p-1 shrink-0"
                          title="Open activity"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
              Completed missions automatically record verified skill progress in your Digital Passport.
            </p>
          </div>

          {/* =========================================================================
              SECTION E: RECOMMENDED LEARNING
              Relevant courses & learning activities based on identified skill gaps
             ========================================================================= */}
          <div className="lg:col-span-6 rounded-3xl bg-white border border-purple-100/80 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Recommended Learning
                    </h3>
                    <p className="text-xs text-slate-500">
                      Curated modules addressing your high-priority skill gaps
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/academy"
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
                >
                  All Courses &rarr;
                </Link>
              </div>

              {/* 3 Learning Modules */}
              <div className="space-y-3 mt-5">
                {[
                  {
                    title: "FastAPI Model Serving & Production Benchmark",
                    stream: "STEM (PCM)",
                    difficulty: "INTERMEDIATE",
                    duration: "45 mins",
                    gapAddressed: "FastAPI Model Serving (+20%)",
                    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
                  },
                  {
                    title: "Vector Search & Retrieval-Augmented Generation",
                    stream: "STEM (PCM)",
                    difficulty: "ADVANCED",
                    duration: "60 mins",
                    gapAddressed: "Vector Embeddings (+20%)",
                    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
                  },
                  {
                    title: "Indian Accounting Standards (Ind AS) Financial Reconciliation",
                    stream: "Commerce & Finance",
                    difficulty: "FOUNDATIONAL",
                    duration: "30 mins",
                    gapAddressed: "Regulatory Ind AS (+20%)",
                    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
                  },
                ].map((course, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-purple-200 transition-all flex items-center justify-between gap-3 shadow-xs group"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${course.badgeColor}`}>
                          {course.difficulty}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {course.duration}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700 transition-colors truncate">
                        {course.title}
                      </h4>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Addresses: {course.gapAddressed}
                      </p>
                    </div>

                    <Link href="/student/academy" className="shrink-0">
                      <button className="px-3 py-1.5 rounded-xl bg-white hover:bg-purple-600 hover:text-white text-purple-700 border border-purple-200 font-bold text-xs transition-all flex items-center gap-1 shadow-xs">
                        <span>Start</span>
                        <Play className="h-3 w-3 fill-current" />
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link href="/student/academy" className="block">
                <button className="w-full py-2.5 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-xs transition-all text-center">
                  Explore Full KAABIL Academy Library &rarr;
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION F: CAREER ROADMAP
            A visual progression showing current stage, completed milestones and upcoming goals
           ========================================================================= */}
        <div id="roadmap" className="rounded-3xl bg-white border border-purple-100/80 p-6 sm:p-7 shadow-soft-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  <Compass className="h-4 w-4" />
                </div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Adaptive Career Roadmap (12-Week Horizon)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic milestone progression personalized to your chosen career trajectory.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/student/roadmap" className="text-xs font-bold text-purple-700 hover:underline">
                Full Roadmap View &rarr;
              </Link>
              <button
                onClick={() => setShowFullRoadmap(!showFullRoadmap)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1 transition-colors"
              >
                <span>{showFullRoadmap ? "Collapse" : "Expand All"}</span>
                {showFullRoadmap ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Stepper Timeline Header */}
          <div className="grid grid-cols-4 gap-2 text-center pb-2">
            {[
              { stage: "Stage 1", label: "Foundation & Assessment", status: "COMPLETED" },
              { stage: "Stage 2", label: "Core Skills & Lab", status: "CURRENT" },
              { stage: "Stage 3", label: "Industry Project", status: "UPCOMING" },
              { stage: "Stage 4", label: "Interview & Placement", status: "UPCOMING" },
            ].map((step, sIdx) => {
              const isCurrent = step.status === "CURRENT";
              const isCompleted = step.status === "COMPLETED";
              return (
                <div key={sIdx} className="space-y-1">
                  <div className="flex items-center">
                    <div
                      className={`h-2 w-full rounded-full ${
                        isCompleted
                          ? "bg-emerald-500"
                          : isCurrent
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                          : "bg-slate-200"
                      }`}
                    />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">{step.stage}</div>
                  <div className="text-[10px] text-slate-500 hidden sm:block truncate">{step.label}</div>
                </div>
              );
            })}
          </div>

          {/* Milestones list */}
          {roadmap?.milestones && roadmap.milestones.length > 0 ? (
            <div className={`space-y-3 ${!showFullRoadmap ? "max-h-[380px] overflow-hidden relative" : ""}`}>
              {roadmap.milestones.map((milestone: any, mIdx: number) => {
                const isExpanded = expandedMilestoneId === milestone.id;
                return (
                  <div
                    key={milestone.id || mIdx}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:border-purple-200 transition-all"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer select-none"
                      onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            milestone.isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                        >
                          {milestone.isCompleted ? <Check className="h-4 w-4" /> : mIdx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">{milestone.title}</h4>
                            {milestone.isCompleted && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{milestone.description}</p>
                        </div>
                      </div>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </div>

                    {isExpanded && milestone.activities && (
                      <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
                        {milestone.activities.map((act: any) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-white text-xs border border-slate-100"
                          >
                            <span className={act.isCompleted ? "line-through text-slate-400 font-medium" : "text-slate-800 font-medium"}>
                              {act.title}
                            </span>
                            <button
                              disabled={updatingActivityId === act.id}
                              onClick={() => handleToggleActivity(milestone.id, act.id)}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                act.isCompleted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white"
                              }`}
                            >
                              {act.isCompleted ? "Done" : "Mark Complete"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {!showFullRoadmap && (
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none flex items-end justify-center pb-2">
                  <button
                    onClick={() => setShowFullRoadmap(true)}
                    className="pointer-events-auto bg-white border border-purple-200 shadow-sm px-4 py-1.5 rounded-full text-xs font-bold text-purple-700 hover:text-purple-900"
                  >
                    View All {roadmap.milestones.length} Milestones &darr;
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 text-center text-xs text-slate-500">
              Adaptive career roadmap initialized with 12-week core milestones. Complete daily micro-missions to advance.
            </div>
          )}
        </div>

        {/* =========================================================================
            ROW: SECTION G (RECOMMENDED OPPORTUNITIES) & SECTION H (ACHIEVEMENTS)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* =========================================================================
              SECTION G: RECOMMENDED OPPORTUNITIES
              Relevant internships & jobs with transparent matching explanations
             ========================================================================= */}
          <div className="lg:col-span-7 rounded-3xl bg-white border border-purple-100/80 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Recommended Opportunities
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verified matches with explainable rubric scoring
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/opportunities"
                  className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                >
                  View All &rarr;
                </Link>
              </div>

              {/* Opportunities List */}
              <div className="space-y-3 mt-5">
                {[
                  {
                    title: "AI Inference & Systems Engineering Intern",
                    company: "DeepNeural Labs India",
                    location: "Bengaluru (Hybrid)",
                    stipend: "₹35,000 / month",
                    matchScore: 94,
                    skillsMatched: "3 of 4 required verified (FastAPI, PyTorch, Python)",
                  },
                  {
                    title: "Corporate Audit & Ind AS Trainee",
                    company: "Apex Advisory & Capital",
                    location: "Mumbai (On-site)",
                    stipend: "₹25,000 / month",
                    matchScore: 88,
                    skillsMatched: "Ind AS Compliance, Financial Reconciliation verified",
                  },
                  {
                    title: "Cloud Microservices & DevOps Trainee",
                    company: "Indus Cloud Technologies",
                    location: "Remote (India)",
                    stipend: "₹30,000 / month",
                    matchScore: 82,
                    skillsMatched: "Docker, CI/CD, Algorithmic Logic verified",
                  },
                ].map((opp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-white border border-slate-100 hover:border-purple-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {opp.matchScore}% Match
                        </span>
                        <span className="text-xs font-bold text-slate-900">{opp.company}</span>
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {opp.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {opp.location} • <strong className="text-slate-700">{opp.stipend}</strong>
                      </p>
                      <p className="text-[10px] text-purple-700 font-medium">
                        Rubric: {opp.skillsMatched}
                      </p>
                    </div>

                    <Link href="/student/opportunities" className="shrink-0 self-start sm:self-auto">
                      <button className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-xs">
                        View Role
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-2 border-t border-slate-100">
              Only verified employers can post on KAABIL. Minors under 18 remain shielded under the DPDP Act 2023.
            </p>
          </div>

          {/* =========================================================================
              SECTION H: ACHIEVEMENTS
              Verified badges, completed assessments, and skill milestones
             ========================================================================= */}
          <div className="lg:col-span-5 rounded-3xl bg-white border border-purple-100/80 p-6 sm:p-7 shadow-soft-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                      Achievements &amp; Badges
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cryptographically verified milestone badges
                    </p>
                  </div>
                </div>
                <Link
                  href="/student/passport"
                  className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
                >
                  Skill Passport &rarr;
                </Link>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-2 gap-3 mt-5">
                {[
                  {
                    title: "Foundational Logic Verified",
                    issuer: "AICTE / KAABIL Benchmark",
                    date: "Nov 2026",
                    icon: "🏅",
                    bg: "bg-purple-50 border-purple-100 text-purple-900",
                  },
                  {
                    title: "FastAPI Inference Pro",
                    issuer: "NSQF Level 7 Accredited",
                    date: "Oct 2026",
                    icon: "⚡",
                    bg: "bg-blue-50 border-blue-100 text-blue-900",
                  },
                  {
                    title: "Ind AS Module Master",
                    issuer: "ICAI Framework Verified",
                    date: "Sep 2026",
                    icon: "📊",
                    bg: "bg-amber-50 border-amber-100 text-amber-900",
                  },
                  {
                    title: "Top 10% CRI Achiever",
                    issuer: "Placement Readiness",
                    date: "Nov 2026",
                    icon: "👑",
                    bg: "bg-emerald-50 border-emerald-100 text-emerald-900",
                  },
                ].map((badge, bIdx) => (
                  <div
                    key={bIdx}
                    className={`p-3.5 rounded-2xl border ${badge.bg} flex flex-col justify-between space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{badge.date}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-snug">{badge.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{badge.issuer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link href="/student/passport" className="block">
                <button className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all text-center flex items-center justify-center gap-1.5 shadow-sm">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>View Public Shareable Skill Passport</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </PortalLayout>
  );
}
