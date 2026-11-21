"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BrainCircuit,
  Compass,
  Award,
  BookOpen,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  Settings,
  Scale,
  CheckCircle2,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  Target,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Play,
  PlayCircle,
  Activity,
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
  const [loading, setLoading] = useState(true);

  // Interactive daily checklist items
  const [checklist, setChecklist] = useState([
    { id: "c1", title: "Complete Skill Assessment", completed: true, type: "assess", icon: "check" },
    { id: "c2", title: "Learn: Machine Learning (30 min)", completed: false, type: "learn", icon: "play", link: "/student/academy" },
    { id: "c3", title: "Update Your Skill Passport", completed: false, type: "passport", icon: "shield", link: "/student/passport" },
    { id: "c4", title: "Explore 2 Job Opportunities", completed: false, type: "jobs", icon: "briefcase", link: "/student/opportunities" },
  ]);

  // Roadmap accordion state
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [updatingActivityId, setUpdatingActivityId] = useState<string | null>(null);
  const [showFullRoadmap, setShowFullRoadmap] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const sessionRes = await fetch("/api/auth/session");
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        if ((sessionData.isAuthenticated || sessionData.authenticated) && sessionData.user) {
          setUser(sessionData.user);
        }
      }

      const [twinRes, criRes, roadmapRes, missionsRes, recsRes] = await Promise.all([
        fetch("/api/student/digital-twin").catch(() => null),
        fetch("/api/student/readiness").catch(() => null),
        fetch("/api/student/roadmap").catch(() => null),
        fetch("/api/student/missions").catch(() => null),
        fetch("/api/student/recommendations?limit=3").catch(() => null),
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
        }
      }
      if (recsRes && recsRes.ok) {
        const d = await recsRes.json();
        setRecommendations(d.recommendations || []);
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

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

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

  const studentName = user?.name ? user.name.split(" ")[0] : "Harshit";
  const fullName = user?.name || "Harshit Chaudhary";
  const educationStage = user?.studentProfile?.educationStage?.replace(/_/g, " ") || "B.Tech (CSE)";
  const isMinor = user?.isMinor ?? false;

  // Real or baseline metrics
  const careerFitScore = recommendations?.[0]?.overallFitPercent ?? 87;
  const verifiedCount = digitalTwin?.verifiedSkillsCount ?? 9;
  const totalSkillsTarget = 12;
  const learningProgressPercent = roadmap?.progressPercent ?? 64;
  const criScore = readiness?.overallScore ?? 79;

  // Formatted date
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["Overview", "My Plan"]}
    >
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        {/* DPDP Minor Protection Notice (if applicable) */}
        {isMinor && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>DPDP Act 2023 Minor Protection Active:</strong> External recruiter discovery is paused until parental verification.
              </span>
            </div>
            <Link href="/student/settings" className="text-emerald-800 font-bold hover:underline shrink-0 text-xs">
              Privacy Settings &rarr;
            </Link>
          </div>
        )}

        {/* =========================================================================
            ROW 1: WELCOME BANNER (LEFT) & AI CAREER MENTOR CARD (RIGHT)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left: Illustrated Welcome Banner (Span 8) */}
          <div className="lg:col-span-8 rounded-3xl bg-gradient-to-r from-[#EFF6FF] via-[#EEF2FF] to-[#FAF5FF] border border-indigo-100/70 p-6 sm:p-7 relative overflow-hidden shadow-xs flex flex-col justify-between">
            {/* Soft decorative background circles */}
            <div className="absolute top-0 right-1/4 w-48 h-48 bg-sky-100/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-100/40 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Left Column: Greeting, Stages, CTAs */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                    Welcome back, {studentName}! <span className="inline-block animate-bounce">👋</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                    Let&apos;s move one step closer to your dream career.
                  </p>
                </div>

                {/* Stage Progression Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-indigo-100 text-[11px] font-bold text-indigo-700 shadow-xs">
                    <span className="text-xs">@</span>
                    <span>Discover</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-amber-100 text-[11px] font-bold text-amber-700 shadow-xs">
                    <span className="text-amber-500 text-xs">⚡</span>
                    <span>Learn</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-emerald-100 text-[11px] font-bold text-emerald-700 shadow-xs">
                    <Check className="h-3 w-3 text-emerald-600" />
                    <span>Build</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-purple-100 text-[11px] font-bold text-purple-700 shadow-xs">
                    <span className="text-xs">🚀</span>
                    <span>Get Hired</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href="#roadmap">
                    <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white font-semibold rounded-xl px-5 py-2.5 text-xs sm:text-sm shadow-md shadow-indigo-200/60 transition-all flex items-center gap-1.5">
                      Continue My Plan &rarr;
                    </button>
                  </Link>
                  <Link href="/careers">
                    <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200/80 font-semibold rounded-xl px-4 py-2.5 text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5">
                      Explore Careers <span className="text-[10px] text-slate-500">▶</span>
                    </button>
                  </Link>
                </div>
              </div>

              {/* Right Column: Mountain Path & Student Graphic */}
              <div className="md:col-span-5 relative flex items-center justify-center min-h-[160px] select-none">
                <svg viewBox="0 0 280 200" fill="none" className="w-full max-w-[280px] drop-shadow-sm">
                  {/* Mountain silhouette */}
                  <path
                    d="M120 180L190 70C195 62 205 62 210 70L270 180H120Z"
                    fill="url(#mountainGrad1)"
                    opacity="0.85"
                  />
                  <path
                    d="M160 180L230 40C235 32 245 32 250 40L290 180H160Z"
                    fill="url(#mountainGrad2)"
                    opacity="0.9"
                  />
                  {/* Mountain peak sun glow */}
                  <circle cx="240" cy="35" r="28" fill="#FDE68A" opacity="0.6" filter="blur(8px)" />

                  {/* Golden Peak Flag "Your Dream Role" */}
                  <g transform="translate(210, 16)">
                    <rect x="0" y="0" width="68" height="20" rx="6" fill="#FEF08A" stroke="#FACC15" strokeWidth="1" />
                    <text x="34" y="14" fill="#854D0E" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      Your Dream Role
                    </text>
                    <path d="M4 20V32" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Curving winding trajectory path */}
                  <path
                    d="M100 160 C 130 160, 140 130, 170 120 C 190 110, 200 80, 235 48"
                    stroke="#818CF8"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    fill="none"
                  />

                  {/* Milestone tags on path */}
                  <g transform="translate(130, 138)">
                    <rect x="0" y="0" width="46" height="16" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="0.8" />
                    <text x="23" y="11" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      🔍 Discover
                    </text>
                  </g>
                  <g transform="translate(155, 96)">
                    <rect x="0" y="0" width="38" height="16" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="0.8" />
                    <text x="19" y="11" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      📖 Learn
                    </text>
                  </g>
                  <g transform="translate(185, 62)">
                    <rect x="0" y="0" width="52" height="16" rx="4" fill="white" stroke="#818CF8" strokeWidth="0.8" />
                    <text x="26" y="11" fill="#4338CA" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      ⚡ Build Skills
                    </text>
                  </g>
                  <g transform="translate(160, 40)">
                    <rect x="0" y="0" width="42" height="15" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="0.8" />
                    <text x="21" y="11" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                      📝 Assess
                    </text>
                  </g>

                  {/* Student Avatar Character holding laptop */}
                  <g transform="translate(5, 50)">
                    {/* Character Body / KAABIL Hoodie */}
                    <path
                      d="M60 145 C 55 105, 100 105, 95 145 Z"
                      fill="#FFFFFF"
                      stroke="#E2E8F0"
                      strokeWidth="2"
                    />
                    <path
                      d="M68 122 C 72 135, 83 135, 87 122"
                      stroke="#4F46E5"
                      strokeWidth="2"
                      fill="none"
                    />
                    {/* KAABIL Hoodie "K" mark */}
                    <text x="77" y="136" fill="#4F46E5" fontSize="10" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
                      K
                    </text>

                    {/* Head & Face */}
                    <ellipse cx="77.5" cy="85" rx="16" ry="18" fill="#FCD34D" opacity="0.9" />
                    <ellipse cx="77.5" cy="85" rx="15" ry="17" fill="#FDBA74" opacity="0.4" />
                    {/* Hair */}
                    <path
                      d="M62 82 C 60 62, 85 60, 93 72 C 96 78, 93 88, 93 88 C 93 88, 88 78, 82 76 C 75 74, 66 76, 62 82 Z"
                      fill="#1E293B"
                    />
                    {/* Eyes and Smile */}
                    <circle cx="73" cy="83" r="1.5" fill="#0F172A" />
                    <circle cx="82" cy="83" r="1.5" fill="#0F172A" />
                    <path d="M74 89 C 76 92, 79 92, 81 89" stroke="#0F172A" strokeWidth="1.2" strokeLinecap="round" fill="none" />

                    {/* Laptop with "K" mark */}
                    <g transform="translate(70, 115) rotate(-10)">
                      <rect x="0" y="0" width="38" height="26" rx="3" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1" />
                      <text x="19" y="16" fill="white" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                        K
                      </text>
                    </g>
                  </g>

                  <defs>
                    <linearGradient id="mountainGrad1" x1="120" y1="70" x2="270" y2="180" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#93C5FD" />
                      <stop offset="1" stopColor="#60A5FA" />
                    </linearGradient>
                    <linearGradient id="mountainGrad2" x1="160" y1="40" x2="290" y2="180" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#818CF8" />
                      <stop offset="1" stopColor="#6366F1" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Right: AI Career Mentor Card (Span 4) */}
          <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#FAF5FF] via-[#F5F3FF] to-[#EDE9FE]/70 border border-purple-100/80 p-5 sm:p-6 relative flex flex-col justify-between shadow-xs">
            {/* Top Info & 3D Robot Mascot */}
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    AI Career Mentor <span className="text-amber-500 text-sm">✨</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 max-w-[190px] leading-relaxed">
                    Your personal AI guide for skills, careers and opportunities.
                  </p>
                </div>

                {/* 3D Robot Mascot Avatar Artwork */}
                <div className="w-14 h-14 shrink-0 rounded-2xl bg-white shadow-sm border border-purple-100 p-1 flex items-center justify-center">
                  <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12">
                    {/* Head */}
                    <rect x="12" y="14" width="40" height="32" rx="12" fill="#F8FAFC" stroke="#818CF8" strokeWidth="2" />
                    {/* Antenna */}
                    <path d="M32 14V8" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="32" cy="7" r="3" fill="#F59E0B" />
                    {/* Blue Visor Screen */}
                    <rect x="18" y="20" width="28" height="16" rx="6" fill="#1E293B" />
                    {/* Cyan Eyes glowing */}
                    <ellipse cx="26" cy="28" rx="3.5" ry="4" fill="#38BDF8" />
                    <ellipse cx="38" cy="28" rx="3.5" ry="4" fill="#38BDF8" />
                    {/* Friendly Smile */}
                    <path d="M29 32 C 31 34, 33 34, 35 32" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    {/* Ears */}
                    <rect x="8" y="24" width="4" height="12" rx="2" fill="#A5B4FC" />
                    <rect x="52" y="24" width="4" height="12" rx="2" fill="#A5B4FC" />
                    {/* Body collar */}
                    <path d="M22 46 C 22 46, 26 54, 32 54 C 38 54, 42 46, 42 46" fill="#818CF8" />
                  </svg>
                </div>
              </div>

              {/* 3 Interactive Quick Prompt Pills */}
              <div className="space-y-2 mt-4">
                <Link
                  href="/student/mentor?q=Which%20career%20suits%20me%20best?"
                  className="block p-2.5 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-purple-100/90 shadow-xs hover:border-purple-200 transition-all flex items-center gap-2 group"
                >
                  <span className="text-indigo-500 text-sm">💬</span>
                  <span className="truncate group-hover:text-indigo-600">Which career suits me best?</span>
                </Link>

                <Link
                  href="/student/mentor?q=What%20skills%20should%20I%20learn%20next?"
                  className="block p-2.5 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-purple-100/90 shadow-xs hover:border-purple-200 transition-all flex items-center gap-2 group"
                >
                  <span className="text-purple-500 text-sm">📊</span>
                  <span className="truncate group-hover:text-indigo-600">What skills should i learn next?</span>
                </Link>

                <Link
                  href="/student/mentor?q=Create%20a%20weekly%20study%20plan%20for%20my%20career%20goals"
                  className="block p-2.5 px-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-purple-100/90 shadow-xs hover:border-purple-200 transition-all flex items-center gap-2 group"
                >
                  <span className="text-pink-500 text-sm">📅</span>
                  <span className="truncate group-hover:text-indigo-600">Create a weekly study plan</span>
                </Link>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4">
              <Link href="/student/mentor" className="block">
                <button className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all text-center">
                  Chat with KAABIL AI &rarr;
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 2: 4 KPI METRIC CARDS (CAREER FIT, VERIFIED SKILLS, LEARNING, READINESS)
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Career Fit */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-2xl bg-purple-100/70 text-purple-600 flex items-center justify-center">
                <Target className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs">
                &uarr; +6%
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500">Career Fit</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                {careerFitScore}%
              </div>
            </div>
          </div>

          {/* Card 2: Verified Skills */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-2xl bg-sky-100/70 text-sky-600 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs">
                &uarr; +3
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500">Verified Skills</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                {verifiedCount} <span className="text-slate-400 text-lg font-normal">/ {totalSkillsTarget}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Learning Progress */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-2xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500">Learning Progress</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                {learningProgressPercent}%
              </div>
              {/* Colored progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${learningProgressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Readiness Index */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-2xl bg-amber-100/70 text-amber-600 flex items-center justify-center">
                <Trophy className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-500">Readiness Index</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                {criScore} <span className="text-slate-400 text-lg font-normal">/ 100</span>
              </div>
              {/* Colored progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(criScore, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 3: 3 CONTENT CARDS (CAREER MATCHES, SKILL PROGRESS, TODAY'S PLAN)
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Card 1: Your Top Career Matches (Span 5 or 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                      Your Top Career Matches
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      AI-based fit for your skills &amp; interests
                    </p>
                  </div>
                </div>
                <Link
                  href="/careers"
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0 whitespace-nowrap"
                >
                  Explore All &rarr;
                </Link>
              </div>

              {/* Body: Career List + Donut Ring Chart */}
              <div className="grid grid-cols-12 gap-3 items-center mt-5">
                {/* Career Items (Span 7) */}
                <div className="col-span-7 space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 text-xs">💻</span>
                      <span className="text-xs font-bold text-slate-800 truncate">AI &amp; Data Engineer</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      87% Fit
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 text-xs font-mono">&lt;/&gt;</span>
                      <span className="text-xs font-bold text-slate-800 truncate">Software Developer</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      82% Fit
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 text-xs">📦</span>
                      <span className="text-xs font-bold text-slate-800 truncate">Product Manager</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      76% Fit
                    </span>
                  </div>
                </div>

                {/* Donut Ring Chart (Span 5) */}
                <div className="col-span-5 flex items-center justify-center">
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background track circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="#F1F5F9"
                        strokeWidth="11"
                      />
                      {/* Foreground gradient stroke circle (87%) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        stroke="url(#donutGrad)"
                        strokeWidth="11"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - 0.87)}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" />
                          <stop offset="50%" stopColor="#6366F1" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xl font-extrabold text-slate-900 leading-none">87%</span>
                      <span className="text-[9px] font-semibold text-slate-400 mt-0.5 leading-none">Career Fit</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Your Skill Progress (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                    Your Skill Progress
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    7 key skills for your dream role
                  </p>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 mt-5">
                {/* Skill 1: Programming */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="text-blue-500">💻</span>
                      <span>Programming</span>
                    </div>
                    <span className="font-bold text-slate-900">88%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: "88%" }} />
                  </div>
                </div>

                {/* Skill 2: Data & AI */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="text-purple-500">📊</span>
                      <span>Data &amp; AI</span>
                    </div>
                    <span className="font-bold text-slate-900">76%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: "76%" }} />
                  </div>
                </div>

                {/* Skill 3: Problem Solving */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="text-indigo-500">💡</span>
                      <span>Problem Solving</span>
                    </div>
                    <span className="font-bold text-slate-900">84%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "84%" }} />
                  </div>
                </div>

                {/* Skill 4: Communication */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-semibold text-slate-700">
                      <span className="text-teal-500">🗣️</span>
                      <span>Communication</span>
                    </div>
                    <span className="font-bold text-slate-900">72%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 rounded-full" style={{ width: "72%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Today's Plan (Span 4) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <h3 className="font-heading text-sm sm:text-base font-bold text-slate-900">
                    Today&apos;s Plan
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">{todayFormatted}</span>
              </div>

              {/* Interactive Checklist */}
              <div className="space-y-3 mt-5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleChecklistItem(item.id)}
                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 cursor-pointer transition-all select-none"
                  >
                    {/* Checkbox Icon */}
                    <div className="shrink-0">
                      {item.completed ? (
                        <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : item.type === "learn" ? (
                        <div className="h-5 w-5 rounded-md border border-purple-300 text-purple-600 flex items-center justify-center bg-purple-50">
                          <Play className="h-2.5 w-2.5 fill-current" />
                        </div>
                      ) : item.type === "passport" ? (
                        <div className="h-5 w-5 rounded-md border border-sky-300 text-sky-600 flex items-center justify-center bg-sky-50">
                          <Shield className="h-2.5 w-2.5" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-md border border-slate-300 text-slate-600 flex items-center justify-center bg-slate-50">
                          <Briefcase className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-medium truncate ${
                          item.completed ? "text-slate-400 line-through" : "text-slate-800"
                        }`}
                      >
                        {item.title}
                      </p>
                    </div>

                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={(e) => e.stopPropagation()}
                        className="text-slate-400 hover:text-indigo-600 p-1"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ROW 4: "EXPLORE MORE WITH KAABIL" BENTO GRID
           ========================================================================= */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <span className="text-xs">⊞</span>
            </div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
              Explore More with KAABIL
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Bento 1: Career What-If Simulator */}
            <Link
              href="/student/simulator"
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#FAF5FF] to-[#F3E8FF]/60 border border-purple-100 hover:border-purple-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-4 w-4 fill-current" />
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-purple-700 transition-colors leading-tight">
                  Career What-If Simulator
                </h4>
              </div>
            </Link>

            {/* Bento 2: Career Digital Twin */}
            <Link
              href="/student/digital-twin"
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5]/60 border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">
                  Career Digital Twin
                </h4>
              </div>
            </Link>

            {/* Bento 3: Adaptive Career Roadmap */}
            <Link
              href="#roadmap"
              onClick={() => setShowFullRoadmap(true)}
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7]/60 border border-amber-100 hover:border-amber-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition-colors leading-tight">
                  Adaptive Career Roadmap
                </h4>
              </div>
            </Link>

            {/* Bento 4: Digital Skill Passport */}
            <Link
              href="/student/passport"
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE]/60 border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-sky-700 transition-colors leading-tight">
                  Digital Skill Passport
                </h4>
              </div>
            </Link>

            {/* Bento 5: Resume Studio */}
            <Link
              href="/student/resume"
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#FFF1F2] to-[#FFE4E6]/60 border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-rose-700 transition-colors leading-tight">
                  Resume Studio
                </h4>
              </div>
            </Link>

            {/* Bento 6: Interview Lab */}
            <Link
              href="/student/interview-lab"
              className="group p-4 rounded-3xl bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7]/60 border border-emerald-100 hover:border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between min-h-[110px]"
            >
              <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="h-4 w-4" />
              </div>
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight">
                  Interview Lab
                </h4>
              </div>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SECTION 5: INTEGRATED 12-WEEK ADAPTIVE CAREER ROADMAP (ANCHOR #roadmap)
           ========================================================================= */}
        <div id="roadmap" className="mt-8 pt-6 border-t border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="h-5 w-5 text-indigo-600" />
                12-Week Adaptive Career Roadmap
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Week-by-week actionable competencies dynamically tailored to your chosen trajectory.
              </p>
            </div>
            <button
              onClick={() => setShowFullRoadmap(!showFullRoadmap)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              {showFullRoadmap ? "Collapse Details" : "Expand Roadmap"}
              {showFullRoadmap ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Roadmap Milestones */}
          {roadmap?.milestones && roadmap.milestones.length > 0 ? (
            <div className={`space-y-3 ${!showFullRoadmap ? "max-h-[340px] overflow-hidden relative" : ""}`}>
              {roadmap.milestones.map((milestone: any, mIdx: number) => {
                const isExpanded = expandedMilestoneId === milestone.id;
                return (
                  <div
                    key={milestone.id || mIdx}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs"
                  >
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            milestone.isCompleted
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {milestone.isCompleted ? "✓" : mIdx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{milestone.title}</h4>
                          <p className="text-xs text-slate-500">{milestone.description}</p>
                        </div>
                      </div>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </div>

                    {isExpanded && milestone.activities && (
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        {milestone.activities.map((act: any) => (
                          <div
                            key={act.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs"
                          >
                            <span className={act.isCompleted ? "line-through text-slate-400" : "text-slate-800"}>
                              {act.title}
                            </span>
                            <button
                              disabled={updatingActivityId === act.id}
                              onClick={() => handleToggleActivity(milestone.id, act.id)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                act.isCompleted
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
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
                    className="pointer-events-auto bg-white/90 border border-slate-200 shadow-sm px-4 py-1.5 rounded-full text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View All {roadmap.milestones.length} Milestones &darr;
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 text-center text-xs text-slate-500">
              Adaptive career roadmap initialized with 12-week core milestones. Complete today&apos;s micro-missions to advance.
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
