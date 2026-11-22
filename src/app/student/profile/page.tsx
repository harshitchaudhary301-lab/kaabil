"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Shield,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Compass,
  Award,
  BookOpen,
  ArrowRight,
  Plus,
  X,
  Share2,
  FileCheck,
  Eye,
  Loader2,
  Building2,
  MapPin,
  Target,
  Check,
  HelpCircle,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";
import { PortalLayout } from "@/components/shared/PortalLayout";
import { STUDENT_NAV } from "@/components/student/student-nav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentProfileViewData, SkillProficiencyLevel, STAGE_LABELS, STREAM_LABELS } from "@/types/profile";
import { ALL_CAREERS } from "@/data/careersData";

const POPULAR_INTEREST_SUGGESTIONS = [
  "Artificial Intelligence",
  "Robotics & Automation",
  "Biomedical Technology",
  "Sustainable Energy",
  "Financial Markets & Investing",
  "Clinical Medicine",
  "Constitutional Law",
  "Product Design",
  "Data Science",
  "Creative Writing",
  "Agronomy & Food Systems",
  "Public Policy",
];

export default function StudentCareerProfilePage() {
  const [profile, setProfile] = useState<StudentProfileViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View vs Edit Separation state
  const [mode, setMode] = useState<"VIEW" | "EDIT">("VIEW");

  // Editable Form State
  const [editForm, setEditForm] = useState<{
    name: string;
    bio: string;
    stage: string;
    stream: string;
    institutionName: string;
    boardOrUniversity: string;
    specialization: string;
    graduationYear: number | "";
    grade: string;
    city: string;
    state: string;
    languagePreference: string;
    targetCareerSlug: string;
    targetYear: number | "";
    careerGoalNotes: string;
    interests: string[];
    selfReportedSkills: { name: string; proficiency: SkillProficiencyLevel }[];
    isProfilePublic: boolean;
    allowRecruiterView: boolean;
  }>({
    name: "",
    bio: "",
    stage: "UNDERGRADUATE",
    stream: "NON_MEDICAL_PCM",
    institutionName: "",
    boardOrUniversity: "",
    specialization: "",
    graduationYear: 2027,
    grade: "",
    city: "",
    state: "",
    languagePreference: "en",
    targetCareerSlug: "ai-systems-engineer",
    targetYear: 2027,
    careerGoalNotes: "",
    interests: [],
    selfReportedSkills: [],
    isProfilePublic: false,
    allowRecruiterView: false,
  });

  // New Skill Input state
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillProficiency, setNewSkillProficiency] =
    useState<SkillProficiencyLevel>("INTERMEDIATE");

  // New Interest Input state
  const [newInterestInput, setNewInterestInput] = useState("");

  // Auto-save status tracking
  const [saveStatus, setSaveStatus] = useState<
    "SAVED" | "SAVING" | "ERROR" | "IDLE"
  >("IDLE");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Debounce ref for auto-saving
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDone = useRef(false);

  // Fetch student profile on mount
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/student/profile");
      const data = await res.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        syncFormWithProfile(data.profile);
      } else {
        setError(data.error || "Unable to load student profile.");
      }
    } catch {
      setError("Network connection issue while retrieving profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Sync edit form with profile
  const syncFormWithProfile = (p: StudentProfileViewData) => {
    setEditForm({
      name: p.name || "",
      bio: p.bio || "",
      stage: p.academic.stage || "UNDERGRADUATE",
      stream: p.academic.stream || "NON_MEDICAL_PCM",
      institutionName: p.academic.institutionName || "",
      boardOrUniversity: p.academic.boardOrUniversity || "",
      specialization: p.academic.specialization || "",
      graduationYear: p.academic.graduationYear || 2027,
      grade: p.academic.grade || "",
      city: p.location.city || "",
      state: p.location.state || "",
      languagePreference: p.languagePreference || "en",
      targetCareerSlug: p.targetCareer?.slug || "ai-systems-engineer",
      targetYear: p.targetCareer?.targetYear || 2027,
      careerGoalNotes: p.targetCareer?.notes || "",
      interests: p.interests || [],
      selfReportedSkills: p.skills.selfReported.map((s) => ({
        name: s.name,
        proficiency: s.proficiency,
      })),
      isProfilePublic: p.privacy.isProfilePublic,
      allowRecruiterView: p.privacy.allowRecruiterView,
    });
    setSaveStatus("SAVED");
  };

  // Automatic saving logic (triggers 800ms after editForm changes)
  const triggerAutoSave = useCallback(
    async (formDataToSave: typeof editForm) => {
      setSaveStatus("SAVING");
      try {
        const payload = {
          name: formDataToSave.name,
          bio: formDataToSave.bio,
          educationStage: formDataToSave.stage,
          currentStream: formDataToSave.stream,
          institutionName: formDataToSave.institutionName,
          boardOrUniversity: formDataToSave.boardOrUniversity,
          specialization: formDataToSave.specialization,
          graduationYear:
            typeof formDataToSave.graduationYear === "number"
              ? formDataToSave.graduationYear
              : null,
          grade: formDataToSave.grade,
          city: formDataToSave.city,
          state: formDataToSave.state,
          languagePreference: formDataToSave.languagePreference,
          targetCareerSlug: formDataToSave.targetCareerSlug,
          targetYear:
            typeof formDataToSave.targetYear === "number"
              ? formDataToSave.targetYear
              : null,
          careerGoalNotes: formDataToSave.careerGoalNotes,
          interests: formDataToSave.interests,
          selfReportedSkills: formDataToSave.selfReportedSkills,
          isProfilePublic: formDataToSave.isProfilePublic,
          allowRecruiterView: formDataToSave.allowRecruiterView,
        };

        const res = await fetch("/api/student/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
          setSaveStatus("SAVED");
          setLastSavedAt(new Date());
        } else {
          setSaveStatus("ERROR");
        }
      } catch {
        setSaveStatus("ERROR");
      }
    },
    []
  );

  // Debounced auto-save effect
  const handleFormFieldChange = (field: string, value: any) => {
    setEditForm((prev) => {
      const next = { ...prev, [field]: value };
      if (initialLoadDone.current && mode === "EDIT") {
        setSaveStatus("SAVING");
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        autoSaveTimeoutRef.current = setTimeout(() => {
          triggerAutoSave(next);
        }, 800);
      }
      return next;
    });
  };

  useEffect(() => {
    if (profile && !initialLoadDone.current) {
      initialLoadDone.current = true;
    }
  }, [profile]);

  // Skill Management in Edit Mode
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const trimmed = newSkillName.trim();

    // Check if skill already exists in verified skills
    const isAlreadyAssessed = profile?.skills.assessed.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (isAlreadyAssessed) {
      alert(`"${trimmed}" is already an assessed & verified skill.`);
      return;
    }

    // Check if already in self-reported
    const exists = editForm.selfReportedSkills.some(
      (s) => s.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      alert(`"${trimmed}" is already in your skills list.`);
      return;
    }

    const updated = [
      ...editForm.selfReportedSkills,
      { name: trimmed, proficiency: newSkillProficiency },
    ];
    handleFormFieldChange("selfReportedSkills", updated);
    setNewSkillName("");
  };

  const handleRemoveSkill = (skillName: string) => {
    const updated = editForm.selfReportedSkills.filter(
      (s) => s.name.toLowerCase() !== skillName.toLowerCase()
    );
    handleFormFieldChange("selfReportedSkills", updated);
  };

  // Interest Management in Edit Mode
  const handleAddInterest = (interest: string) => {
    const trimmed = interest.trim();
    if (!trimmed) return;
    if (editForm.interests.some((i) => i.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }
    const updated = [...editForm.interests, trimmed];
    handleFormFieldChange("interests", updated);
    setNewInterestInput("");
  };

  const handleRemoveInterest = (interest: string) => {
    const updated = editForm.interests.filter(
      (i) => i.toLowerCase() !== interest.toLowerCase()
    );
    handleFormFieldChange("interests", updated);
  };

  // Copy Profile Link
  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (loading) {
    return (
      <PortalLayout
        portalName="Student Portal"
        portalRole="STUDENT"
        navItems={STUDENT_NAV}
        breadcrumbs={["My Career Profile"]}
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-purple-600 animate-pulse">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Loading your personalized career profile...
          </p>
        </div>
      </PortalLayout>
    );
  }

  if (error || !profile) {
    return (
      <PortalLayout
        portalName="Student Portal"
        portalRole="STUDENT"
        navItems={STUDENT_NAV}
        breadcrumbs={["My Career Profile"]}
      >
        <div className="max-w-2xl mx-auto p-6 bg-white border border-rose-200 rounded-2xl shadow-sm text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-rose-50 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Unable to Load Profile
          </h2>
          <p className="text-xs text-slate-600">
            {error || "An error occurred while loading your profile data."}
          </p>
          <Button onClick={fetchProfile} className="bg-purple-600 hover:bg-purple-700 text-white">
            Try Again
          </Button>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout
      portalName="Student Portal"
      portalRole="STUDENT"
      navItems={STUDENT_NAV}
      breadcrumbs={["My Career Profile"]}
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* ==================================================================== */}
        {/* TOP CONTROLS & VIEW SEPARATION BAR */}
        {/* ==================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-purple-100/80 shadow-sm">
          {/* Title & Mode Badge */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-xl shadow-sm shadow-purple-200">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  My Career Profile
                </h1>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    mode === "VIEW"
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {mode === "VIEW" ? "Viewing Mode" : "Editing Mode"}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {mode === "VIEW"
                  ? "Your comprehensive student career dossier and verified credentials"
                  : "Update your academic details, interests, goals, and self-reported skills"}
              </p>
            </div>
          </div>

          {/* Action Switcher & Auto-save Status */}
          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Auto-save status feedback when in edit mode */}
            {mode === "EDIT" && (
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                {saveStatus === "SAVING" ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
                    <span className="text-amber-700 font-medium">Saving...</span>
                  </>
                ) : saveStatus === "SAVED" ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">All changes saved</span>
                  </>
                ) : saveStatus === "ERROR" ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                    <span className="text-rose-700 font-medium">Save error</span>
                  </>
                ) : (
                  <span>Auto-save active</span>
                )}
              </div>
            )}

            {/* View / Edit Mode Toggle Button */}
            {mode === "VIEW" ? (
              <Button
                onClick={() => setMode("EDIT")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2 shadow-sm rounded-xl px-4 py-2 text-xs"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={() => {
                  setMode("VIEW");
                  if (profile) syncFormWithProfile(profile);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2 shadow-sm rounded-xl px-4 py-2 text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Done Editing (View Profile)
              </Button>
            )}

            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="border-purple-200 text-purple-700 hover:bg-purple-50 rounded-xl px-3 py-2 text-xs"
              title="Copy Profile Link"
            >
              <Share2 className="h-3.5 w-3.5 mr-1" />
              {copiedLink ? "Copied!" : "Share"}
            </Button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* VIEW MODE PRESENTATION */}
        {/* ==================================================================== */}
        {mode === "VIEW" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* HERO PROFILE DOSSIER */}
            <Card className="relative overflow-hidden border-purple-100 shadow-sm bg-gradient-to-br from-white via-[#FAF7FD] to-[#F5EFFF] p-6 sm:p-8 rounded-3xl">
              {/* Pixel Art Campus Sunset Glow & Accents */}
              <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-purple-200/40 via-pink-100/30 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-80 pointer-events-none">
                <span className="inline-block w-2 h-2 bg-purple-400 rounded-sm" />
                <span className="inline-block w-2.5 h-2.5 bg-amber-400 rounded-sm" />
                <span className="inline-block w-2 h-2 bg-pink-400 rounded-sm" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  {/* Avatar Frame with Pixel Glow */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-purple-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-purple-300/50 border-2 border-white">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    {/* Verified Student Star Accent */}
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 p-1 rounded-full shadow border-2 border-white">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  </div>

                  {/* Student Title & Details */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        {profile.name}
                      </h2>
                      <Badge className="bg-purple-100 text-purple-800 border-none font-bold text-[10px]">
                        {profile.academic.stageLabel}
                      </Badge>
                      <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold text-[10px]">
                        {profile.academic.streamLabel}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      {profile.academic.institutionName && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-purple-500" />
                          {profile.academic.institutionName}
                        </span>
                      )}
                      {(profile.location.city || profile.location.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-pink-500" />
                          {[profile.location.city, profile.location.state]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                      {profile.academic.graduationYear && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          Target Class of {profile.academic.graduationYear}
                        </span>
                      )}
                    </div>

                    {profile.bio && (
                      <p className="text-xs text-slate-600 max-w-2xl pt-1 leading-relaxed">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right side: Minor Shield / DPDP Status */}
                <div className="w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-purple-100">
                  {profile.privacy.isMinorShieldActive ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 max-w-sm">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                        <Shield className="h-4 w-4 text-amber-600" />
                        Minor Shield Active (DPDP Act)
                      </div>
                      <p className="text-[11px] text-amber-700 mt-1 leading-snug">
                        School learner under 18 years. Recruiter outreach and commercial headhunting are strictly locked to protect minor privacy.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-900 max-w-sm">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        DPDP Act Privacy Protected
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1 leading-snug">
                        {profile.privacy.allowRecruiterView
                          ? "Verified recruiters can view your demonstrated skills and invite you to opportunities."
                          : "Your profile is private. Recruiter viewing is turned off."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* QUICK SNAPSHOT METRIC TILES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-purple-100/70 text-xs">
                <div className="p-3 rounded-2xl bg-white/70 border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Target Career
                  </span>
                  <span className="font-bold text-purple-900 text-sm truncate block mt-0.5">
                    {profile.targetCareer?.title || "Exploring"}
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Assessed Skills
                  </span>
                  <span className="font-bold text-emerald-700 text-sm block mt-0.5">
                    {profile.skills.assessedCount} Verified
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Self-Reported
                  </span>
                  <span className="font-bold text-slate-700 text-sm block mt-0.5">
                    {profile.skills.selfReportedCount} In Portfolio
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-white/70 border border-purple-100">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Readiness Index (CRI)
                  </span>
                  <span className="font-bold text-indigo-700 text-sm block mt-0.5">
                    {profile.careerReadinessIndex !== null
                      ? `${profile.careerReadinessIndex} / 100`
                      : "Unassessed"}
                  </span>
                </div>
              </div>
            </Card>

            {/* TWO-COLUMN DETAILS GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT COLUMN: SELECTED CAREER & GOALS + ACADEMIC BACKGROUND */}
              <div className="lg:col-span-1 space-y-6">
                {/* 1. SELECTED CAREER & GOALS */}
                <Card className="p-5 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-600" />
                      Target Career & Goal
                    </h3>
                    <Badge variant="outline" className="text-[10px] text-purple-700 border-purple-200">
                      Primary
                    </Badge>
                  </div>

                  {profile.targetCareer ? (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                          Aspirational Role
                        </span>
                        <div className="text-base font-extrabold text-slate-900 mt-0.5">
                          {profile.targetCareer.title}
                        </div>
                        {profile.targetCareer.regulatoryBody && (
                          <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                            Regulated: {profile.targetCareer.regulatoryBody}
                          </span>
                        )}
                      </div>

                      {profile.targetCareer.notes && (
                        <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-purple-100/60 leading-relaxed">
                          &ldquo;{profile.targetCareer.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-purple-100">
                        <span>Milestone Horizon</span>
                        <span className="font-bold text-slate-700">
                          {profile.targetCareer.targetYear || profile.academic.graduationYear || 2027}
                        </span>
                      </div>

                      <Link
                        href={`/careers/${profile.targetCareer.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-800 transition-colors pt-1"
                      >
                        Explore Career Pathway
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <Compass className="h-6 w-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">
                        No target career selected yet
                      </p>
                      <Link
                        href="/student/discover"
                        className="inline-block text-xs font-bold text-purple-600 hover:underline"
                      >
                        Discover Suitable Careers &rarr;
                      </Link>
                    </div>
                  )}
                </Card>

                {/* 2. ACADEMIC DETAILS */}
                <Card className="p-5 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                    Academic Journey
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Education Stage
                      </span>
                      <span className="text-slate-900 font-bold mt-0.5 block">
                        {profile.academic.stageLabel}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Stream & Discipline
                      </span>
                      <span className="text-slate-900 font-bold mt-0.5 block">
                        {profile.academic.streamLabel}
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Institution / College
                      </span>
                      <span className="text-slate-900 font-bold mt-0.5 block">
                        {profile.academic.institutionName || "Not specified"}
                      </span>
                      {profile.academic.boardOrUniversity && (
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Affiliation: {profile.academic.boardOrUniversity}
                        </span>
                      )}
                    </div>

                    {profile.academic.specialization && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Major / Specialization
                        </span>
                        <span className="text-slate-900 font-bold mt-0.5 block">
                          {profile.academic.specialization}
                        </span>
                      </div>
                    )}

                    {profile.academic.grade && (
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Academic Score / Grade
                        </span>
                        <span className="text-slate-900 font-bold mt-0.5 block">
                          {profile.academic.grade}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* 3. INTERESTS & PASSIONS */}
                <Card className="p-5 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Interests & Passion Areas
                  </h3>

                  {profile.interests && profile.interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No interests specified yet. Edit profile to add your passion areas.
                    </p>
                  )}
                </Card>
              </div>

              {/* RIGHT COLUMN: DEMONSTRATED SKILLS (ASSESSED VS SELF-REPORTED) */}
              <div className="lg:col-span-2 space-y-6">
                {/* SKILLS CONTAINER */}
                <Card className="p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          Demonstrated Skills Portfolio
                        </h3>
                        <Badge className="bg-purple-100 text-purple-800 border-none font-bold text-[10px]">
                          {profile.skills.totalCount} Skills Total
                        </Badge>
                      </div>
                      <Link
                        href="/student/assessments"
                        className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto"
                      >
                        Verify More Skills
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      KAABIL strictly separates skills you have verified through structured challenges from skills you report yourself.
                    </p>
                  </div>

                  {/* 1. ASSESSED & VERIFIED SKILLS PANEL */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                          Assessed & Verified Skills ({profile.skills.assessedCount})
                        </h4>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Tamper-Evident Credentials
                      </span>
                    </div>

                    {profile.skills.assessed.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.skills.assessed.map((skill, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2 hover:bg-emerald-50/80 transition-all"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-slate-900 text-sm block">
                                    {skill.name}
                                  </span>
                                  {skill.evidenceType === "EXTERNAL_CREDENTIAL" || skill.evidenceType === "CERTIFICATE" ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                      Externally Verified
                                    </span>
                                  ) : skill.evidenceType === "PRACTICAL_CHALLENGE" ? (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                      Practical Challenge
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      Platform Assessed
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-emerald-700 font-semibold block">
                                  {skill.assessmentTitle}
                                </span>
                                {skill.issuerOrVerifier && (
                                  <span className="text-[9px] text-slate-500 block">
                                    Verified by: {skill.issuerOrVerifier}
                                  </span>
                                )}
                              </div>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-600 text-white shadow-xs">
                                {skill.scorePercentage}%
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-emerald-100">
                              <span className="font-semibold text-emerald-800">
                                Level: {skill.proficiency}
                              </span>
                              <span>
                                Verified {new Date(skill.verifiedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                        <p className="text-xs text-slate-600">
                          No assessed skills yet. Take an interactive skill challenge to earn verified badges.
                        </p>
                        <Link
                          href="/student/assessments"
                          className="inline-block px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm"
                        >
                          Take a Skill Assessment &rarr;
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* 2. SELF-REPORTED SKILLS PANEL */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-md bg-purple-100 text-purple-800">
                          <BookOpen className="h-3.5 w-3.5" />
                        </span>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Self-Reported Skills ({profile.skills.selfReportedCount})
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        Claimed in Profile
                      </span>
                    </div>

                    {profile.skills.selfReported.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {profile.skills.selfReported.map((skill, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold text-slate-800 text-xs block">
                                {skill.name}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                Level: {skill.proficiency} (Self-Reported)
                              </span>
                            </div>
                            <Link
                              href="/student/assessments"
                              className="px-2.5 py-1 rounded-lg bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold text-[10px] flex items-center gap-1 shrink-0"
                            >
                              Verify
                              <ArrowRight className="h-2.5 w-2.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-xl">
                        No self-reported skills added yet. Use Edit Mode to add skills you are practicing.
                      </p>
                    )}
                  </div>
                </Card>

                {/* ASSESSMENT HISTORY SUMMARY */}
                <Card className="p-5 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      Assessment History & Milestones
                    </h3>
                    <Link
                      href="/student/passport"
                      className="text-xs font-bold text-purple-600 hover:text-purple-700"
                    >
                      View Digital Passport &rarr;
                    </Link>
                  </div>

                  <div className="space-y-2">
                    {profile.assessmentHistory.length > 0 ? (
                      profile.assessmentHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-800 block">
                              {item.title}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Completed: {new Date(item.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`text-[10px] font-bold ${
                                item.passed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {item.score}% Score
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">
                        No previous assessment attempts recorded.
                      </p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==================================================================== */}
        {/* EDIT MODE WITH AUTOMATIC SAVING */}
        {/* ==================================================================== */}
        {mode === "EDIT" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* EDITING INTRO CARD */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Edit3 className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-amber-900">
                  Editing Profile • Automatic Saving Active
                </div>
                <p className="text-amber-700 mt-0.5 leading-relaxed">
                  Every change you make below is automatically saved within a second. Assessed skills and official test scores are locked to maintain authentic credentials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SECTION 1: PERSONAL & CONTACT */}
              <Card className="p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <User className="h-4 w-4 text-purple-600" />
                  Basic Information
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Full Name
                    </label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => handleFormFieldChange("name", e.target.value)}
                      placeholder="e.g. Aryan Sharma"
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Personal Headline / Bio
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => handleFormFieldChange("bio", e.target.value)}
                      rows={3}
                      placeholder="Share a short summary about your learning journey, goals, or passions..."
                      className="w-full text-xs p-3 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        City
                      </label>
                      <Input
                        value={editForm.city}
                        onChange={(e) => handleFormFieldChange("city", e.target.value)}
                        placeholder="e.g. New Delhi"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        State
                      </label>
                      <Input
                        value={editForm.state}
                        onChange={(e) => handleFormFieldChange("state", e.target.value)}
                        placeholder="e.g. Delhi"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={editForm.languagePreference}
                      onChange={(e) =>
                        handleFormFieldChange("languagePreference", e.target.value)
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="hinglish">Hinglish (Colloquial)</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* SECTION 2: ACADEMIC DETAILS */}
              <Card className="p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  Academic Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Education Stage
                      </label>
                      <select
                        value={editForm.stage}
                        onChange={(e) =>
                          handleFormFieldChange("stage", e.target.value)
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {Object.entries(STAGE_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Educational Stream
                      </label>
                      <select
                        value={editForm.stream}
                        onChange={(e) =>
                          handleFormFieldChange("stream", e.target.value)
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {Object.entries(STREAM_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Institution / College Name
                    </label>
                    <Input
                      value={editForm.institutionName}
                      onChange={(e) =>
                        handleFormFieldChange("institutionName", e.target.value)
                      }
                      placeholder="e.g. Delhi Technological University"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Board / University
                      </label>
                      <Input
                        value={editForm.boardOrUniversity}
                        onChange={(e) =>
                          handleFormFieldChange("boardOrUniversity", e.target.value)
                        }
                        placeholder="e.g. CBSE / Delhi University"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Graduation / Target Year
                      </label>
                      <Input
                        type="number"
                        value={editForm.graduationYear}
                        onChange={(e) =>
                          handleFormFieldChange(
                            "graduationYear",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                        placeholder="2027"
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Major / Specialization
                      </label>
                      <Input
                        value={editForm.specialization}
                        onChange={(e) =>
                          handleFormFieldChange("specialization", e.target.value)
                        }
                        placeholder="e.g. Computer Science / PCM"
                        className="rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Grade / Percentage
                      </label>
                      <Input
                        value={editForm.grade}
                        onChange={(e) =>
                          handleFormFieldChange("grade", e.target.value)
                        }
                        placeholder="e.g. 9.2 CGPA or 88%"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* SECTION 3: TARGET CAREER & GOALS */}
              <Card className="p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                  Target Career & Career Goals
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Primary Target Career (134 Authentic Pathways)
                    </label>
                    <select
                      value={editForm.targetCareerSlug}
                      onChange={(e) =>
                        handleFormFieldChange("targetCareerSlug", e.target.value)
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {ALL_CAREERS.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.title} ({c.streamTitle || c.stream})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Target Milestone Year
                    </label>
                    <Input
                      type="number"
                      value={editForm.targetYear}
                      onChange={(e) =>
                        handleFormFieldChange(
                          "targetYear",
                          e.target.value ? parseInt(e.target.value) : ""
                        )
                      }
                      placeholder="2027"
                      className="rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Personal Career Aspiration / Notes
                    </label>
                    <textarea
                      value={editForm.careerGoalNotes}
                      onChange={(e) =>
                        handleFormFieldChange("careerGoalNotes", e.target.value)
                      }
                      rows={2}
                      placeholder="Why do you aspire to this career? What projects or areas excite you most?"
                      className="w-full text-xs p-3 rounded-xl border border-input focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </Card>

              {/* SECTION 4: INTERESTS */}
              <Card className="p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  Interests & Passion Areas
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Active Interests Chips */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1.5">
                      Your Selected Interests ({editForm.interests.length})
                    </label>
                    <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                      {editForm.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800"
                        >
                          {interest}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(interest)}
                            className="hover:text-purple-950"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      {editForm.interests.length === 0 && (
                        <span className="text-slate-400 text-xs italic">
                          Click suggestions below or type your own interests
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add Custom Interest */}
                  <div className="flex gap-2">
                    <Input
                      value={newInterestInput}
                      onChange={(e) => setNewInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest(newInterestInput);
                        }
                      }}
                      placeholder="Type an interest and press Add"
                      className="rounded-xl text-xs"
                    />
                    <Button
                      type="button"
                      onClick={() => handleAddInterest(newInterestInput)}
                      className="bg-purple-600 text-white rounded-xl text-xs px-3"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>

                  {/* Suggestions */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Quick Suggestions
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {POPULAR_INTEREST_SUGGESTIONS.filter(
                        (s) => !editForm.interests.includes(s)
                      )
                        .slice(0, 6)
                        .map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleAddInterest(s)}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 transition-colors"
                          >
                            + {s}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* SECTION 5: SELF-REPORTED SKILLS (ASSESSED SKILLS PROTECTED) */}
              <Card className="lg:col-span-2 p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    Manage Self-Reported Skills
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Assessed skills are earned via tests and cannot be manually edited
                  </span>
                </div>

                {/* Info alert regarding verified skill protection */}
                <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-xs text-purple-900 flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Credential Integrity Rule: </span>
                    Your {profile.skills.assessedCount} verified skills (such as{" "}
                    {profile.skills.assessed.map((s) => s.name).join(", ") || "none yet"})
                    are locked. Self-reported skills added below help recommend personalized milestones.
                  </div>
                </div>

                {/* Add New Skill Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Skill Name
                    </label>
                    <Input
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      placeholder="e.g. OpenCV, Figma, SQL"
                      className="rounded-xl text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Proficiency Level
                    </label>
                    <select
                      value={newSkillProficiency}
                      onChange={(e) =>
                        setNewSkillProficiency(
                          e.target.value as SkillProficiencyLevel
                        )
                      }
                      className="w-full text-xs p-2.5 rounded-xl border border-input bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="PROFICIENT">Proficient</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddSkill}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs py-2"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Self-Reported Skill
                    </Button>
                  </div>
                </div>

                {/* Self-Reported Skills List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                  {editForm.selfReportedSkills.map((sk, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 text-xs block">
                          {sk.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {sk.proficiency}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk.name)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Remove Skill"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* SECTION 6: PRIVACY CONTROLS */}
              <Card className="lg:col-span-2 p-6 border-purple-100 rounded-3xl shadow-sm bg-white space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  Privacy & DPDP Act Controls
                </h3>

                <div className="space-y-4 text-xs">
                  {profile.privacy.isMinorShieldActive ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                        <Shield className="h-4 w-4 text-amber-600" />
                        Minor Protection Shield Active
                      </div>
                      <p className="text-xs text-amber-700 leading-relaxed">
                        Under India’s Digital Personal Data Protection (DPDP) Act 2023, learners enrolled in Class 8 to 12 or under 18 years of age are shielded from commercial recruitment, recruiter discovery, and unsolicited messages. Recruiter viewing cannot be enabled.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs">
                          Allow Verified Recruiter Discovery
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                          Verified partner companies can view your assessed skill passport and invite you to relevant internships or challenges.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editForm.allowRecruiterView}
                        onChange={(e) =>
                          handleFormFieldChange("allowRecruiterView", e.target.checked)
                        }
                        className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-1 cursor-pointer"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 gap-4">
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">
                        Public Shareable Profile Link
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block leading-relaxed">
                        Allow individuals with your custom link to view your public student portfolio.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={editForm.isProfilePublic}
                      onChange={(e) =>
                        handleFormFieldChange("isProfilePublic", e.target.checked)
                      }
                      className="h-4 w-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 mt-1 cursor-pointer"
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* STICKY BOTTOM ACTIONS BAR IN EDIT MODE */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between p-4 bg-white/95 backdrop-blur-md border border-purple-200 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2 text-xs">
                {saveStatus === "SAVED" ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    All changes automatically saved
                  </span>
                ) : saveStatus === "SAVING" ? (
                  <span className="flex items-center gap-1.5 text-amber-700 font-bold">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    Saving changes...
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Changes save automatically as you type
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setMode("VIEW");
                    if (profile) syncFormWithProfile(profile);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs px-4 py-2 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Done Editing (View Profile)
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}
